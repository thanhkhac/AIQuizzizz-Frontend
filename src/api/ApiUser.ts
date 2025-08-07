import Api from "@/api/Api";
const END_POINTS = {
    ME: "Account/Profile",
    SEARCH_BY_USER_EMAIL: "Users/ForSelection",
};

class ApiUser {
    GetUserInfo = async () => {
        return await Api.get(`${END_POINTS.ME}`);
    };
    SearchByEmail = async (email: string) => {
        return await Api.get(`${END_POINTS.SEARCH_BY_USER_EMAIL}`, { params: { email: email } });
    };
}

export default new ApiUser();
