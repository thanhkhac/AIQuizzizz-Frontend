import ApiClass from "@/api/ApiClass";
import CLASS_STUDENT_POSITION from "@/constants/classStudentPosition";
import Validator from "@/services/Validator";

/**
 * Gọi `GET Class/{id}/Permissions` rồi kiểm tra user có phải Owner/Teacher của lớp hay không.
 * Dùng ở từng trang quản lý (tạo/sửa test, kết quả test) thay vì gọi API ở router global.
 * Lỗi (không thuộc lớp, lớp không tồn tại, ...) coi như không có quyền.
 */
export async function canManageClass(classId: string | undefined | null): Promise<boolean> {
    if (!classId || !Validator.isValidGuid(classId)) return false;
    try {
        const result = await ApiClass.GetUserPermission(classId);
        const role = result?.data?.success ? result.data.data : "";
        return role === CLASS_STUDENT_POSITION.OWNER || role === CLASS_STUDENT_POSITION.TEACHER;
    } catch {
        return false;
    }
}
