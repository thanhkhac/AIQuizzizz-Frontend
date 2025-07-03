import Api from "@/api/Api";
const END_POINTS = {
    LOGIN: "Authentication/Login",
    REGISTER: "Authentication/Register",
    RENEW_TOKEN: "Authentication/RenewToken",
    REQUEST_VERIFICATION_EMAIL: "Authentication/RequestEmailVerification",
    FORGOT_PASSWORD: "Authentication/ForgotPassword",
    RESET_PASSWORD: "Authentication/ResetPassword",
};

class ApiAuthentication {
    Login = async (formState: object) => {
        return await Api.post(`${END_POINTS.LOGIN}`, formState);
    };

    RenewToken = async () => {
        return await Api.post(`${END_POINTS.RENEW_TOKEN}`);
    };

    Register = async (formState: object) => {
        return await Api.post(`${END_POINTS.REGISTER}`, formState);
    };

    RequestEmailVerification = async (formState: object) => {
        return await Api.post(`${END_POINTS.REQUEST_VERIFICATION_EMAIL}`, formState);
    };

    ForgotPassword = async (formState: object) => {
        return await Api.post(`${END_POINTS.FORGOT_PASSWORD}`, formState);
    };

    ResetPassword = async (formState: object) => {
        return await Api.post(`${END_POINTS.RESET_PASSWORD}`, formState);
    };
}

export default new ApiAuthentication();
