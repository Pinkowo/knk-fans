import type { AppLocale } from "@/i18n";
export const GUIDE_CATEGORIES = ["why-knk", "stage", "song", "variety"] as const;
export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export interface GuideContentItem {
  id: string;
  category: GuideCategory;
  title: Record<AppLocale, string>;
  description?: Record<AppLocale, string>;
  thumbnail: string;
  videoId: string;
  displayOrder: number;
}

export interface GuideContentResolvedItem extends Omit<GuideContentItem, "title" | "description"> {
  title: string;
  description?: string;
}

export interface GuideContentItemState extends GuideContentResolvedItem {
  isExpanded: boolean;
}

export type GuideContentByCategory = Record<GuideCategory, GuideContentResolvedItem[]>;

export interface VarietyCardItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  externalUrl: string;
  tags?: string[];
}

export interface LanguageLoadingState {
  isLoading: boolean;
  targetLocale: AppLocale | null;
  startedAt: number | null;
  pendingRequests: number;
}

export const ANALYTICS_EVENT_TYPES = ["page_view", "interaction", "navigation", "form", "error"] as const;
export type AnalyticsEventType = (typeof ANALYTICS_EVENT_TYPES)[number];

export const ANALYTICS_EVENT_NAMES = {
  PAGE_VIEW: "page_view",
  LANGUAGE_SWITCH: "language_switch",
  GUIDE_CARD_EXPAND: "guide_card_expand",
  VARIETY_CARD_CLICK: "variety_card_click",
  FORM_SUBMIT: "form_submit",
  WEB_VITALS: "web_vitals",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[keyof typeof ANALYTICS_EVENT_NAMES];

export interface AnalyticsEvent {
  eventName: AnalyticsEventName;
  eventType: AnalyticsEventType;
  pageLocation: string;
  locale: AppLocale;
  timestamp?: number;
  properties?: Record<string, string | number | boolean>;
}

export type {
  ContactFormSubmission,
  ContactFormAttachmentMetadata,
  ContactInquiryType,
  ContactSubmissionRequest,
  ContactSubmissionResponse,
} from "./contact";
export { CONTACT_INQUIRY_TYPES, contactFormSchema } from "./contact";
