export interface ClassExam {
    testId: string;
    name: string;
    numberOfQuestions: number;
    timeLimit: number;
    relativeTime: number;
    numberOfCompletion: number;
    status: string;
    timeStart: string;
    timeFinish?: string;
    maxAttempt?: number;
    userAttemptCount?: number;
    hasInProgressAttempt?: boolean;
}
