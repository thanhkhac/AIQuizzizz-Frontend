import Api from "@/api/Api";
const END_POINTS = {
    LOGIN: "Authentication/Login",
    REGISTER: "Authentication/Register",
    RENEW_TOKEN: "Authentication/RenewToken",
};

class ApiAuthentication {
    Login = async (formState: object) => {
        return await Api.post(`${END_POINTS.LOGIN}`, formState);
    };

    RenewToken = async () => {
        return await Api.post(`${END_POINTS.RENEW_TOKEN}`);
    };
}

export default new ApiAuthentication();
