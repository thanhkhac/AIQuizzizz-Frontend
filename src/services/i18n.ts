import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";
import vn from "@/locales/vn.json";

const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {
        en,
        vn,
    },
});

export function translate(key: string, params?: Record<string, unknown>): string {
    return i18n.global.t(key, params || {});
}

export default i18n;
