import { describe, it, expect } from "vitest";
import { formatBanReason } from "../LoginErrorService";
import i18n from "../i18n";

describe("formatBanReason", () => {
    it("lý do rỗng -> thông báo mặc định theo ngôn ngữ", () => {
        i18n.global.locale.value = "en";
        expect(formatBanReason("")).toBe("No reason was provided.");
        expect(formatBanReason(null)).toBe("No reason was provided.");
        expect(formatBanReason("Tài khoản bị khóa bởi quản trị viên")).toBe(
            "No reason was provided.",
        );
    });

    it("mã khoá tự động được dịch, lý do tự do giữ nguyên", () => {
        i18n.global.locale.value = "en";
        expect(formatBanReason("AUTO_BAN_STRIKES:3:90")).toContain("3 community-guideline");
        i18n.global.locale.value = "vn";
        expect(formatBanReason("AUTO_BAN_STRIKES:3:90")).toContain("3 vi phạm");
        expect(formatBanReason("spam")).toBe("spam");
        i18n.global.locale.value = "en";
    });
});
