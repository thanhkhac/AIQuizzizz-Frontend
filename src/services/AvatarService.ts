/**
 * Ảnh đại diện: URL hiển thị + chuẩn bị file trước khi upload.
 * Ảnh do server trả qua GET /api/Account/Avatar/{id} (chuyển hướng tới URL ký ngắn hạn), không cần token
 * nên dùng thẳng trong <img src>. Id đổi mỗi lần đổi ảnh -> trình duyệt cache an toàn.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

/** Cạnh ảnh gửi lên server (px): đủ nét cho mọi chỗ hiển thị (lớn nhất ~100px, màn hình mật độ cao x3) */
export const AVATAR_SIZE = 512;

/** Màu nền ảnh mặc định (chữ trắng đọc rõ trên mọi màu: tương phản >= 4.5:1) */
export const AVATAR_COLORS = [
    "#7c3aed", // violet
    "#4f46e5", // indigo
    "#2563eb", // blue
    "#0e7490", // cyan
    "#0f766e", // teal
    "#15803d", // green
    "#b45309", // amber
    "#c2410c", // orange
    "#be123c", // rose
    "#a21caf", // fuchsia
    "#475569", // slate
];

/**
 * Chữ cái của ảnh mặc định: chữ đầu của TỪ CUỐI trong họ tên (tên gọi của người Việt: "Trần Phúc Lâm" -> "L"),
 * viết hoa, giữ dấu. Không có tên -> "" (component hiện icon người).
 */
export const avatarInitial = (name?: string | null) => {
    const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
    const last = words[words.length - 1];
    if (!last) return "";
    const first = Array.from(last.normalize("NFC"))[0] ?? "";
    return first.toLocaleUpperCase("vi");
};

/** Màu cố định theo tên (cùng tên -> cùng màu ở mọi nơi) */
export const avatarColor = (name?: string | null) => {
    const key = (name ?? "").trim().toLowerCase().normalize("NFC");
    let hash = 2166136261; // FNV-1a 32-bit
    for (const ch of key) {
        hash ^= ch.codePointAt(0)!;
        hash = Math.imul(hash, 16777619);
    }
    return AVATAR_COLORS[(hash >>> 0) % AVATAR_COLORS.length];
};

export const avatarUrl = (avatarId?: string | null) =>
    avatarId ? `${API_BASE}/Account/Avatar/${encodeURIComponent(avatarId)}` : null;

/** Vùng cắt vuông lớn nhất ở giữa ảnh */
export const squareCropRect = (width: number, height: number) => {
    const size = Math.min(width, height);
    return {
        sx: Math.floor((width - size) / 2),
        sy: Math.floor((height - size) / 2),
        size,
    };
};

/**
 * Cắt vuông ở giữa + thu nhỏ về AVATAR_SIZE, xuất JPEG. Trình duyệt không đọc được định dạng (vd HEIC)
 * thì gửi nguyên file để server tự chuẩn hoá.
 */
export const prepareAvatarFile = async (file: File): Promise<File> => {
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        return file;
    }

    try {
        const { sx, sy, size } = squareCropRect(bitmap.width, bitmap.height);
        const target = Math.min(AVATAR_SIZE, size);
        const canvas = document.createElement("canvas");
        canvas.width = target;
        canvas.height = target;
        const ctx = canvas.getContext("2d");
        if (!ctx) return file;
        ctx.fillStyle = "#ffffff"; // nền trắng cho ảnh trong suốt (PNG)
        ctx.fillRect(0, 0, target, target);
        ctx.drawImage(bitmap, sx, sy, size, size, 0, 0, target, target);

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
        if (!blob) return file;
        const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
        return new File([blob], name, { type: "image/jpeg" });
    } finally {
        bitmap.close();
    }
};
