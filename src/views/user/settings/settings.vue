<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Component } from "vue";

import Profile from "@/views/user/settings/profile.vue";
import Security from "@/views/user/settings/security.vue";
import Appearance from "@/views/user/settings/appearance.vue";
import Subscription from "@/views/user/settings/subscription.vue";
import Billing from "@/views/user/settings/Billing.vue";

import { useI18n } from "vue-i18n";
const { t } = useI18n();

type TabKey = "Profile" | "Security" | "Appearance" | "Subscription" | "Billing";

const tabs: { key: TabKey; tab: string }[] = [
    { key: "Profile", tab: t("settings.tabs.profile") },
    { key: "Security", tab: t("settings.tabs.security") },
    { key: "Appearance", tab: t("settings.tabs.appearance") },
    { key: "Subscription", tab: t("settings.tabs.subscription") },
    { key: "Billing", tab: t("settings.tabs.billing") },
];

//record = dictionary
const tab_component: Record<TabKey, Component> = {
    Profile,
    Security,
    Appearance,
    Subscription,
    Billing,
};

const activeKey = ref(tabs[0].key);
const emit = defineEmits(["updateSidebar"]);

onMounted(() => {
    const sidebarActiveItem = "settings";
    emit("updateSidebar", sidebarActiveItem);

    const session_setting_key = sessionStorage.getItem("setting_key");
    if (session_setting_key) activeKey.value = session_setting_key as TabKey;
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("settings.title") }}</span> <br />
                    <span>
                        {{ $t("settings.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <a-tabs class="tab-container" v-model:activeKey="activeKey" type="card">
            <a-tab-pane v-for="tab in tabs" :key="tab.key" :tab="tab.tab">
                <component :is="tab_component[tab.key]"></component>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>
<style scoped>
::v-deep(.ant-tabs-nav-list) {
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    color: var(--text-color-grey);
    border-radius: 8px;
    margin-left: 10px;
}

::v-deep(.ant-tabs-tab) {
    width: 100px;
    margin: 0px !important;
    border-radius: 8px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border-color: transparent !important;
}

::v-deep(.ant-tabs-tab-active) {
    background-color: var(--main-color) !important;
    border-color: transparent !important;
}

::v-deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
    color: var(--text-color-contrast) !important;
}

::v-deep(.ant-tabs-tab:hover .ant-tabs-tab-btn) {
    color: var(--text-color-contrast) !important;
}

::v-deep(.ant-tabs-tab:hover) {
    background-color: var(--main-color) !important;
}
</style>
