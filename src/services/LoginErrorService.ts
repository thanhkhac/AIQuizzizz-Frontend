import { notification } from "ant-design-vue";
import { translate } from "@/services/i18n";
import ERROR from "@/constants/errors";

// lý do bị cấm được chuyển từ trang google callback sang trang login
const BANNED_REASON_KEY = "login_banned_reason";

export interface BannedInfo {
    reason: string;
}

/** Lấy thông tin tài khoản bị cấm từ lỗi login (HTTP 400, errors.ACCOUNT_BANNED = [lý do]) */
export const getBannedInfo = (error: any): BannedInfo | null => {
    const errors = error?.response?.data?.errors ?? {};
    if (!(ERROR.ACCOUNT_BANNED in errors)) return null;
    const value = errors[ERROR.ACCOUNT_BANNED];
    const reason = Array.isArray(value) ? value.filter(Boolean).join("\n") : String(value ?? "");
    return { reason };
};

/** Hiển thị lỗi login KHÔNG phải do bị cấm (lỗi bị cấm được trang login hiển thị bằng a-alert) */
export const notifyLoginError = (error: any) => {
    if (!error?.response) return; // lỗi mạng đã được interceptor hiển thị
    const errorKeys = Object.keys(error.response.data?.errors ?? {});
    notification["error"]({
        message: translate("generate_qs_modal.invalid_structure_modal.title"),
        description: errorKeys[0]
            ? translate(`ERROR_CODE.${errorKeys[0]}`)
            : translate("ERROR_CODE.COMMON_BAD_REQUEST"),
    });
};

export const saveBannedReason = (info: BannedInfo) => {
    sessionStorage.setItem(BANNED_REASON_KEY, info.reason);
};

export const popBannedReason = (): BannedInfo | null => {
    const reason = sessionStorage.getItem(BANNED_REASON_KEY);
    if (reason === null) return null;
    sessionStorage.removeItem(BANNED_REASON_KEY);
    return { reason };
};

/**
 * Chuyển lý do khoá thành văn bản theo ngôn ngữ giao diện.
 * - Mã tự động "AUTO_BAN_STRIKES:{số vi phạm}:{số ngày}" -> câu dịch (vi/en)
 * - Lý do rỗng -> "auth.banned.no_reason"
 * - Lý do tự do (admin nhập, hoặc dữ liệu cũ) -> giữ nguyên
 */
export const formatBanReason = (reason?: string | null): string => {
    const value = (reason ?? "").trim();
    // "Tài khoản bị khóa bởi quản trị viên" là lý do mặc định cũ (tiếng Việt) của các bản ghi trước đây
    if (!value || value === "Tài khoản bị khóa bởi quản trị viên") return translate("auth.banned.no_reason");
    const m = /^AUTO_BAN_STRIKES:(\d+):(\d+)$/.exec(value);
    if (m) return translate("auth.banned.auto_strikes", { count: Number(m[1]), days: Number(m[2]) });
    return value;
};
