import axios from "axios";
import ApiAuthentication from "./ApiAuthentication";
import { useAuthStore } from "@/stores/AuthStore";
import { notification } from "ant-design-vue";
import { translate } from "@/services/i18n";
import ERROR from "@/constants/errors";
import localStorageService from "@/services/LocalStorageService";
import { getBannedInfo, saveBannedReason } from "@/services/LoginErrorService";
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const instance = axios.create({
    baseURL,
    timeout: 300000,
    headers: {
        "Content-Type": "application/json",
    },
    responseType: "json",
});

// Gắn access token vào header Authorization
instance.interceptors.request.use((config) => {
    const token = localStorageService.GetAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// các request đăng nhập: trang login/google callback tự hiển thị lỗi (vd: lý do tài khoản bị cấm),
// không hiển thị notification chung và không renew token
const LOGIN_URLS = ["authentication/login", "authentication/googlelogin"];
const normalizeUrl = (url?: string) =>
    (url ?? "")
        .replace(/^https?:\/\/[^/]+/i, "") // bỏ origin nếu là URL tuyệt đối
        .replace(/^\/?api\//i, "") // bỏ prefix baseURL tương đối
        .replace(/^\/+/, "")
        .split("?")[0]
        .replace(/\/+$/, "")
        .toLowerCase();
const isLoginRequest = (url?: string) => LOGIN_URLS.includes(normalizeUrl(url));

let isRefreshing = false; //flag for global checking
let isHandlingBanned = false; // tránh xử lý lặp khi nhiều request cùng trả ACCOUNT_BANNED
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
            // reject để caller không nhận undefined (result.data -> TypeError)
            return Promise.reject(error);
        }

        // lỗi đăng nhập do trang gọi tự xử lý (tránh hiển thị trùng 2 lần)
        if (isLoginRequest(originalConfig?.url)) {
            return Promise.reject(error);
        }

        //avoid loop using additional _retry
        if (error.response) {
            const errorKeys = Object.keys(error.response.data?.errors ?? {});

            // tài khoản bị khoá khi đang đăng nhập (token vẫn còn hạn): đăng xuất và chuyển về /login kèm lý do
            if (errorKeys.includes(ERROR.ACCOUNT_BANNED)) {
                if (!isHandlingBanned) {
                    isHandlingBanned = true;
                    const banned = getBannedInfo(error);
                    if (banned) saveBannedReason(banned);
                    localStorageService.ClearUserInfo(); // xoá cả token, không gọi API LogOut để tránh lặp 401
                    window.location.assign("/login");
                }
                return Promise.reject(error);
            }

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
                // mã lỗi chưa có bản dịch -> dùng thông báo chung thay vì hiện "ERROR_CODE.xxx"
                const codeKey = `ERROR_CODE.${errorKeys[0]}`;
                const codeText = errorKeys[0] ? translate(codeKey) : "";
                notification["error"]({
                    message: translate("generate_qs_modal.invalid_structure_modal.title"),
                    description:
                        errorKeys[0] && codeText !== codeKey
                        ? codeText
                        : error.response.status === 413 // body bị proxy chặn (vd: upload video quá lớn)
                          ? translate("ERROR_CODE.FILE_TOO_LARGE")
                          : error.response.status >= 500 // 5xx không có body errors: 1 thông báo chung duy nhất
                            ? translate("ERROR_CODE.COMMON_SERVER_INTERNAL_ERROR")
                            : translate("ERROR_CODE.COMMON_BAD_REQUEST"),
                });
            }

            //redirect if 404/403

            //token expired -> renew
            // if ((error.response.status === 401 && !originalConfig._retry)) {
            if (
                error.response &&
                errorKeys.includes(ERROR.COMMON_UNAUTHORIZED) &&
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
                    // refresh token hết hạn/không hợp lệ -> đăng xuất
                    useAuthStore().logOut();
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
                        // thông báo đã hiển thị ở trên, không hiển thị lần 2
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
