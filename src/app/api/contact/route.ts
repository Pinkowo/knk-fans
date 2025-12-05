import { NextResponse } from "next/server";

import { locales, type AppLocale } from "@/i18n";
import { sendContactEmail } from "@/lib/email";
import { contactFormSchema, type ContactFormSubmission } from "@/types/contact";

function normalizeLocale(value: FormDataEntryValue | null): AppLocale {
  const candidate = typeof value === "string" ? value : "";
  return (locales.includes(candidate as AppLocale) ? candidate : "zh") as AppLocale;
}

function ensureDate(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return new Date().toISOString();
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const attachmentEntry = formData.get("attachment");
    const parsed = await contactFormSchema.safeParseAsync({
      inquiryType: formData.get("inquiryType"),
      email: formData.get("email"),
      message: formData.get("message"),
      attachment: attachmentEntry instanceof File && attachmentEntry.size > 0 ? attachmentEntry : undefined,
    });

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const attachmentFile = parsed.data.attachment;
    let attachmentMetadata: ContactFormSubmission["attachment"];
    if (attachmentFile) {
      const buffer = Buffer.from(await attachmentFile.arrayBuffer());
      attachmentMetadata = {
        filename: attachmentFile.name,
        mimeType: attachmentFile.type,
        size: attachmentFile.size,
        contentBase64: buffer.toString("base64"),
      };
    }

    const submission: ContactFormSubmission = {
      inquiryType: parsed.data.inquiryType,
      email: parsed.data.email,
      message: parsed.data.message,
      locale: normalizeLocale(formData.get("locale")),
      submittedAt: ensureDate(formData.get("submittedAt")),
      userAgent: (formData.get("userAgent") as string) || undefined,
      ipAddress: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      attachment: attachmentMetadata ?? null,
    };

    const result = await sendContactEmail(submission);

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      emailId: result.id,
    });
  } catch (error) {
    console.error("Failed to process contact form", error);
    return NextResponse.json(
      { success: false, error: "Unable to send message at this time" },
      { status: 500 },
    );
  }
}
