import Api from "@/api/Api";
import type ClassPageParams from "@/models/request/class/class";

const END_POINTS = {
    CREATE: "Class",
    GET_ALL_BY_LIMIT: "Class",
    GET_BY_ID: "Class",
    CREATE_INVITATION: "Class/{ClassID}/Invitations",
    JOIN_CLASS: "Class/Students",
};

class ApiUser {
    async Create(formState: object) {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    }

    async JoinClass(formState: object) {
        return await Api.post(`${END_POINTS.JOIN_CLASS}`, formState);
    }

    async GetAllByLimit(pageParams: ClassPageParams) {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                name: pageParams.name || "",
                shareMode: pageParams.shareMode || "",
            },
        });
    }
}

export default new ApiUser();
