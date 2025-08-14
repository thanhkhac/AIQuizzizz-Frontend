import Api from "@/api/Api";

import type TestTemplatePageParams from "@/models/request/testTemplate/testTemplatePageParams";

const END_POINTS = {
    GET_ALL_BY_LIMIT: "TestTemplate",
    GET_BY_ID: "TestTemplate/{testTemplateId}",
    CREATE: "TestTemplate",
    UPDATE: "TestTemplate/{testTemplateId}",
    DELETE: "TestTemplate/{testTemplateId}",
    IMPORT_FILE: "TestTemplate/ImportFile",
    GET_PERMISSION: "TestTemplate/{testTemplateId}/Permissions",
    GET_SHARING: "TestTemplate/{testTemplateId}/Sharing",
    UPDATE_SHARING: "TestTemplate/{testTemplateId}/Sharing",
};

class ApiTestTemplate {
    GetAllByLimit = async (pageParams: TestTemplatePageParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber <= 0 ? 1 : pageParams.pageNumber,
                pageSize: Math.max(10, Math.min(pageParams.pageSize || 10, 100)),
                name: pageParams.name || "",
                shareMode: pageParams.shareMode || "",
            },
        });
    };

    GetById = async (testTemplateId: string) => {
        const url = END_POINTS.GET_BY_ID.replace("{testTemplateId}", testTemplateId);
        return await Api.get(url);
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (templateId: string, formState: object) => {
        const url = END_POINTS.UPDATE.replace("{testTemplateId}", templateId);
        return await Api.patch(url, formState); //body 2 //query 3
    };

    Delete = async (templateId: string) => {
        const url = END_POINTS.DELETE.replace("{testTemplateId}", templateId);
        return await Api.delete(url);
    };

    ImportFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.IMPORT_FILE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    };

    GetPermissions = async (templateId: string) => {
        const url = END_POINTS.GET_PERMISSION.replace("{testTemplateId}", templateId);
        return await Api.get(url);
    };

    GetSharedUser = async (templateId: string) => {
        const url = END_POINTS.GET_SHARING.replace("{testTemplateId}", templateId);
        return await Api.get(url);
    };

    UpdateSharedUser = async (formState: any) => {
        const url = END_POINTS.UPDATE_SHARING.replace("{testTemplateId}", formState.id);
        return await Api.patch(url, formState);
    };
}

export default new ApiTestTemplate();
