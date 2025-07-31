import axios from "axios";
import ApiAuthentication from "./ApiAuthentication";
import { useAuthStore } from "@/stores/AuthStore";
import { notification } from "ant-design-vue";

// const baseURL = import.meta.env.VITE_API_URL_LOCAL;
// const baseURL = import.meta.env.VITE_API_URL_PRODUCT;
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

instance.interceptors.response.use(
    //if request success run this
    (res) => {
        return res;
    },
    //else run this
    async (error) => {
        const originalConfig = error.config; //original request

        //avoid loop using additional _retry
        if (error.response && originalConfig.url !== "/Authentication/Login") {
            console.log(error.data);
            console.log(error.response.data.errors);

            notification["error"]({
                message: "ERROR",
                description: Object.keys(error.response.data?.errors),
            });
            //token expired -> renew
            // if ((error.response.status === 401 && !originalConfig._retry)) {
            if (
                error.response &&
                Object.keys(error.response.data?.errors).includes("COMMON_UNAUTHORIZED") &&
                !originalConfig._retry
            ) {
                originalConfig._retry = true; //marked as renewed to avoid loop
                try {
                    let renew_token_result = await ApiAuthentication.RenewToken();
                    if (!renew_token_result.data.success) {
                        notification["error"]({
                            message: "ERROR",
                            description: "LOG OUT",
                        });
                        useAuthStore().logOut();
                        return;
                    }

                    return instance(originalConfig); //axios execute original request
                } catch (_error) {
                    return Promise.reject(_error);
                }
            } else {
                const status = error.response.status;
                switch (status) {
                    case 400: {
                        //to do
                        console.log("ERROR: Status code 400");
                        break;
                    }
                    case 500: {
                        //to do
                        console.log("ERROR: Status code 500");
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
