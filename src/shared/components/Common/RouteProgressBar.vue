<script setup lang="ts">
import { routeProgressState } from "@/services/RouteProgressService";
</script>
<template>
    <div
        :class="['route-progress', `route-progress-${routeProgressState}`]"
        role="progressbar"
        aria-hidden="true"
    ></div>
</template>
<style scoped>
/* thanh mảnh ở mép trên khi chuyển trang (chờ tải JS của trang mới) */
.route-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0;
    background: var(--main-color);
    z-index: 3000;
    opacity: 0;
    pointer-events: none;
}

.route-progress-loading {
    width: 80%;
    opacity: 1;
    transition: width 8s cubic-bezier(0.1, 0.8, 0.2, 1);
}

.route-progress-done {
    width: 100%;
    opacity: 0;
    transition:
        width 0.2s ease-out,
        opacity 0.3s ease-in 0.1s;
}

@media (prefers-reduced-motion: reduce) {
    .route-progress-loading,
    .route-progress-done {
        transition: none;
    }
}
</style>
