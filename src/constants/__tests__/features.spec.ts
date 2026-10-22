import { describe, it, expect, vi, afterEach } from "vitest";

describe("GOOGLE_LOGIN_ENABLED", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
        vi.resetModules();
    });

    const load = async () => (await import("../features")).GOOGLE_LOGIN_ENABLED;

    it("mặc định tắt khi chưa đặt biến môi trường", async () => {
        vi.stubEnv("VITE_ENABLE_GOOGLE_LOGIN", "");
        expect(await load()).toBe(false);
    });

    it.each(["false", "0", "TRUE", "yes"])("giá trị %s vẫn tắt (chỉ nhận đúng 'true')", async (v) => {
        vi.stubEnv("VITE_ENABLE_GOOGLE_LOGIN", v);
        expect(await load()).toBe(false);
    });

    it("chỉ bật khi VITE_ENABLE_GOOGLE_LOGIN=true", async () => {
        vi.stubEnv("VITE_ENABLE_GOOGLE_LOGIN", "true");
        expect(await load()).toBe(true);
    });
});
