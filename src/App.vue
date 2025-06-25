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
        <div class="admin-layout-body">
            <div class="background-eclipse-container">
                <div class="eclipse eclipse-left"></div>
                <div class="eclipse eclipse-right"></div>
            </div>
            <RouterView />
        </div>
    </component>
</template>
<style scoped>
.admin-layout-body {
    background-color: #000;
    width: 100vw;
    position: relative;
    z-index: 0;
}

.background-eclipse-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: absolute;
    top: 50%;
    z-index: -1;
}

.eclipse {
    width: 300px;
    height: 300px;
    border-radius: 300px;
    filter: blur(250px);
    animation: colorShift 5s ease-in-out infinite alternate;
}

.eclipse-left {
    transform: translate(-50%, -50%);
    background: var(--background-sub-color1);
}
.eclipse-right {
    transform: translate(-50%, -100%);
    background: var(--background-sub-color2);
}
</style>
