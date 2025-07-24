import Api from "@/api/Api";

import type FolderPageParams from "@/models/request/folder/folderPageParams";

const END_POINTS = {
    GET_ALL_BY_LIMIT: "Folder",
    CREATE: "Folder",
};

class ApiFolder {
    GetAllByLimit = async (pageParams: FolderPageParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                folderName: pageParams.folderName || "",
                shareMode: pageParams.shareMode || "",
            },
        });
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };
}

export default new ApiFolder();
