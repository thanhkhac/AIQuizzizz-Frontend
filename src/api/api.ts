import axios from "axios";
import ApiAuthentication from "./ApiAuthentication";
import { useAuthStore } from "@/stores/AuthStore";
import { useRouter } from "vue-router";

const baseURL = import.meta.env.VITE_API_URL_LOCAL;
// const authStore = useAuthStore();
const router = useRouter();

const instance = axios.create({
    baseURL,
    timeout: 300000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
            console.log(error.response);

            //token expired -> renew
            if (error.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true; //marked as renewed to avoid loop
                try {
                    var renew_token_result = await ApiAuthentication.RenewToken();
                    if (!renew_token_result.data.isSucceeded) {
                        useAuthStore().logOut();
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
