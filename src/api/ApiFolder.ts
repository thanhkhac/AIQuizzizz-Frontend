import Api from "@/api/Api";

import type FolderPageParams from "@/models/request/folder/folderPageParams";
import type FolderTestTemplatePageParams from "@/models/request/folder/testTemplatePageParams";

const END_POINTS = {
    GET_ALL_BY_LIMIT: "Folder",
    CREATE: "Folder",
    UPDATE: "Folder/{FolderId}",
    GET_ALL_TEST_TEMPLATE_BY_LIMIT: "Folder/{FolderId}/TestTemplates",
    DELETE_TEST_TEMPLATE: "Folder/{FolderId}/TestTemplate/{TestTemplateId}",
    DELETE_FOLDER: "Folder/{FolderId}",
    GET_SHARING: "Folder/{FolderId}/Sharing",
    UPDATE_SHARING: "Folder/{FolderId}/Sharing",
    ADD_TEMPLATE_TO_FOLDER: "Folder/{FolderId}/TestTemplate/{TestTemplateId}",
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

    Update = async (folderId: string, name: string) => {
        const url = END_POINTS.UPDATE.replace("{FolderId}", folderId);
        return await Api.patch(
            url,
            {},
            {
                params: {
                    name: name,
                },
            },
        );
    };

    GetAllTestTemplateByLimit = async (
        folderId: string,
        pageParams: FolderTestTemplatePageParams,
    ) => {
        const url = END_POINTS.GET_ALL_TEST_TEMPLATE_BY_LIMIT.replace("{FolderId}", folderId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                testTemplateName: pageParams.testTemplateName || "",
            },
        });
    };

    DeleteTestTemplate = async (folderId: string, testTemplateId: string) => {
        const url = END_POINTS.DELETE_TEST_TEMPLATE.replace("{FolderId}", folderId).replace(
            "{TestTemplateId}",
            testTemplateId,
        );
        return await Api.delete(url);
    };

    DeleteFolder = async (folderId: string) => {
        const url = END_POINTS.DELETE_FOLDER.replace("{FolderId}", folderId);
        return await Api.delete(url);
    };

    GetSharedUser = async (folderId: string) => {
        const url = END_POINTS.GET_SHARING.replace("{FolderId}", folderId);
        return await Api.get(url);
    };

    UpdateSharedUser = async (formState: any) => {
        const url = END_POINTS.GET_SHARING.replace("{FolderId}", formState.id);
        return await Api.patch(url, formState);
    };

    AddTestTemplate = async (folderId: string, testTemplateId: string) => {
        const url = END_POINTS.ADD_TEMPLATE_TO_FOLDER.replace("{FolderId}", folderId).replace(
            "{TestTemplateId}",
            testTemplateId,
        );
        return await Api.post(url);
    };
}

export default new ApiFolder();
