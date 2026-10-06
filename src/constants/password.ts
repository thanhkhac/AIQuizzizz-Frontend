// Quy tắc mật khẩu thống nhất cho đăng ký / đặt lại / đổi mật khẩu (khớp validator backend):
// tối thiểu 8 ký tự, có ít nhất 1 chữ cái và 1 chữ số.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
