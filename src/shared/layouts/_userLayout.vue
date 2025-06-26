<script setup lang="ts">
import UserSidebar from "../components/UserSidebar.vue";
import Header from "../components/Header.vue";
import {ref} from "vue";

const sidebarItem = ref("dashboard");
const handleSidebarUpdate = (activeItem: string) => {
    sidebarItem.value = activeItem;
};
</script>
<template>
    <Header />
    <div class="d-flex">
        <div>
            <UserSidebar :activeItem="sidebarItem" />
        </div>
        <div style="flex: 1">
            <RouterView @updateSidebar="handleSidebarUpdate" />
        </div>
    </div>
</template>
