<script setup>
import adminSidebar from "../components/AdminSidebar.vue";
</script>
<template>
    <a-row class="d-flex">
        <a-col :span="12">
            <adminSidebar />
        </a-col>
        <a-col :span="12">
            <RouterView />
        </a-col>
    </a-row>
</template>
