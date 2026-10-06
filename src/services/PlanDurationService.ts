import { translate } from "@/services/i18n";

const UNIT_KEYS: Record<string, string> = {
    day: "day",
    week: "week",
    month: "month",
    year: "year",
    hour: "hour",
};

/** "1 year", "10 years", "90 months"... theo đơn vị (Day/Month/Year) của gói, có số ít/số nhiều. */
export const formatPlanDuration = (duration: number, unit?: string | null): string => {
    const unitKey = UNIT_KEYS[(unit ?? "").toLowerCase()];
    if (!unitKey) return `${duration}`;
    const form = Number(duration) === 1 ? "singular" : "plural";
    return `${duration} ${translate(`settings.subscription.plan.${unitKey}_${form}`)}`;
};
