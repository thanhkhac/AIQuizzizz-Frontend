import Api from "@/api/Api";
import type ManageAccountsParams from "@/models/request/admin/manageAccountsParams";

const END_POINTS = {
    GET_ALL_USERS: "/Users",
    ACTIVE_USER: (userId: string) => `/Users/${userId}/Active`,
    BAN_USER: (userId: string) => `/Users/${userId}/Ban`,
};

class ApiAdmin {
    GetAllUser = async (payload: ManageAccountsParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_USERS}`, {
            params: payload,
        });
    };

    ActiveUser = async (userId: string) => {
        return await Api.patch(`${END_POINTS.ACTIVE_USER(userId)}`);
    };

    BanUser = async (userId: string) => {
        return await Api.patch(`${END_POINTS.BAN_USER(userId)}`);
    };
}

export default new ApiAdmin();
