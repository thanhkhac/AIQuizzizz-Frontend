import type { Flashcard, FlashcardMeaning } from "@/models/flashcard";

/** Giới hạn do backend ép (CreateUpdateQuestionDto / FlashcardDto) */
export const FLASHCARD_LIMITS = {
    maxMeanings: 5,
    maxExamples: 3,
    maxTextLength: 1000,
    maxFrontLength: 5000,
};

/** Chỉ https (URL rỗng được xử lý riêng ở chỗ gọi). Chặn javascript:, data:, http:... */
export const isHttpsUrl = (url: string | null | undefined): boolean => {
    const value = (url ?? "").trim();
    if (!/^https:\/\//i.test(value)) return false;
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
};

/** Chỉ trả về URL nếu hợp lệ https, ngược lại null (dùng cho <a href> / <audio src>) */
export const safeHttpsUrl = (url: string | null | undefined): string | null =>
    isHttpsUrl(url) ? (url ?? "").trim() : null;

export const createEmptyMeaning = (): FlashcardMeaning => ({
    pos: "",
    definition: "",
    translation: "",
    examples: [],
    synonyms: [],
});

/** Thẻ rỗng hợp lệ (thẻ nháp: chưa có nghĩa nào) */
export const createEmptyFlashcard = (): Flashcard => ({
    v: 1,
    back: { meanings: [], phonetic: "", audioUrl: "" },
});

/** Chuẩn hoá dữ liệu từ API: luôn có back.meanings là mảng; giữ nguyên mọi trường khác (lang / source / lookup / v) */
export const normalizeFlashcard = (raw: Flashcard | null | undefined): Flashcard => {
    if (!raw || typeof raw !== "object") return createEmptyFlashcard();
    const back = raw.back ?? { meanings: [] };
    return {
        ...raw,
        v: raw.v ?? 1,
        back: {
            ...back,
            phonetic: back.phonetic ?? "",
            audioUrl: back.audioUrl ?? "",
            meanings: (back.meanings ?? []).map((meaning) => ({
                ...meaning,
                pos: meaning.pos ?? "",
                definition: meaning.definition ?? "",
                translation: meaning.translation ?? "",
                examples: [...(meaning.examples ?? [])],
                synonyms: [...(meaning.synonyms ?? [])],
            })),
        },
    };
};

const text = (value: string | null | undefined) => (value ?? "").trim();

/** Câu trả lời trắc nghiệm của thẻ (khớp backend): bản dịch nếu có, không thì định nghĩa */
export const meaningLabel = (meaning: FlashcardMeaning): string =>
    text(meaning.translation) || text(meaning.definition);

/** Bản gửi lên API: cắt khoảng trắng, bỏ ví dụ / từ đồng nghĩa rỗng, giữ nguyên lang / source / lookup / v */
export const toFlashcardPayload = (card: Flashcard | null | undefined): Flashcard => {
    const normalized = normalizeFlashcard(card);
    return {
        ...normalized,
        back: {
            ...normalized.back,
            phonetic: text(normalized.back.phonetic),
            audioUrl: text(normalized.back.audioUrl),
            meanings: normalized.back.meanings.map((meaning) => ({
                ...meaning,
                pos: text(meaning.pos),
                definition: text(meaning.definition),
                translation: text(meaning.translation),
                examples: (meaning.examples ?? []).map(text).filter((x) => x.length > 0),
                synonyms: (meaning.synonyms ?? []).map(text).filter((x) => x.length > 0),
            })),
        },
    };
};

/** Khoá lý do (create_QS.modal.invalid.reasons.*) của mặt sau thẻ không hợp lệ; rỗng = hợp lệ */
export const validateFlashcardBack = (card: Flashcard | null | undefined): string[] => {
    const reasons = new Set<string>();
    const normalized = normalizeFlashcard(card);
    const { meanings } = normalized.back;
    const max = FLASHCARD_LIMITS.maxTextLength;

    if (meanings.length > FLASHCARD_LIMITS.maxMeanings) reasons.add("flashcard_too_many_meanings");

    for (const meaning of meanings) {
        if (text(meaning.definition).length === 0 && text(meaning.translation).length === 0)
            reasons.add("flashcard_blank_meaning");
        const examples = (meaning.examples ?? []).map(text).filter((x) => x.length > 0);
        if (examples.length > FLASHCARD_LIMITS.maxExamples) reasons.add("flashcard_too_many_examples");

        const strings = [meaning.pos, meaning.definition, meaning.translation, ...examples];
        if (strings.some((x) => text(x).length > max)) reasons.add("flashcard_text_too_long");
    }

    if (text(normalized.back.phonetic).length > max) reasons.add("flashcard_text_too_long");

    const audio = text(normalized.back.audioUrl);
    if (audio.length > 0 && !isHttpsUrl(audio)) reasons.add("flashcard_invalid_url");
    const sourceUrl = text(normalized.source?.url);
    if (sourceUrl.length > 0 && !isHttpsUrl(sourceUrl)) reasons.add("flashcard_invalid_url");

    return [...reasons];
};

/** Thẻ chưa nhập gì ở mặt sau (không nghĩa, không phiên âm) */
export const isFlashcardBackBlank = (card: Flashcard | null | undefined): boolean => {
    const { back } = normalizeFlashcard(card);
    return (
        text(back.phonetic).length === 0 &&
        back.meanings.every(
            (m) =>
                !text(m.pos) &&
                !text(m.definition) &&
                !text(m.translation) &&
                (m.examples ?? []).every((x) => !text(x)),
        )
    );
};
