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
      email: "",
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
    formData.append("email", values.email);
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
    <form className="mt-10 space-y-6" onSubmit={onSubmit}>
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white" htmlFor="inquiryType">
          {t("inquiryType")}
        </label>
        <select
          className="form-field mt-2 transition focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/20"
          id="inquiryType"
          {...register("inquiryType")}
        >
          {CONTACT_INQUIRY_TYPES.map((type) => (
            <option key={type} value={type}>
              {t(`options.${type}`)}
            </option>
          ))}
        </select>
        {errors.inquiryType && (
          <p className="mt-2 flex items-center gap-2 text-sm text-accent-pink">
            <span aria-hidden>⚠</span>
            {validationMessages("inquiryType")}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white" htmlFor="email">
          {t("email")}
        </label>
        <input
          className="form-field mt-2 transition focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/20"
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-2 flex items-center gap-2 text-sm text-accent-pink">
            <span aria-hidden>⚠</span>
            {getValidationMessage(errors.email.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white" htmlFor="message">
          {t("message")}
        </label>
        <textarea
          className="form-field mt-2 h-48 resize-none transition focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/20"
          id="message"
          placeholder={t("messagePlaceholder")}
          {...register("message")}
        />
        {errors.message && (
          <p className="mt-2 flex items-center gap-2 text-sm text-accent-pink">
            <span aria-hidden>⚠</span>
            {getValidationMessage(errors.message.message)}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white" htmlFor="attachment">
          {t("attachmentLabel")}
        </label>
        <Controller
          control={control}
          name="attachment"
          render={({ field }) => (
            <input
              accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.log"
              className="form-field mt-2 transition file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:text-white file:transition file:hover:bg-white/20 focus:border-accent-teal/50 focus:ring-2 focus:ring-accent-teal/20"
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
          <p className="mt-2 flex items-center gap-2 text-sm text-accent-pink">
            <span aria-hidden>⚠</span>
            {getValidationMessage(errors.attachment.message)}
          </p>
        )}
      </div>

      <button
        className="group relative w-full overflow-hidden rounded-2xl bg-accent-teal px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        <span className="relative z-10">{isSubmitting ? t("submitting") : t("submit")}</span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-accent-pink via-brand-400 to-accent-teal transition-transform duration-300 group-hover:translate-x-0" aria-hidden />
      </button>

      <div aria-live="polite">
        {status === "success" && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>✓</span>
              <div>
                <p className="font-semibold text-emerald-200">{t("success")}</p>
              </div>
            </div>
          </div>
        )}
        {status === "error" && (
          <div className="rounded-2xl border border-accent-pink/40 bg-accent-pink/10 p-5 shadow-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden>✗</span>
              <div className="flex-1">
                <p className="font-semibold text-accent-pink">{t("error")}</p>
                {serverError && <p className="mt-1 text-sm text-text-secondary">{serverError}</p>}
                <p className="mt-2 text-sm text-text-secondary">
                  <a
                    href="mailto:pink.exp.studio@gmail.com"
                    className="text-accent-teal underline-offset-4 hover:underline"
                  >
                    pink.exp.studio@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
