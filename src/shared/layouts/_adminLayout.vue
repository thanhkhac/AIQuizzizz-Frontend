<script setup>
import AdminSidebar from "../components/AdminSidebar.vue";
import Header from "../components/Header.vue";
</script>
<template>
    <Header />
    <div class="d-flex">
        <div>
            <AdminSidebar />
        </div>
        <div>
            <RouterView />
        </div>
    </div>
</template>