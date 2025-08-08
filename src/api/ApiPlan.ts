import Api from "@/api/Api";

const END_POINTS = {
    GET_ALL: "Plan",
    BUY_PLAN: "Plan/{planId}/Buy",
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
}

export default new ApiPlan();
