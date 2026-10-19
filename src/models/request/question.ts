import type { QuestionMedia } from "@/models/response/media/questionMedia";
import type { Flashcard } from "@/models/flashcard";

export type { Flashcard } from "@/models/flashcard";

interface MultipleChoice {
    id: string;
    text: string;
    isAnswer: boolean;
}

interface MatchingPair {
    id: string;
    leftItem: string;
    rightItem: string;
}

interface OrderingItem {
    id: string;
    text: string;
    correctOrder: number;
}

export interface RequestQuestion {
    id: string;
    type: "MultipleChoice" | "Matching" | "Ordering" | "ShortText" | "LanguageFlashcard";
    // "PlainText" | "Html" | "Markdown". Không có (dữ liệu import / client cũ) = Html. Gửi lên API để lưu đúng chế độ nội dung
    textFormat?: string;
    questionText: string;
    questionHTML: string;
    explainText: string;
    score: number;
    multipleChoices: MultipleChoice[];
    matchingPairs: MatchingPair[];
    orderingItems: OrderingItem[];
    shortAnswer: string;
    // chỉ có với type = LanguageFlashcard (mặt sau thẻ; mặt trước là questionText, luôn PlainText)
    flashcard?: Flashcard | null;
    // id media đã upload (gửi lên API), null = không có media
    mediaId?: string | null;
    // chỉ dùng để preview (presigned URL ngắn hạn), không cần gửi lên API
    media?: QuestionMedia | null;
}
