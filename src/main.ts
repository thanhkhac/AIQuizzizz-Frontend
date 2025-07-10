import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router/router-index";

/**
 * vue-i18n - multi-languages
 * **/
import { createI18n } from "vue-i18n";

/**
 * highchart
 * **/
import HighchartsVue from "highcharts-vue";

/**
 * boostrap
 * **/
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";

/**
 * Boxicons
 * **/
import "boxicons/css/boxicons.min.css";

/**
 * jquery
 * **/
// @ts-ignore
import $ from "jquery";
window.$ = $; //register jquery as global

import axios from "axios";
window.axios = axios; //register axios as global

import API from "@/api/Api";
window.api = API; //register api as global

/**
 * ant-design
 * **/
import {
    Alert,
    Pagination,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    TimePicker,
    InputNumber,
    Select,
    Switch,
    Dropdown,
    Checkbox,
    Upload,
    Radio,
    Tooltip,
    Row,
    Col,
    Divider,
    Popconfirm,
    Menu,
    QRCode,
    Tag,
    Calendar,
    Empty,
    Badge,
    Steps,
    Progress,
    Result,
    Tabs,
    Drawer,
} from "ant-design-vue";

/**
 * pinia - persistent
 * **/
const pinia = createPinia();
pinia.use(createPersistedState());

/**
 * vue-i18n - multiple languges
 * **/
const i18n = createI18n({
    legacy: false,
    locale: "en",
    fallbackLocale: "en",
    messages: {},
});

async function loadLocale(locale: string): Promise<void> {
    var messages;
    try {
        messages = (await import(`./locales/${locale}.json`)).default;
    } catch (error) {
        messages = (await import(`./locales/en.json`)).default;
    }

    i18n.global.setLocaleMessage(locale, messages);
    i18n.global.locale.value = locale;
}

async function initLocale(): Promise<void> {
    const savedLocale: string = localStorage.getItem("locale") || "en";
    await loadLocale(savedLocale);
}

const colors = ["purple", "blue", "green", "red", "amber", "pink"];

const storedThemeClass = localStorage.getItem("theme") || "theme-dark";
const isDarkSystem = window.matchMedia("(prefers-color-scheme: dark)").matches;

const themeClass =
    storedThemeClass === "theme-system"
        ? isDarkSystem
            ? "theme-dark"
            : "theme-light"
        : storedThemeClass;
document.documentElement.classList.add(themeClass);

const storedColorClass = localStorage.getItem("accent_color") || "purple";
if (colors.includes(storedColorClass)) {
    document.documentElement.classList.add(storedColorClass);
}

(async () => {
    await initLocale();
    const app = createApp(App);

    app.use(Alert);
    app.use(Pagination);
    app.use(Button);
    app.use(Modal);
    app.use(Form);
    app.use(Input);
    app.use(InputNumber);
    app.use(DatePicker);
    app.use(TimePicker);
    app.use(Checkbox);
    app.use(Select);
    app.use(Switch);
    app.use(Dropdown);
    app.use(Upload);
    app.use(Radio);
    app.use(Tooltip);
    app.use(Row);
    app.use(Col);
    app.use(Divider);
    app.use(Popconfirm);
    app.use(Menu);
    app.use(QRCode);
    app.use(Tag);
    app.use(Calendar);
    app.use(Empty);
    app.use(Badge);
    app.use(Steps);
    app.use(Progress);
    app.use(Result);
    app.use(Tabs);
    app.use(Drawer);

    app.use(HighchartsVue);

    app.use(pinia);
    app.use(router);
    app.use(i18n);

    app.mount("#app");
})();
