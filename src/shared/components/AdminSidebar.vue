<script setup>
import user_image from "@/assets/user.png";

import { ref, onBeforeMount } from "vue";
import { useAuthStore } from "/src/stores/AuthStore.ts";
import { Modal } from "ant-design-vue";

const { activeItem } = defineProps(["activeItem"]);

const isShrinkView = ref(false);

const toggleSidebar = () => {
    isShrinkView.value = !isShrinkView.value;
};

const authStore = useAuthStore();
const user = ref({});

onBeforeMount(async () => {
    user.value = await authStore.getUserInfo();
});

const onSignOut = () => {
    Modal.confirm({
        title: "Wanna sign out from AIQ ?",
        content: "Make sure you don't forget anything.",
        centered: true,
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
                <!-- <li :class="['sidebar-listItem active', { active: activeItem === 'dashboard' }]">
                    <RouterLink :to="{ name: 'Admin_Dashboards_View' }">
                        <i class="bx bxs-dashboard"></i>
                        <span class="sidebar-listItemText">Dashboards</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'appointment' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-book-open"></i>
                        <span class="sidebar-listItemText">Quizzes</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'user' }]">
                    <RouterLink :to="{}">
                        <i class="bx bxs-calendar"></i>
                        <span class="sidebar-listItemText">Exam Schedule</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'doctor' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-group"></i>
                        <span class="sidebar-listItemText">Class</span>
                    </RouterLink>
                </li> -->
                <a-divider
                    class="divider"
                    orientation="left"
                    orientation-margin="0px"
                    style="margin-bottom: 0px; color: #fff"
                >
                    Manage
                </a-divider>
                <a-divider class="divider" style="margin-top: 0px; background-color: #fff" />

                <!-- <li :class="['sidebar-listItem', { active: activeItem === 'specialty' }]">
                    <RouterLink :to="{}">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Settings</span>
                    </RouterLink>
                </li> -->
                <li :class="['sidebar-listItem', { active: activeItem === 'account' }]">
                    <RouterLink :to="{ name: 'Admin_Manager_Account' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Manager Account</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'subscription' }]">
                    <RouterLink :to="{ name: 'Admin_Manager_Subscription' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Manager Subscription</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem', { active: activeItem === 'system_settings' }]">
                    <RouterLink :to="{ name: 'Admin_System_Settings' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">System Settings</span>
                    </RouterLink>
                </li>
                <li :class="['sidebar-listItem']">
                    <RouterLink :to="{ name: 'User_Dashboard' }">
                        <i class="bx bx-refresh"></i>
                        <span class="sidebar-listItemText"> Switch to User </span>
                    </RouterLink>
                </li>
                <!-- <li :class="['sidebar-listItem', { active: activeItem === 'class' }]">
                    <RouterLink :to="{ name: 'Admin_Manager_Class' }">
                        <i class="bx bx-cog"></i>
                        <span class="sidebar-listItemText">Manager Class</span>
                    </RouterLink>
                </li> -->
                <li
                    :class="['sidebar-listItem sign-out', { active: activeItem === 'specialty' }]"
                    @click="onSignOut"
                >
                    <RouterLink :to="{}">
                        <i class="bx bx-download bx-rotate-270"></i>
                        <span class="sidebar-listItemText">Sign out</span>
                    </RouterLink>
                </li>
            </ul>
            <div class="sidebar-profileSection">
                <img :src="user_image" />
                <div>
                    <span>{{ user.fullName }}</span>
                    <span class="sign-out-btn" @click="onSignOut">
                        Sign out
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
