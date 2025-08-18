import Api from "@/api/Api";
const END_POINTS = {
    ME: "Account/Profile",
    SEARCH_BY_USER_EMAIL: "Users/ForSelection",
    UPDATE_PROFILE: "Users/Info",
};

class ApiUser {
    GetUserInfo = async () => {
        return await Api.get(`${END_POINTS.ME}`);
    };
    SearchByEmail = async (email: string) => {
        return await Api.get(`${END_POINTS.SEARCH_BY_USER_EMAIL}`, { params: { email: email } });
    };
    UpdateProfile = async (formState: any) => {
        return await Api.patch(`${END_POINTS.UPDATE_PROFILE}`, formState);
    };
}

export default new ApiUser();
