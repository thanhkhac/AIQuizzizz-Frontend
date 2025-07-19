interface UserAnswerMatching {
    leftId: string;
    rightId: string;
}

interface UserAnswerOrdering {
    id: string;
    order: number;
}

export interface UserAnswer {
    id: string;
    multipleChoices: string[];
    matching: UserAnswerMatching[];
    ordering: UserAnswerOrdering[];
    shortText: string;
}
