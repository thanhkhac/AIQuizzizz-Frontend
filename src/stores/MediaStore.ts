import { defineStore } from "pinia";
import ApiMedia from "@/api/ApiMedia";
import type { MediaPermission } from "@/models/response/media/questionMedia";

// quyền theo gói có thể đổi khi user mua gói -> chỉ cache ngắn hạn
const CACHE_TTL_MS = 5 * 60 * 1000;

let pending: Promise<MediaPermission | null> | null = null;

export const useMediaStore = defineStore("mediaStore", {
    state: () => ({
        permission: null as MediaPermission | null,
        loadedAt: 0,
        loading: false,
        failed: false,
    }),
    actions: {
        /** Lấy quyền upload media (dùng chung cho mọi editor câu hỏi, chỉ gọi API 1 lần) */
        async loadPermission(force = false): Promise<MediaPermission | null> {
            const isFresh = this.permission && Date.now() - this.loadedAt < CACHE_TTL_MS;
            if (!force && isFresh) return this.permission;
            if (pending) return pending;

            this.loading = true;
            pending = (async () => {
                try {
                    const result = await ApiMedia.GetPermissions();
                    if (result?.data?.success) {
                        this.permission = result.data.data;
                        this.loadedAt = Date.now();
                        this.failed = false;
                    } else {
                        this.failed = true;
                    }
                } catch {
                    this.failed = true;
                } finally {
                    this.loading = false;
                    pending = null;
                }
                return this.permission;
            })();
            return pending;
        },

        clear() {
            this.permission = null;
            this.loadedAt = 0;
            this.failed = false;
        },
    },
});
