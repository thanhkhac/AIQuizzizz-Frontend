<script setup lang="ts">
import {ref, onBeforeMount} from "vue";
import {useAuthStore} from "@/stores/AuthStore";
import {Modal} from "ant-design-vue";
import {useI18n} from "vue-i18n";

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

const {t} = useI18n();

const {activeItem} = defineProps(["activeItem"]);

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
        onOk: () => {},
        onCancel: () => {},
    });
};
</script>
<template>
    <div :class="['sidebar-container', {shrink: isShrinkView}]">
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
                <li :class="['sidebar-listItem', {active: activeItem === 'dashboard'}]">
                    <RouterLink :to="{name: 'User_Dashboard'}">
                        <i class="bx bxs-dashboard"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.dashboards") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', {active: activeItem === 'library'}]">
                    <RouterLink :to="{name: 'User_Library'}">
                        <i class="bx bx-book-open"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.quiz") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', {active: activeItem === 'user'}]">
                    <RouterLink :to="{}">
                        <i class="bx bxs-calendar"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.examSchedule") }}
                        </span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', {active: activeItem === 'doctor'}]">
                    <RouterLink :to="{}">
                        <i class="bx bx-group"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.class") }}
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

                <li :class="['sidebar-listItem', {active: activeItem === 'specialty'}]">
                    <RouterLink :to="{}">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">
                            {{ $t("sidebar.navigators.settings") }}
                        </span>
                    </RouterLink>
                </li>
                <li
                    :class="['sidebar-listItem sign-out', {active: activeItem === 'specialty'}]"
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

.sidebar-container {
    background-color: var(--sidebar-background-color);
    padding: 16px;
    transition: width 0.3s ease-in-out;
    width: 240px;
    height: calc(100vh - 60px);
    position: relative;
    z-index: 1;
    position: sticky;
    top: 60px;
}

.sidebar-container.shrink {
    width: 85px;
}

.sidebar-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    justify-content: space-between;
}

.sidebar-viewButton {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    right: -20px;
    top: 40%;
    background-color: var(--main-color);
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 10px var(--main-color);
    z-index: 1;
}

.sidebar-container.shrink .sidebar-viewButton {
    transform: rotate(180deg);
}

.sidebar-list {
    list-style: none;
    padding: 0;
    margin: 12px 0 0;
}

.sidebar-listItem {
    display: flex;
    align-items: center;
    border-radius: 4px;
    margin: 5px 0px;
}

.sidebar-listItem.active {
    background-color: var(--main-color);
    color: var(--text-color-white) !important;
}

.sidebar-listItem a {
    width: 100%;
    padding: 16px;
    display: flex;
    align-items: center;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    color: #ccc;
    font-size: 14px;
}

.sidebar-listItem.active a,
.sidebar-listItem.active i {
    color: var(--text-color-white);
}

.sidebar-listItem i {
    color: #ccc;
    font-size: 22px;
    margin-right: 8px;
    width: 18px;
    text-align: center;
}

.sidebar-listItem:hover {
    background-color: var(--main-color);
}

.sidebar-listItem:hover i,
.sidebar-listItem:hover a {
    color: var(--text-color-white) !important;
}

.shrink .sidebar-listItem i {
    margin-right: 0;
}

.sidebar-listItemText {
    white-space: nowrap;
    opacity: 1;
    visibility: visible;
    display: block;
    transition: all 0.3s ease;
    font-weight: 500;
}

.shrink .sidebar-listItemText {
    visibility: hidden;
    opacity: 0;
}

.sidebar-profileSection {
    height: 80px;
    display: flex;
    align-items: center;
    color: var(--text-color-white);
}

.sidebar-profileSection img {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    border-radius: 50%;
    margin-right: 15px;
    border: 1px solid var(--main-color);
    padding: 2px;
}

.sidebar-profileSection div {
    display: flex;
    flex-direction: column;
}

.sidebar-profileSection span {
    visibility: visible;
    opacity: 1;
    transition: all 0.2s ease-in-out;
    font-weight: 500;
}

.shrink .sidebar-profileSection span {
    visibility: hidden;
    opacity: 0;
}

.divider {
    transition: all 0.2s ease-in-out;
}

.shrink .divider {
    opacity: 0;
}

.sign-out {
    display: none;
}

.shrink .sign-out {
    display: block;
}

.sign-out-btn {
    margin: 3px 0px;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.sign-out-btn i {
    font-size: 20px;
}

.sign-out-btn:hover {
    background-color: var(--main-color);
}
</style>
