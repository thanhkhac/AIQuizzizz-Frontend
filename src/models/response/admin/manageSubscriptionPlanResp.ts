export default interface ManageSubscriptionPlanResp {
    id: string;
    name: string;
    price: number;
    duration: string;
    unit: string;
    canLearn: boolean;
    canOpenTest: boolean;
    canCopyOrImportQuestionSet: boolean;
    isActive: boolean;
}
