import { ref } from "vue";

/** Chỉ hiện thanh khi chuyển trang lâu hơn ngưỡng này (trang đã tải sẵn chuyển gần như tức thì -> không nháy) */
export const ROUTE_PROGRESS_DELAY = 120;

/** Trạng thái thanh tiến trình khi chuyển trang: idle -> loading (chạy tới ~80%) -> done (đầy rồi mờ dần) */
export const routeProgressState = ref<"idle" | "loading" | "done">("idle");

let showTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const clearTimers = () => {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
};

export const startRouteProgress = () => {
    clearTimers();
    if (routeProgressState.value === "done") routeProgressState.value = "idle";
    showTimer = setTimeout(() => {
        routeProgressState.value = "loading";
    }, ROUTE_PROGRESS_DELAY);
};

export const finishRouteProgress = () => {
    clearTimers();
    if (routeProgressState.value !== "loading") {
        routeProgressState.value = "idle";
        return;
    }
    routeProgressState.value = "done";
    hideTimer = setTimeout(() => {
        routeProgressState.value = "idle";
    }, 400);
};
