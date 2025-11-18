export interface NotionAnnotation {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: string;
}

export interface NotionText {
  content: string;
  link: { url: string | null } | null;
}

export interface NotionRichText {
  type: "text" | "mention" | "equation";
  plain_text: string;
  href: string | null;
  annotations: NotionAnnotation;
  text?: NotionText;
}

interface BaseProperty<T extends string> {
  id?: string;
  type: T;
}

export interface NotionTitleProperty extends BaseProperty<"title"> {
  title: NotionRichText[];
}

export interface NotionRichTextProperty extends BaseProperty<"rich_text"> {
  rich_text: NotionRichText[];
}

export interface NotionUrlProperty extends BaseProperty<"url"> {
  url: string | null;
}

export interface NotionNumberProperty extends BaseProperty<"number"> {
  number: number | null;
}

export interface NotionSelectOption {
  id: string;
  name: string;
  color: string;
}

export interface NotionSelectProperty extends BaseProperty<"select"> {
  select: NotionSelectOption | null;
}

export interface NotionMultiSelectProperty extends BaseProperty<"multi_select"> {
  multi_select: NotionSelectOption[];
}

export interface NotionFilesProperty extends BaseProperty<"files"> {
  files: Array<{
    name: string;
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string; expiry_time?: string };
  }>;
}

export type NotionPropertyValue =
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionUrlProperty
  | NotionNumberProperty
  | NotionSelectProperty
  | NotionMultiSelectProperty
  | NotionFilesProperty;

export type NotionProperties = Record<string, NotionPropertyValue>;

export interface NotionPage<T extends NotionProperties = NotionProperties> {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: T;
}

export interface NotionQueryResponse<T extends NotionProperties = NotionProperties> {
  results: Array<NotionPage<T>>;
}
