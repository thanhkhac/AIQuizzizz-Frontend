<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
const emit = defineEmits(["updateSidebar"]);

onMounted(() => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);
});
</script>
<template>
    <h1>manage class</h1>
</template>
