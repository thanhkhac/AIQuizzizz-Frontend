interface MultipleChoice {
    text: string;
    isAnswer: boolean;
}

interface MatchingPair {
    leftItem: string;
    rightItem: string;
}

interface OrderingItem {
    text: string;
    correctOrder: number;
}

export interface Question {
    type: "MultipleChoice" | "Matching" | "Ordering" | "ShortText";
    questionText: string;
    explainText: string;
    score: number;
    multipleChoices: MultipleChoice[];
    matchingPairs: MatchingPair[];
    orderingItems: OrderingItem[];
    shortAnswer: string;
}
