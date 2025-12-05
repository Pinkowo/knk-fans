import { Resend } from "resend";

import type { ContactFormSubmission } from "@/types/contact";

import { runtimeEnv } from "./env";

interface SendContactEmailResult {
  id?: string;
}

function getResendClient(): Resend {
  return new Resend(runtimeEnv.resendApiKey());
}

export async function sendContactEmail(submission: ContactFormSubmission): Promise<SendContactEmailResult> {
  const resend = getResendClient();
  const to = runtimeEnv.contactEmail();
  const subject = `knk-fans-site:${submission.inquiryType}`;
  const attachments =
    submission.attachment && submission.attachment.contentBase64
      ? [
          {
            filename: submission.attachment.filename,
            content: submission.attachment.contentBase64,
            type: submission.attachment.mimeType,
          },
        ]
      : undefined;

  const html = `
    <h2>New KNK Fansite Contact</h2>
    <p><strong>Type:</strong> ${submission.inquiryType}</p>
    <p><strong>Locale:</strong> ${submission.locale}</p>
    <p><strong>Submitted At:</strong> ${submission.submittedAt}</p>
    <p><strong>User Agent:</strong> ${submission.userAgent ?? "unknown"}</p>
    <p><strong>IP Address:</strong> ${submission.ipAddress ?? "unknown"}</p>
    <hr />
    <p>${submission.message.replace(/\n/g, "<br />")}</p>
  `;

  const response = await resend.emails.send({
    from: "KNK Fansite <contact@knkfans.site>",
    to: [to],
    subject,
    html,
    text: [
      `Type: ${submission.inquiryType}`,
      `Locale: ${submission.locale}`,
      `Submitted At: ${submission.submittedAt}`,
      `User Agent: ${submission.userAgent ?? "unknown"}`,
      `IP Address: ${submission.ipAddress ?? "unknown"}`,
      "",
      submission.message,
    ].join("\n"),
    attachments,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return { id: response.data?.id };
}
