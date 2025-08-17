import axios from "axios";
import ApiAuthentication from "./ApiAuthentication";
import { useAuthStore } from "@/stores/AuthStore";
import { notification } from "ant-design-vue";
import { translate } from "@/services/i18n";
import ERROR from "@/constants/errors";
const baseURL = "https://thanhkhac.id.vn/api";

const instance = axios.create({
    baseURL,
    timeout: 300000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
    responseType: "json",
});

let isRefreshing = false; //flag for global checking
instance.interceptors.response.use(
    //if request success run this
    (res) => {
        return res;
    },
    //else run this
    async (error) => {
        const originalConfig = error.config; //original request

        if (!error.response) {
            notification["error"]({
                message: "Network Error",
                description: "No internet connection. Please check your network.",
            });
            // window.location.assign("/404");
            return;
        }

        //avoid loop using additional _retry
        if (error.response && originalConfig.url !== "/Authentication/Login") {
            const errorKeys = Object.keys(error.response.data?.errors);

            //push to not-allow if
            if (errorKeys.includes(ERROR.COMMON_FORBIDDEN)) {
                window.location.assign("/not-allowed");
            }

            //display all error except refresh token
            if (
                !errorKeys.includes(ERROR.COMMON_UNAUTHORIZED)
                //  && !errorKeys.includes(ERROR.ACCOUNT_INVALID_CREDENTIALS
                //   )
            ) {
                notification["error"]({
                    message: "ERROR",
                    description: translate(`ERROR_CODE.${errorKeys[0]}`),
                });
            }

            //redirect if 404/403

            //token expired -> renew
            // if ((error.response.status === 401 && !originalConfig._retry)) {
            if (
                error.response &&
                Object.keys(error.response.data?.errors).includes(ERROR.COMMON_UNAUTHORIZED) &&
                !originalConfig._retry &&
                !isRefreshing
            ) {
                originalConfig._retry = true; //marked as renewed to avoid loop
                isRefreshing = true;
                try {
                    let renew_token_result = await ApiAuthentication.RenewToken();
                    if (!renew_token_result.data.success) {
                        // notification["error"]({
                        //     message: "ERROR",
                        //     description: "LOG OUT",
                        // });
                        useAuthStore().logOut();
                        return;
                    }

                    return instance(originalConfig); //axios execute original request
                } catch (_error) {
                    return Promise.reject(_error);
                } finally {
                    isRefreshing = false;
                }
            } else {
                const status = error.response.status;
                switch (status) {
                    case 400: {
                        //to do
                        // window.location.assign("/404");
                        console.log("ERROR: Status code 400");
                        break;
                    }
                    case 500: {
                        //to do
                        console.log("ERROR: Status code 500");
                        notification["error"]({
                            message: "SERVER ERROR",
                            description: translate(`ERROR_CODE.${errorKeys[0]}`),
                        });
                        break;
                    }
                    case 403: {
                        window.location.assign("/404");
                        break;
                    }
                    default: {
                        //user_info exist but expired
                        if (!useAuthStore().checkUser()) {
                            window.location.assign("/login");
                        } else {
                            console.log("ERROR: User not found");
                        }
                    }
                }
            }
            return Promise.reject(error);
        }
    },
);

export default instance;
