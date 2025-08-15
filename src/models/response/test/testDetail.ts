export default interface TestDetail {
    name: string;
    classId: string;
    timeLimit: number;
    startTime: string;
    endTime: string;
    questionCount: number;
    gradeAttemptMethod: string;
    gradeQuestionMethod: string;
    isShowCorrectAnswerInReview: boolean;
    isAllowReviewAfterSubmit: boolean;
    numberOfShuffles: number;
    maxAttempt: number;
    passingScore: number;
    totalScore: number;
}
