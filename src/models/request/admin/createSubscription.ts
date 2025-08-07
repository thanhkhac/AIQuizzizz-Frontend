export default interface CreateSubscription {
    name: string;
    price: number;
    duration: number;
    unit: string;
    canLearn: boolean;
    canOpenTest: boolean;
    canCopyOrImportQuestionSet: boolean;
    isActive: boolean;
}
