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
    type: "MultipleChoice" | "Matching" | "Ordering" | "ShortText";
    questionSetId: string;
    textFormat: string;
    questionText: string;
    explainText: string;
    score: number;
    scoreGraded: number;
    correctMultipleChoiceCount: number;
    questionData: {
        multipleChoice: MultipleChoice[] | null;
        matching: Matching | null;
        ordering: Ordering[] | null;
        shortText: string;
    };
}
