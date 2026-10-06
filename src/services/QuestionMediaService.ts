import { reactive, ref, toRaw } from "vue";
import type { QuestionMedia, QuestionMediaType } from "@/models/response/media/questionMedia";

// phải khớp với danh sách content-type backend chấp nhận (UploadMediaCommand)
export const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/heic",
    "image/heif",
    "image/tiff",
];

export const VIDEO_MIME_TYPES = [
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "video/x-matroska",
    "video/x-msvideo",
    "video/mpeg",
    "video/3gpp",
];

// fallback khi trình duyệt không nhận diện được MIME (vd: .heic, .mkv trên Windows trả về "")
const EXTENSION_MIME_MAP: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    jfif: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    heic: "image/heic",
    heif: "image/heif",
    tif: "image/tiff",
    tiff: "image/tiff",
    mp4: "video/mp4",
    m4v: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    mpeg: "video/mpeg",
    mpg: "video/mpeg",
    "3gp": "video/3gpp",
};

// một số trình duyệt trả về alias không chuẩn
const MIME_ALIASES: Record<string, string> = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "video/avi": "video/x-msvideo",
    "video/msvideo": "video/x-msvideo",
    "video/mkv": "video/x-matroska",
};

export const MEDIA_ACCEPT = [
    ...IMAGE_MIME_TYPES,
    ...VIDEO_MIME_TYPES,
    ...Object.keys(EXTENSION_MIME_MAP).map((ext) => `.${ext}`),
].join(",");

export const IMAGE_ACCEPT = [
    ...IMAGE_MIME_TYPES,
    ...Object.entries(EXTENSION_MIME_MAP)
        .filter(([, mime]) => mime.startsWith("image/"))
        .map(([ext]) => `.${ext}`),
].join(",");

export const VIDEO_ACCEPT = [
    ...VIDEO_MIME_TYPES,
    ...Object.entries(EXTENSION_MIME_MAP)
        .filter(([, mime]) => mime.startsWith("video/"))
        .map(([ext]) => `.${ext}`),
].join(",");

export interface ResolvedMediaFile {
    kind: QuestionMediaType;
    mime: string;
}

/** Xác định loại media + MIME chuẩn của file, null nếu không hỗ trợ */
export const resolveMediaFile = (file: File): ResolvedMediaFile | null => {
    let mime = (file.type || "").toLowerCase();
    mime = MIME_ALIASES[mime] ?? mime;

    if (!IMAGE_MIME_TYPES.includes(mime) && !VIDEO_MIME_TYPES.includes(mime)) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        mime = EXTENSION_MIME_MAP[ext] ?? "";
    }

    if (IMAGE_MIME_TYPES.includes(mime)) return { kind: "Image", mime };
    if (VIDEO_MIME_TYPES.includes(mime)) return { kind: "Video", mime };
    return null;
};

/** Backend xác định loại file theo Content-Type của part -> đảm bảo luôn gửi MIME chuẩn */
export const prepareUploadFile = (file: File, mime: string): File => {
    if (file.type === mime) return file;
    return new File([file], file.name, { type: mime, lastModified: file.lastModified });
};

/** Đọc thời lượng video ở client (chỉ đọc metadata), null nếu trình duyệt không đọc được (vd: .mkv/.avi) */
export const readVideoDuration = (file: File): Promise<number | null> =>
    new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        let done = false;
        const finish = (value: number | null) => {
            if (done) return;
            done = true;
            URL.revokeObjectURL(url);
            video.removeAttribute("src");
            video.load();
            resolve(value);
        };
        video.preload = "metadata";
        video.muted = true;
        video.onloadedmetadata = () =>
            finish(Number.isFinite(video.duration) ? video.duration : null);
        video.onerror = () => finish(null);
        setTimeout(() => finish(null), 5000);
        video.src = url;
    });

//#region trạng thái upload theo từng câu hỏi
/*
 * Lưu theo object câu hỏi (WeakMap) để không mất tiến trình khi component editor bị
 * unmount/mount lại (DynamicScroller ảo hoá danh sách, đổi loại câu hỏi...).
 */
export type MediaUploadStatus = "idle" | "uploading" | "processing";

export interface MediaUploadState {
    status: MediaUploadStatus;
    percent: number;
    kind: QuestionMediaType | null;
    fileName: string;
}

const uploadStates = new WeakMap<object, MediaUploadState>();
const pendingUploads = ref(0);

export const getUploadState = (question: object): MediaUploadState => {
    const key = toRaw(question);
    let state = uploadStates.get(key);
    if (!state) {
        state = reactive<MediaUploadState>({
            status: "idle",
            percent: 0,
            kind: null,
            fileName: "",
        });
        uploadStates.set(key, state);
    }
    return state;
};

export const markUploadStarted = () => {
    pendingUploads.value++;
};

export const markUploadFinished = () => {
    pendingUploads.value = Math.max(0, pendingUploads.value - 1);
};

/** Còn file đang upload/xử lý -> không cho lưu (kết quả upload sẽ không kịp gắn vào payload) */
export const hasPendingUploads = () => pendingUploads.value > 0;
//#endregion

//#region helpers cho dữ liệu câu hỏi
interface HasMedia {
    id: string;
    media?: QuestionMedia | null;
}

/**
 * Cập nhật media (presigned URL mới) từ response API mới nhất vào danh sách câu hỏi đang hiển thị,
 * không đụng tới các state khác của trang (tiến trình học, câu trả lời...).
 */
export const mergeQuestionMedia = (
    targets: (HasMedia | null | undefined)[],
    fresh: { id: string; media?: QuestionMedia | null }[],
) => {
    const map = new Map(fresh.map((x) => [x.id, x.media ?? null]));
    targets.forEach((target) => {
        if (target && map.has(target.id)) {
            target.media = map.get(target.id) ?? null;
        }
    });
};

/** Bỏ object `media` (chỉ dùng để preview) khỏi payload gửi lên, giữ lại mediaId */
export const toQuestionPayload = <T extends { media?: unknown }>(question: T): Omit<T, "media"> => {
    const payload = { ...question };
    delete payload.media;
    return payload;
};
//#endregion
