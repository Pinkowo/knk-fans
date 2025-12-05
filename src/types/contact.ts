import { z } from "zod";

import type { AppLocale } from "@/i18n";

export const CONTACT_INQUIRY_TYPES = ["error-report", "service-request", "other"] as const;
export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number];

const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
] as const;

export const contactFormSchema = z.object({
  inquiryType: z.enum(CONTACT_INQUIRY_TYPES),
  email: z
    .string()
    .trim()
    .min(1, { message: "emailRequired" })
    .email({ message: "emailInvalid" }),
  message: z
    .string()
    .min(10, { message: "messageMin" })
    .max(5000, { message: "messageMax" }),
  attachment: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= MAX_ATTACHMENT_SIZE, { message: "fileTooLarge" })
    .refine(
      (file) => {
        if (!file) {
          return true;
        }

        if (ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
          return true;
        }

        return file.name.endsWith(".log");
      },
      { message: "fileType" },
    ),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormAttachmentMetadata {
  filename: string;
  mimeType: string;
  size: number;
  contentBase64?: string;
}

export interface ContactFormSubmission {
  inquiryType: ContactInquiryType;
  email: string;
  message: string;
  locale: AppLocale;
  submittedAt: string;
  userAgent?: string;
  ipAddress?: string;
  attachment?: ContactFormAttachmentMetadata | null;
}

export interface ContactSubmissionRequest extends ContactFormValues {
  locale: AppLocale;
  submittedAt: string;
  userAgent?: string;
}

export interface ContactSubmissionResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

export interface ContactSubmissionError {
  success: false;
  error: string;
  code: "VALIDATION_ERROR" | "EMAIL_SEND_ERROR" | "FILE_TOO_LARGE" | "RATE_LIMIT_EXCEEDED";
  details?: Record<string, string[]>;
}
