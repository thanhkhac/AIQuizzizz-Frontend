import Api from "@/api/Api";
import type AssignUserRole from "@/models/request/admin/assignRole";
import type ManageAccountsParams from "@/models/request/admin/manageAccountsParams";

const END_POINTS = {
    // account
    GET_ALL_USERS: "/Users",
    ACTIVE_USER: (userId: string) => `/Users/${userId}/Active`,
    BAN_USER: (userId: string) => `/Users/${userId}/Ban`,
    ASSIGN_ROLE: (userId: string) => `/Users/${userId}/Role`,

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

    ActiveUser = async (userId: string) => {
        return await Api.patch(`${END_POINTS.ACTIVE_USER(userId)}`);
    };

    BanUser = async (userId: string) => {
        return await Api.patch(`${END_POINTS.BAN_USER(userId)}`);
    };
}

export default new ApiAdmin();
