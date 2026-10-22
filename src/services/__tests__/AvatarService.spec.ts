import { describe, expect, it } from "vitest";
import { avatarUrl, squareCropRect } from "@/services/AvatarService";

describe("AvatarService", () => {
    it("avatarUrl: có id -> đường dẫn API ảnh đại diện; không có -> null", () => {
        expect(avatarUrl("3f2a")).toMatch(/\/Account\/Avatar\/3f2a$/);
        expect(avatarUrl(null)).toBeNull();
        expect(avatarUrl(undefined)).toBeNull();
        expect(avatarUrl("")).toBeNull();
    });

    it("avatarUrl: mã hoá id (không chèn được đường dẫn khác)", () => {
        expect(avatarUrl("../x?y")).toMatch(/\/Account\/Avatar\/\.\.%2Fx%3Fy$/);
    });

    it("squareCropRect: lấy hình vuông lớn nhất ở giữa", () => {
        expect(squareCropRect(1920, 1080)).toEqual({ sx: 420, sy: 0, size: 1080 });
        expect(squareCropRect(600, 900)).toEqual({ sx: 0, sy: 150, size: 600 });
        expect(squareCropRect(512, 512)).toEqual({ sx: 0, sy: 0, size: 512 });
        expect(squareCropRect(101, 100)).toEqual({ sx: 0, sy: 0, size: 100 });
    });
});

import { AVATAR_COLORS, avatarColor, avatarInitial } from "@/services/AvatarService";

describe("AvatarService - ảnh mặc định", () => {
    it("avatarInitial: chữ đầu của từ cuối, viết hoa, giữ dấu", () => {
        expect(avatarInitial("Trần Phúc Lâm")).toBe("L");
        expect(avatarInitial("Admin")).toBe("A");
        expect(avatarInitial("  nguyễn   văn  ánh ")).toBe("Á");
        expect(avatarInitial("đạt")).toBe("Đ");
        expect(avatarInitial("")).toBe("");
        expect(avatarInitial(null)).toBe("");
    });

    it("avatarColor: cố định theo tên, không phân biệt hoa thường / khoảng trắng, nằm trong bảng màu", () => {
        expect(avatarColor("Student")).toBe(avatarColor(" student "));
        expect(AVATAR_COLORS).toContain(avatarColor("Trần Phúc Lâm"));
        expect(AVATAR_COLORS).toContain(avatarColor(""));
        const colors = new Set(["An", "Bình", "Chi", "Dũng", "Hà", "Khoa", "Lan", "Minh", "Nam", "Oanh", "Phúc", "Quân"].map(avatarColor));
        expect(colors.size).toBeGreaterThan(4); // tên khác nhau ra nhiều màu khác nhau
    });
});
