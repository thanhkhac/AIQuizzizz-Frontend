import Api from "@/api/Api";
import type HistoryPayment from "@/models/request/plan/historyPayment";

const END_POINTS = {
    GET_ALL: "Plan",
    BUY_PLAN: "Plan/{planId}/Buy",
    History_Payment: "Payment/History",
    QR_CODE: "Payment/QrCode",
};

class ApiPlan {
    GetAll = async () => {
        return await Api.get(`${END_POINTS.GET_ALL}`, {
            params: {
                IsActive: true,
            },
        });
    };

    BuyPlan = async (planId: string) => {
        const url = END_POINTS.BUY_PLAN.replace("{planId}", planId);
        return await Api.post(url);
    };

    HistoryPayment = async (payload: HistoryPayment) => {
        return await Api.get(END_POINTS.History_Payment, { params: payload });
    };

    QrCodeGenerate = async (amount: string) => {
        return await Api.post(END_POINTS.QR_CODE, null, { params: { amount } });
    };
}

export default new ApiPlan();
