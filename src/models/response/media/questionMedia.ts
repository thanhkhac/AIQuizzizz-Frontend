export type QuestionMediaType = "Image" | "Video";

/**
 * Media (ảnh/video) gắn với câu hỏi.
 * url/thumbnailUrl là presigned URL ngắn hạn (ảnh ~15 phút, video ~2 giờ):
 * KHÔNG được cache/lưu lại (draft, localStorage...), luôn dùng giá trị từ response API mới nhất.
 */
export interface QuestionMedia {
    id: string;
    type: QuestionMediaType;
    url: string | null;
    thumbnailUrl: string | null;
    expiresAt: string | null;
}

export interface UploadMediaResult extends QuestionMedia {
    width: number;
    height: number;
    durationSeconds: number | null;
    size: number;
}

export interface MediaPermission {
    canUploadImage: boolean;
    canUploadVideo: boolean;
    maxImageSizeMb: number;
    maxVideoSizeMb: number;
    maxVideoSeconds: number;
}
