<script setup>
import UserSidebar from "../components/UserSidebar.vue";
import Header from "../components/Header.vue";
</script>
<template>
    <Header />
    <div class="d-flex">
        <div>
            <UserSidebar />
        </div>
        <div>
            <RouterView />
        </div>
    </div>
</template>