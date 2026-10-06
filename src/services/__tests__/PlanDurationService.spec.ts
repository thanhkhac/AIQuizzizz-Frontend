import { describe, it, expect } from "vitest";
import { formatPlanDuration } from "../PlanDurationService";
import i18n from "../i18n";

describe("formatPlanDuration", () => {
    it("số ít / số nhiều (en)", () => {
        i18n.global.locale.value = "en";
        expect(formatPlanDuration(1, "Year")).toBe("1 year");
        expect(formatPlanDuration(10, "Year")).toBe("10 years");
        expect(formatPlanDuration(1, "Month")).toBe("1 month");
        expect(formatPlanDuration(90, "month")).toBe("90 months");
        expect(formatPlanDuration(1, "Day")).toBe("1 day");
    });

    it("đơn vị không hợp lệ chỉ trả về số", () => {
        expect(formatPlanDuration(5, null)).toBe("5");
        expect(formatPlanDuration(5, "")).toBe("5");
    });
});
