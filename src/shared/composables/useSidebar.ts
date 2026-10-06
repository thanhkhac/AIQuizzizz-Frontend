import { ref } from "vue";

/**
 * Trạng thái sidebar dùng chung cho Header (nút hamburger), UserSidebar và AdminSidebar.
 *  - isDrawerMode: viewport < 992px  -> sidebar là off-canvas drawer (ẩn mặc định, mở bằng hamburger)
 *  - isCompact:    viewport < 1200px -> sidebar tự thu gọn thành mini (85px) khi ở chế độ cố định
 * Breakpoint trùng với Bootstrap (lg = 992px, xl = 1200px) và docs/THEME-AND-RESPONSIVE.md.
 */
const hasWindow = typeof window !== "undefined" && typeof window.matchMedia === "function";
const drawerQuery = hasWindow ? window.matchMedia("(max-width: 991.98px)") : null;
const compactQuery = hasWindow ? window.matchMedia("(max-width: 1199.98px)") : null;

export const sidebarOpen = ref(false);
export const isDrawerMode = ref(drawerQuery?.matches ?? false);
export const isCompact = ref(compactQuery?.matches ?? false);

drawerQuery?.addEventListener("change", (e) => {
    isDrawerMode.value = e.matches;
    if (!e.matches) sidebarOpen.value = false;
});
compactQuery?.addEventListener("change", (e) => {
    isCompact.value = e.matches;
});

export const toggleSidebarDrawer = () => {
    sidebarOpen.value = !sidebarOpen.value;
};
export const closeSidebarDrawer = () => {
    sidebarOpen.value = false;
};
