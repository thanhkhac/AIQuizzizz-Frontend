<script setup lang="ts">
import {useRoute} from "vue-router";
import {computed} from "vue";
import AuthenticationLayout from "@/shared/layouts/_authenticationLayout.vue";

const route = useRoute();

const layoutComponent = computed(() => {
    switch (route.meta.layout) {
        case "authentication": {
            return AuthenticationLayout;
        }
        default: {
            return null;
        }
    }
});
</script>
<template>
    <component :is="layoutComponent || 'div'">
        <RouterView />
    </component>
</template>
