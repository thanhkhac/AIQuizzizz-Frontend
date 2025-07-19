import Api from "@/api/Api";
const END_POINTS = {
    LOGIN: "Authentication/Login",
    REGISTER: "Authentication/Register",
    RENEW_TOKEN: "Authentication/RefreshToken",
    REQUEST_EMAIL_VERIFICATION: "Authentication/RequestEmailVerification",
    VERIFY_EMAIL: "Authentication/VerifyEmail",
    FORGOT_PASSWORD: "Authentication/RequestPasswordReset",
    RESET_PASSWORD: "Authentication/ResetPassword",
    GOOGLE_LOGIN: "Authentication/GoogleLogin",
    CREATE_PASSWORD: "Authentication/SetPassword",
};

class ApiAuthentication {
    Login = async (formState: object) => {
        return await Api.post(`${END_POINTS.LOGIN}`, formState);
    };

    RenewToken = async () => {
        return await Api.post(`${END_POINTS.RENEW_TOKEN}`, {});
    };

    Register = async (formState: object) => {
        return await Api.post(`${END_POINTS.REGISTER}`, formState);
    };

    RequestEmailVerification = async (formState: object) => {
        return await Api.post(`${END_POINTS.REQUEST_EMAIL_VERIFICATION}`, formState);
    };

    VerifyEmail = async (formState: object) => {
        return await Api.post(`${END_POINTS.VERIFY_EMAIL}`, formState);
    };

    ForgotPassword = async (formState: object) => {
        return await Api.post(`${END_POINTS.FORGOT_PASSWORD}`, formState);
    };

    ResetPassword = async (formState: object) => {
        return await Api.post(`${END_POINTS.RESET_PASSWORD}`, formState);
    };

    GoogleLogin = async (formState: object) => {
        return await Api.post(`${END_POINTS.GOOGLE_LOGIN}`, formState);
    };

    CreatePassword = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE_PASSWORD}`, formState);
    };
}

export default new ApiAuthentication();
