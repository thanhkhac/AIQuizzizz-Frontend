<script setup lang="ts">
import AdminSidebar from "../components/AdminSidebar.vue";
import Header from "../components/Header.vue";
import { ref } from "vue";

const sidebarItem = ref("dashboard");
const handleSidebarUpdate = (activeItem: string) => {
    sidebarItem.value = activeItem;
};
</script>
<template>
    <Header />
    <!-- <div class="d-flex"> -->
    <div class="layout-container">
        <div>
            <AdminSidebar :activeItem="sidebarItem" />
        </div>
        <div class="layout-body">
            <RouterView @updateSidebar="handleSidebarUpdate" />
        </div>
    </div>
</template>

<style scoped>
.layout-container {
    display: flex !important;
}
.layout-body {
    flex: 1 !important;
}
</style>
