import { describe, it, expect } from "vitest";
import { reactive } from "vue";
import {
    getUploadState,
    mergeQuestionMedia,
    prepareUploadFile,
    resolveMediaFile,
    toQuestionPayload,
} from "../QuestionMediaService";
import type { QuestionMedia } from "@/models/response/media/questionMedia";

const media = (id: string, url: string): QuestionMedia => ({
    id,
    type: "Image",
    url,
    thumbnailUrl: null,
    expiresAt: null,
});

describe("resolveMediaFile", () => {
    it("nhận diện theo MIME", () => {
        expect(resolveMediaFile(new File(["x"], "a.png", { type: "image/png" }))).toEqual({
            kind: "Image",
            mime: "image/png",
        });
        expect(resolveMediaFile(new File(["x"], "a.mp4", { type: "video/mp4" }))?.kind).toBe(
            "Video",
        );
    });

    it("chuẩn hoá alias và fallback theo đuôi file khi MIME rỗng", () => {
        expect(resolveMediaFile(new File(["x"], "a.jpg", { type: "image/jpg" }))?.mime).toBe(
            "image/jpeg",
        );
        expect(resolveMediaFile(new File(["x"], "clip.MKV", { type: "" }))?.mime).toBe(
            "video/x-matroska",
        );
        expect(resolveMediaFile(new File(["x"], "photo.heic", { type: "" }))?.mime).toBe(
            "image/heic",
        );
    });

    it("từ chối định dạng không hỗ trợ", () => {
        expect(resolveMediaFile(new File(["x"], "a.svg", { type: "image/svg+xml" }))).toBeNull();
        expect(resolveMediaFile(new File(["x"], "a.pdf", { type: "application/pdf" }))).toBeNull();
    });
});

describe("prepareUploadFile", () => {
    it("gắn MIME chuẩn khi trình duyệt không nhận diện được", () => {
        const file = new File(["x"], "clip.mkv", { type: "" });
        const prepared = prepareUploadFile(file, "video/x-matroska");
        expect(prepared.type).toBe("video/x-matroska");
        expect(prepared.name).toBe("clip.mkv");
    });
});

describe("mergeQuestionMedia", () => {
    it("chỉ cập nhật media theo id", () => {
        const a = { id: "1", questionText: "A", media: media("m1", "old") };
        const b = { id: "2", questionText: "B", media: null as QuestionMedia | null };
        mergeQuestionMedia(
            [a, b, null],
            [
                { id: "1", media: media("m1", "new") },
                { id: "3", media: media("m3", "x") },
            ],
        );
        expect(a.media?.url).toBe("new");
        expect(a.questionText).toBe("A");
        expect(b.media).toBeNull();
    });
});

describe("toQuestionPayload", () => {
    it("bỏ media preview, giữ mediaId", () => {
        const payload = toQuestionPayload({ id: "1", mediaId: "m1", media: media("m1", "u") });
        expect(payload).toEqual({ id: "1", mediaId: "m1" });
    });
});

describe("getUploadState", () => {
    it("dùng chung state cho cùng 1 câu hỏi (kể cả qua proxy reactive)", () => {
        const raw = { id: "1" };
        const proxy = reactive(raw);
        expect(getUploadState(proxy)).toBe(getUploadState(raw));
        expect(getUploadState({ id: "1" })).not.toBe(getUploadState(raw));
    });
});
