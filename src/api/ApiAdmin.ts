import Api from "@/api/Api";
import type AssignUserRole from "@/models/request/admin/assignRole";
import type CreateSubscription from "@/models/request/admin/createSubscription";
import type ManageAccountsParams from "@/models/request/admin/manageAccountsParams";
import type UpdateSubscription from "@/models/request/admin/updateSubscription";

interface isBannedAccount {
    isBanned: boolean;
}

const END_POINTS = {
    // account
    GET_ALL_USERS: "/Users",
    BAN_USER: (userId: string) => `/Users/${userId}/Ban`,
    ASSIGN_ROLE: (userId: string) => `/Users/${userId}/Role`,

    // subscription
    GET_SUBSCRIPTION: (planId: string) => `/Plan/${planId}`,
    DELETE_PLAN: (planId: string) => `/Plan/${planId}`,
    CREATE_PLAN: "/Plan",
    UPDATE_PLAN: "/Plan",
    GET_ALL_PLAN: "/Plan",

    // statistic
    PLATFORM_OVERVIEW: "/Plan/PlatformOverview",
    REVENUE: "/Plan/Revenue",
    NEW_CLASS: "/Plan/NumberOfNewClass",
};

class ApiAdmin {
    // manage account
    GetAllUser = async (payload: ManageAccountsParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_USERS}`, {
            params: payload,
        });
    };

    AssignRole = async (userId: string, payload: AssignUserRole) => {
        return await Api.patch(
            `${END_POINTS.ASSIGN_ROLE(userId)}`,
            {},
            {
                params: { role: payload.role },
            },
        );
    };

    BanUser = async (userId: string, payload: isBannedAccount) => {
        return await Api.patch(`${END_POINTS.BAN_USER(userId)}`, payload);
    };

    // manage subscription
    GetPlan = async (planId: string) => {
        return await Api.get(`${END_POINTS.GET_SUBSCRIPTION(planId)}`);
    };
    DeletePlan = async (planId: string) => {
        return await Api.delete(`${END_POINTS.GET_SUBSCRIPTION(planId)}`);
    };

    CreatePlan = async (payload: CreateSubscription) => {
        return await Api.post(`${END_POINTS.CREATE_PLAN}`, payload);
    };

    UpdatePlan = async (payload: UpdateSubscription) => {
        return await Api.post(`${END_POINTS.UPDATE_PLAN}`, payload);
    };

    GetAllPlan = async (IsActive?: boolean) => {
        return await Api.get(`${END_POINTS.GET_ALL_PLAN}`);
    };

    // statistic
    PlatformOverview = async () => {
        return await Api.get(END_POINTS.PLATFORM_OVERVIEW);
    };

    MonthlyRevenue = async (year: number) => {
        return await Api.get(END_POINTS.REVENUE, { params: { year } });
    };
    MonthlyNewClass = async (year: number) => {
        return await Api.get(END_POINTS.NEW_CLASS, { params: { year } });
    };
}

export default new ApiAdmin();
