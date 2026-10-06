import dayjs from "dayjs";
const LOCAL_USER_INFO: string = "user_info";
const ACCESS_TOKEN: string = "access_token";
const REFRESH_TOKEN: string = "refresh_token";

class LocalStorageService {
    SetUserInfo(value: any) {
        let item = {
            value: value,
            expiry: dayjs().add(7, "day").valueOf(),
        };
        localStorage.setItem(LOCAL_USER_INFO, JSON.stringify(item));
    }
    GetUserInfo() {
        try {
            let data = localStorage.getItem(LOCAL_USER_INFO);
            let user_info = data ? JSON.parse(data) : null;

            return user_info;
        } catch (error) {
            console.log(error);
        }
        return null;
    }
    ClearUserInfo() {
        localStorage.removeItem(LOCAL_USER_INFO);
        this.ClearTokens();
    }
    SetTokens(accessToken: string, refreshToken: string) {
        localStorage.setItem(ACCESS_TOKEN, accessToken);
        localStorage.setItem(REFRESH_TOKEN, refreshToken);
    }
    GetAccessToken() {
        return localStorage.getItem(ACCESS_TOKEN);
    }
    GetRefreshToken() {
        return localStorage.getItem(REFRESH_TOKEN);
    }
    ClearTokens() {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
    }
}

export default new LocalStorageService();
