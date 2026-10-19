/** Trạng thái tra từ điển do extension / backend ghi lại (chỉ đọc ở web) */
export type FlashcardLookupStatus = "found" | "not_found" | "error" | "skipped";

// các trường chữ được chuẩn hoá về chuỗi (null -> "") khi tải từ API, xem normalizeFlashcard
export interface FlashcardMeaning {
    pos?: string;
    definition?: string;
    translation?: string;
    examples?: string[];
    synonyms?: string[];
}

export interface FlashcardBack {
    meanings: FlashcardMeaning[];
    phonetic?: string;
    // chỉ https (hoặc rỗng)
    audioUrl?: string;
}

export interface FlashcardLang {
    from?: string | null;
    to?: string | null;
}

export interface FlashcardSource {
    // chỉ https (hoặc rỗng)
    url?: string | null;
    title?: string | null;
    context?: string | null;
    capturedAt?: string | null;
}

export interface FlashcardLookup {
    provider?: string | null;
    status?: FlashcardLookupStatus | string | null;
}

/** Mặt sau của thẻ LanguageFlashcard (mặt trước là `questionText`). lang / source / lookup / v do extension ghi, web giữ nguyên khi sửa */
export interface Flashcard {
    v: number;
    back: FlashcardBack;
    lang?: FlashcardLang | null;
    source?: FlashcardSource | null;
    lookup?: FlashcardLookup | null;
}
