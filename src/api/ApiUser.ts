import Api from "@/api/Api";
const END_POINTS = {
    ME: "Account/Profile",
};

class ApiUser {
    GetUserInfo = async () => {
        return await Api.get(`${END_POINTS.ME}`);
    };
}

export default new ApiUser();
