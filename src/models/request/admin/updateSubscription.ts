export default interface UpdateSubscription {
    planId: string;
    name: string;
    price: number;
    duration: number;
    unit: string;
    canLearn: boolean;
    canOpenTest: boolean;
    canCopyOrImportQuestionSet: boolean;
    canUploadImage: boolean;
    canUploadVideo: boolean;
    isActive: boolean;
}
