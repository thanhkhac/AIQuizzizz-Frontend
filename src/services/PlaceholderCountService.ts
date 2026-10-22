/**
 * Nhớ số mục của một danh sách ở lần tải trước. Lúc chờ dữ liệu, trang vẽ đúng chừng ấy khung giữ chỗ
 * (cùng kích thước với thẻ thật), nên section không co / giãn khi dữ liệu về.
 * Chỉ là gợi ý hiển thị: localStorage lỗi / bị chặn thì dùng giá trị mặc định.
 */
const PREFIX = "placeholder_count:";

export const getPlaceholderCount = (key: string, fallback: number, max: number) => {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        const value = raw === null ? NaN : Number(raw);
        if (Number.isInteger(value) && value >= 0) return Math.min(value, max);
    } catch {
        // bỏ qua: dùng mặc định
    }
    return Math.min(fallback, max);
};

export const rememberPlaceholderCount = (key: string, count: number) => {
    try {
        localStorage.setItem(PREFIX + key, String(Math.max(0, Math.floor(count))));
    } catch {
        // bỏ qua: lần sau dùng mặc định
    }
};
