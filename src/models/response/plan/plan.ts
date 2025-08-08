export default interface Plan {
    id: string;
    name: string;
    price: number;
    duration: number;
    unit: string;
    canLearn: boolean;
    canOpenTest: boolean;
    canCopyOrImportQuestionSet: boolean;
    isActive: boolean;
}
