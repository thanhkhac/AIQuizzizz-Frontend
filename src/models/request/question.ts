import type { QuestionMedia } from "@/models/response/media/questionMedia";

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
    type: "MultipleChoice" | "Matching" | "Ordering" | "ShortText";
    questionText: string;
    questionHTML: string;
    explainText: string;
    score: number;
    multipleChoices: MultipleChoice[];
    matchingPairs: MatchingPair[];
    orderingItems: OrderingItem[];
    shortAnswer: string;
    // id media đã upload (gửi lên API), null = không có media
    mediaId?: string | null;
    // chỉ dùng để preview (presigned URL ngắn hạn), không cần gửi lên API
    media?: QuestionMedia | null;
}
