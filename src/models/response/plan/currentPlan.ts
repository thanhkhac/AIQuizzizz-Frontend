export default interface CurrentPlan {
    planId: string;
    startDate: string;
    endDate: string;
    duration: number;
    unit: string | null;
    price: number;
}
