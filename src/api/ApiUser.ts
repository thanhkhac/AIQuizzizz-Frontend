import Api from "@/api/Api";
const END_POINTS = {
    ME: "Account/Profile",
    SEARCH_BY_USER_EMAIL: "Users/ForSelection",
    UPDATE_PROFILE: "Users/Info",
    AVATAR: "Account/Avatar",
};

// server chuẩn hoá + kiểm duyệt ảnh ngay trong request nên có thể mất vài giây
const AVATAR_TIMEOUT_MS = 2 * 60 * 1000;

class ApiUser {
    GetUserInfo = async () => {
        return await Api.get(`${END_POINTS.ME}`);
    };
    SearchByEmail = async (email: string) => {
        return await Api.get(`${END_POINTS.SEARCH_BY_USER_EMAIL}`, { params: { email: email } });
    };
    UpdateProfile = async (formState: any) => {
        return await Api.patch(`${END_POINTS.UPDATE_PROFILE}`, formState);
    };
    UploadAvatar = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.AVATAR, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            timeout: AVATAR_TIMEOUT_MS,
        });
    };
    DeleteAvatar = async () => {
        return await Api.delete(END_POINTS.AVATAR);
    };
}

export default new ApiUser();
