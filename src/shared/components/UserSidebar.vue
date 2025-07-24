<script setup lang="ts">
import { ref, onBeforeMount } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { Modal } from "ant-design-vue";
import { useI18n } from "vue-i18n";

interface type_user {
    id: string;
    email: string;
    gender: boolean;
    image: string;
    fullName: string;
    dob: string;
}

const user = ref<type_user>({
    id: "",
    email: "",
    gender: true,
    image: "",
    fullName: "",
    dob: "",
});

const { t } = useI18n();

const { activeItem } = defineProps(["activeItem"]);

const isShrinkView = ref(false);

const toggleSidebar = () => {
    isShrinkView.value = !isShrinkView.value;
};

const authStore = useAuthStore();

onBeforeMount(async () => {
    user.value = await authStore.getUserInfo();
});

const onSignOut = () => {
    Modal.confirm({
        title: t("sidebar.popUp.signOut.message"),
        content: t("sidebar.popUp.signOut.content"),
        centered: true,
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: () => {
            authStore.logOut();
        },
        onCancel: () => {},
    });
};
</script>
<template>
    <div :class="['sidebar-container', { shrink: isShrinkView }]">
        <button
            class="sidebar-viewButton"
            type="button"
            :aria-label="isShrinkView ? 'Expand Sidebar' : 'Shrink Sidebar'"
            @click="toggleSidebar"
        >
            <i class="bx bx-left-arrow-alt"></i>
        </button>
        <div class="sidebar-wrapper">
            <ul class="sidebar-list">
                <li :class="['sidebar-listItem', { active: activeItem === 'dashboard' }]">
                    <RouterLink :to="{ name: 'User_Dashboard' }">
                        <i class="bx bxs-dashboard"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.dashboards") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'library' }]">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-book-open"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.quiz") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'schedule' }]">
                    <RouterLink :to="{}">
                        <i class="bx bxs-calendar"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.examSchedule") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'class' }]">
                    <RouterLink :to="{ name: 'User_Class' }">
                        <i class="bx bx-group"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.class") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'folder' }]">
                    <RouterLink :to="{ name: 'User_Folder' }">
                        <i class="bx bxs-folder-open"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.folder") }}
                        </span>
                    </RouterLink>
                </li>
                <a-divider
                    class="divider"
                    orientation="left"
                    orientation-margin="0px"
                    style="margin-bottom: 0px; color: #fff"
                >
                    {{ $t("sidebar.others.Manage") }}
                </a-divider>
                <a-divider class="divider" style="margin-top: 0px; background-color: #fff" />

                <li :class="['sidebar-listItem', { active: activeItem === 'settings' }]">
                    <RouterLink :to="{ name: 'User_Settings' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.settings") }}
                        </span>
                    </RouterLink>
                </li>
                <li
                    :class="['sidebar-listItem sign-out', { active: activeItem === 'specialty' }]"
                    @click="onSignOut"
                >
                    <RouterLink :to="{}">
                        <i class="bx bx-download bx-rotate-270"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.buttons.signOut") }}
                        </span>
                    </RouterLink>
                </li>
            </ul>
            <div class="sidebar-profileSection">
                <img :src="user.image" />
                <div>
                    <span>{{ user.fullName }}</span>
                    <span class="sign-out-btn" @click="onSignOut">
                        {{ $t("sidebar.buttons.signOut") }}
                        <i class="bx bx-download bx-rotate-270"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
* {
    box-sizing: border-box;
}
</style>
