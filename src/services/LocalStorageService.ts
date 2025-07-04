import dayjs from "dayjs";
const LOCAL_USER_INFO: string = "user_info";

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
    }
}

export default new LocalStorageService();
