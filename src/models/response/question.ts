import type { QuestionMedia } from "@/models/response/media/questionMedia";
import type { Flashcard } from "@/models/flashcard";

export type { Flashcard } from "@/models/flashcard";

interface MultipleChoice {
    id: string;
    text: string;
    isAnswer: boolean;
}

interface MatchingItem {
    id: string;
    text: string;
}

interface MatchingCorrectItem {
    leftId: string;
    rightId: string;
}

interface Matching {
    leftItems: MatchingItem[];
    rightItems: MatchingItem[];
    matches: MatchingCorrectItem[];
}

interface Ordering {
    id: string;
    text: string;
    correctOrder: number;
}

export interface ResponseQuestion {
    id: string;
    type: "MultipleChoice" | "Matching" | "Ordering" | "ShortText" | "LanguageFlashcard";
    // học / luyện tập: thẻ được dựng thành MultipleChoice với originalType = "LanguageFlashcard"; trang chi tiết: null
    originalType?: "LanguageFlashcard" | null;
    questionSetId: string;
    // "PlainText" | "Html" | "Markdown" (dữ liệu cũ có thể thiếu hoặc viết hoa/thường khác)
    textFormat: string;
    questionText: string;
    explainText: string;
    score: number;
    scoreGraded: number;
    correctMultipleChoiceCount: number;
    // presigned URL ngắn hạn, không cache/persist
    media?: QuestionMedia | null;
    questionData: {
        multipleChoice: MultipleChoice[] | null;
        matching: Matching | null;
        ordering: Ordering[] | null;
        shortText: string;
        // có với thẻ LanguageFlashcard (kể cả khi được dựng thành MultipleChoice để học / luyện tập)
        flashcard?: Flashcard | null;
    };
}
