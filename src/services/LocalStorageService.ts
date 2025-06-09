import dayjs from "dayjs";
const LOCAL_USER_INFO: string = "user_info";

class LocalStorageService {
    SetUserInfo(value: any) {
        var item = {
            value: value,
            expiry: dayjs().add(7, "day").valueOf(),
        };
        localStorage.setItem(LOCAL_USER_INFO, JSON.stringify(item));
    }
    GetUserInfo() {
        var data = localStorage.getItem(LOCAL_USER_INFO);
        var user_info = data ? JSON.parse(data) : null;
        return user_info;
    }
    ClearUserInfo() {
        localStorage.removeItem(LOCAL_USER_INFO);
    }
}

export default new LocalStorageService();
