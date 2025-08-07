export default interface UserAnswerDTO {
    questionId: string;
    type: string;
    multipleChoices: string[] | null;
    matchingLeft: any[] | null;
    matchingRight: any[] | null;
    ordering: any[] | null;
    shortText: string;
}
