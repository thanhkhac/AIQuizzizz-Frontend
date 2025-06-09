import {defineStore} from "pinia";
import apiUser from "@/api/ApiUser";
import localStorageService from "@/services/LocalStorageService";
import {useRouter} from "vue-router";
import dayjs from "dayjs";

export const useAuthStore = defineStore("authStore", {
    state: () => ({
        router: useRouter(),
        returnURL: "",
        user_info: localStorageService.GetUserInfo(),
    }),
    actions: {
        //call when login successful
        async LoginSuccessful() {
            var user_result = await apiUser.GetUserInfo();

            if (user_result.data) {
                this.user_info = user_result.data;
                localStorageService.SetUserInfo(user_result.data);
                this.router.push(this.returnURL || "/"); //returnURL or home page
            }
        },

        logOut() {
            this.user_info = "";
            localStorageService.ClearUserInfo();
            this.router.push("/login");
        },

        checkUser() {
            var item = localStorageService.GetUserInfo();

            if (item == null || dayjs().isAfter(item.expiry)) {
                localStorageService.ClearUserInfo();
                return false;
            }
            return true;
        },

        getUserInfo() {
            return this.checkUser() ? localStorageService.GetUserInfo().value : null;
        },

        setUserInfo(value: object) {
            localStorageService.SetUserInfo(value);
        },
    },
});
