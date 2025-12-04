"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { AppLocale } from "@/i18n";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";
import type { ContactFormValues } from "@/types/contact";
import { CONTACT_INQUIRY_TYPES, contactFormSchema } from "@/types/contact";

type FormStatus = "idle" | "success" | "error";

export default function ContactForm() {
  const t = useTranslations("contact.form");
  const validationMessages = useTranslations("contact.validation");
  const locale = useLocale() as AppLocale;
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      inquiryType: CONTACT_INQUIRY_TYPES[0],
      message: "",
      attachment: undefined,
    },
  });

  const getValidationMessage = (key?: string) => {
    if (!key) return null;
    try {
      return validationMessages(key);
    } catch {
      return key;
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setStatus("idle");
    const formData = new FormData();
    formData.append("inquiryType", values.inquiryType);
    formData.append("message", values.message);
    if (values.attachment) {
      formData.append("attachment", values.attachment);
    }

    formData.append("locale", locale);
    formData.append("submittedAt", new Date().toISOString());
    formData.append("userAgent", navigator.userAgent);

    const response = await fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setStatus("error");
      const error = await response.json().catch(() => null);
      setServerError(error?.error ?? "Unable to send message");
      return;
    }

    trackEvent({
      eventName: ANALYTICS_EVENTS.form_submit,
      eventType: "form",
      pageLocation: window.location.pathname,
      locale,
      properties: {
        inquiryType: values.inquiryType,
      },
    });
    setStatus("success");
    reset();
  });

  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div>
        <label className="text-sm font-semibold text-white" htmlFor="inquiryType">
          {t("inquiryType")}
        </label>
        <select
          className="form-field mt-2"
          id="inquiryType"
          {...register("inquiryType")}
        >
          {CONTACT_INQUIRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`options.${type}`)}
            </option>
          ))}
        </select>
        {errors.inquiryType && <p className="mt-2 text-sm text-accent-pink">{validationMessages("inquiryType")}</p>}
      </div>

      <div>
        <label className="text-sm font-semibold text-white" htmlFor="message">
          {t("message")}
        </label>
        <textarea
          className="form-field mt-2 h-48"
          id="message"
          placeholder={t("messagePlaceholder")}
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-2 text-sm text-accent-pink">{getValidationMessage(errors.message.message)}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-white" htmlFor="attachment">
          {t("attachmentLabel")}
        </label>
        <Controller
          control={control}
          name="attachment"
          render={({ field }) => (
            <input
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.log"
              className="form-field mt-2 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white"
              id="attachment"
              type="file"
              onChange={(event) => {
                const file = event.target.files?.[0];
                field.onChange(file);
              }}
            />
          )}
        />
        <p className="mt-2 text-sm text-text-secondary">{t("attachmentHint")}</p>
        {errors.attachment && (
          <p className="mt-2 text-sm text-accent-pink">{getValidationMessage(errors.attachment.message)}</p>
        )}
      </div>

      <button
        className="w-full rounded-2xl bg-accent-pink px-6 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>

      <div aria-live="polite">
        {status === "success" && <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{t("success")}</p>}
        {status === "error" && (
          <p className="rounded-2xl border border-accent-pink/40 bg-accent-pink/10 p-4 text-sm text-accent-pink">
            {t("error")}
            {serverError && <span className="block text-xs text-text-secondary">{serverError}</span>}
          </p>
        )}
      </div>
    </form>
  );
}
