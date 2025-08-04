export interface UserAnswerData {
    type: string;
    multipleChoice: string[];
    matching: { leftId: string; rightId: string }[];
    ordering: { itemId: string; order: number }[];
    shortText: string;
}

export default interface UserAnswersObject {
    questionId: string;
    userAnswerData: UserAnswerData;
}

