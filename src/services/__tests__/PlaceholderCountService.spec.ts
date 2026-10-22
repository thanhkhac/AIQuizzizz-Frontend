import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPlaceholderCount, rememberPlaceholderCount } from "@/services/PlaceholderCountService";

describe("PlaceholderCountService", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("chưa có số đã nhớ: dùng mặc định (không vượt max)", () => {
        expect(getPlaceholderCount("a", 5, 9)).toBe(5);
        expect(getPlaceholderCount("a", 12, 9)).toBe(9);
    });

    it("nhớ rồi đọc lại, kể cả 0; cắt theo max", () => {
        rememberPlaceholderCount("a", 3);
        expect(getPlaceholderCount("a", 5, 9)).toBe(3);
        rememberPlaceholderCount("a", 0);
        expect(getPlaceholderCount("a", 5, 9)).toBe(0);
        rememberPlaceholderCount("a", 40);
        expect(getPlaceholderCount("a", 5, 9)).toBe(9);
    });

    it("giá trị hỏng hoặc localStorage lỗi: dùng mặc định, không ném lỗi", () => {
        localStorage.setItem("placeholder_count:a", "abc");
        expect(getPlaceholderCount("a", 4, 9)).toBe(4);

        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("blocked");
        });
        expect(() => rememberPlaceholderCount("a", 2)).not.toThrow();
        expect(getPlaceholderCount("a", 4, 9)).toBe(4);
    });
});
