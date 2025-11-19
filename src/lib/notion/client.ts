import { Client } from "@notionhq/client";

import { maxNotionRetries, rateLimitPerSecond } from "@/lib/notion/config";
import type { NotionQueryResponse } from "@/types/notion";

const notionSdkClient = new Client({ auth: process.env.NOTION_API_KEY });

type NotionClient = typeof notionSdkClient;
type GetPageParameters = Parameters<NotionClient["pages"]["retrieve"]>[0];
type ListBlockChildrenParameters = Parameters<NotionClient["blocks"]["children"]["list"]>[0];
type DataSourceQueryArgs = Parameters<NotionClient["dataSources"]["query"]>[0];

type DatabaseQueryParameters = {
  database_id?: string;
  data_source_id?: string;
  filter?: unknown;
  sorts?: unknown;
  start_cursor?: string;
  page_size?: number;
  archived?: boolean;
  in_trash?: boolean;
  result_type?: string;
  filter_properties?: string[];
};

type LegacyDatabaseQueryArgs = Omit<DatabaseQueryParameters, "database_id" | "data_source_id"> & {
  database_id: string;
};

type PendingTask<T> = {
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
};

class RateLimitedNotionClient {
  private readonly interval = Math.ceil(1000 / rateLimitPerSecond);
  private queue: Array<PendingTask<unknown>> = [];
  private processing = false;

  private scheduleProcessing() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    const run = () => {
      const task = this.queue.shift();
      if (!task) {
        this.processing = false;
        return;
      }

      task
        .execute()
        .then((result) => task.resolve(result))
        .catch((error) => task.reject(error))
        .finally(() => {
          if (this.queue.length > 0) {
            setTimeout(run, this.interval);
          } else {
            this.processing = false;
          }
        });
    };

    run();
  }

  private enqueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        execute: () => this.executeWithRetry(operation),
        resolve: (value) => resolve(value as T),
        reject: (error) => reject(error),
      });

      this.scheduleProcessing();
    });
  }

  private async executeWithRetry<T>(operation: () => Promise<T>, attempt = 1): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxNotionRetries || !this.shouldRetry(error)) {
        throw error;
      }

      const delay = Math.pow(2, attempt) * 200;
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.executeWithRetry(operation, attempt + 1);
    }
  }

  private shouldRetry(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
      return false;
    }

    const status = (error as { status?: number }).status;
    return status === 429 || (typeof status === "number" && status >= 500);
  }

  queryDatabase<T = NotionQueryResponse>(params: DatabaseQueryParameters) {
    return this.enqueue(() => this.dispatchQuery(params) as Promise<T>);
  }

  retrievePage<T = unknown>(params: GetPageParameters) {
    return this.enqueue(() => notionSdkClient.pages.retrieve(params) as Promise<T>);
  }

  listBlockChildren<T = unknown>(params: ListBlockChildrenParameters) {
    return this.enqueue(() => notionSdkClient.blocks.children.list(params) as Promise<T>);
  }
  private dispatchQuery(params: DatabaseQueryParameters) {
    const { database_id, data_source_id, ...rest } = params;
    const identifier = data_source_id ?? database_id;
    if (!identifier) {
      throw new Error("Notion query requires either database_id or data_source_id.");
    }

    if (hasDatabaseQuery(notionSdkClient)) {
      return notionSdkClient.databases.query({
        ...rest,
        database_id: identifier,
      } as LegacyDatabaseQueryArgs);
    }

    if (hasDataSourceQuery(notionSdkClient)) {
      return notionSdkClient.dataSources.query({
        ...rest,
        data_source_id: identifier,
      } as DataSourceQueryArgs);
    }

    throw new Error("Notion client is missing both database and data source query capabilities.");
  }
}

export const notionClient = new RateLimitedNotionClient();

function hasDataSourceQuery(client: NotionClient): client is NotionClient & {
  dataSources: NotionClient["dataSources"] & { query: NonNullable<NotionClient["dataSources"]["query"]> };
} {
  return typeof client.dataSources?.query === "function";
}

function hasDatabaseQuery(client: NotionClient): client is NotionClient & {
  databases: NotionClient["databases"] & { query: (args: DatabaseQueryParameters) => Promise<unknown> };
} {
  const possibleQuery = (client as { databases?: { query?: unknown } }).databases?.query;
  return typeof possibleQuery === "function";
}
