/**
 * Cờ tính năng của giao diện (đọc lúc build).
 *
 * VITE_ENABLE_GOOGLE_LOGIN=true  -> bật nút "Tiếp tục với Google" ở đăng nhập/đăng ký
 * (mặc định TẮT: để trống hoặc khác "true" thì ẩn nút và chặn trang callback)
 */
export const GOOGLE_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === "true";
