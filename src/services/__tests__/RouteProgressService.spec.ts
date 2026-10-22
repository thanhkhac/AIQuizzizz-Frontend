import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    ROUTE_PROGRESS_DELAY,
    finishRouteProgress,
    routeProgressState,
    startRouteProgress,
} from "@/services/RouteProgressService";

describe("RouteProgressService", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        routeProgressState.value = "idle";
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it("chuyển trang nhanh hơn ngưỡng: không hiện thanh", () => {
        startRouteProgress();
        vi.advanceTimersByTime(ROUTE_PROGRESS_DELAY - 1);
        finishRouteProgress();
        expect(routeProgressState.value).toBe("idle");
        vi.advanceTimersByTime(1000);
        expect(routeProgressState.value).toBe("idle");
    });

    it("chuyển trang chậm: hiện thanh, xong thì đầy rồi ẩn", () => {
        startRouteProgress();
        vi.advanceTimersByTime(ROUTE_PROGRESS_DELAY);
        expect(routeProgressState.value).toBe("loading");

        finishRouteProgress();
        expect(routeProgressState.value).toBe("done");
        vi.advanceTimersByTime(400);
        expect(routeProgressState.value).toBe("idle");
    });

    it("bắt đầu lần chuyển mới khi thanh đang mờ dần: huỷ hẹn ẩn của lần trước", () => {
        startRouteProgress();
        vi.advanceTimersByTime(ROUTE_PROGRESS_DELAY);
        finishRouteProgress();

        startRouteProgress();
        expect(routeProgressState.value).toBe("idle");
        vi.advanceTimersByTime(ROUTE_PROGRESS_DELAY);
        expect(routeProgressState.value).toBe("loading");
        vi.advanceTimersByTime(1000);
        expect(routeProgressState.value).toBe("loading");
    });
});
