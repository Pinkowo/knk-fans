type EnvKey = "RESEND_API_KEY" | "CONTACT_EMAIL" | "NEXT_PUBLIC_GA_ID";

interface GetEnvOptions {
  optional?: boolean;
  fallback?: string;
}

const OPTIONAL_ENV_KEYS: EnvKey[] = ["NEXT_PUBLIC_GA_ID"];

export function getEnv(key: EnvKey, options: GetEnvOptions = {}): string {
  const rawValue = process.env[key];
  if (rawValue && rawValue.length > 0) {
    return rawValue;
  }

  if (options.fallback !== undefined) {
    return options.fallback;
  }

  if (options.optional || OPTIONAL_ENV_KEYS.includes(key)) {
    return "";
  }

  throw new Error(`Missing required environment variable: ${key}`);
}

export const runtimeEnv = {
  resendApiKey: () => getEnv("RESEND_API_KEY"),
  contactEmail: () => getEnv("CONTACT_EMAIL"),
  gaMeasurementId: () => getEnv("NEXT_PUBLIC_GA_ID", { fallback: "" }),
};
