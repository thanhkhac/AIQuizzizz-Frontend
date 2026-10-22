import Api from "@/api/Api";

import type FolderPageParams from "@/models/request/folder/folderPageParams";
import type FolderQuestionSetPageParams from "@/models/request/folder/folderQuestionSetPageParams";

const END_POINTS = {
    GET_ALL_BY_LIMIT: "Folder",
    CREATE: "Folder",
    UPDATE: "Folder/{FolderId}",
    GET_ALL_QUESTION_SET_BY_LIMIT: "Folder/{FolderId}/QuestionSets",
    QUESTION_SET_IN_FOLDER: "Folder/{FolderId}/QuestionSet/{QuestionSetId}",
    DELETE_FOLDER: "Folder/{FolderId}",
    GET_SHARING: "Folder/{FolderId}/Sharing",
    UPDATE_SHARING: "Folder/{FolderId}/Sharing",
};

class ApiFolder {
    GetAllByLimit = async (pageParams: FolderPageParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber <= 0 ? 1 : pageParams.pageNumber,
                pageSize: Math.max(10, Math.min(pageParams.pageSize || 10, 100)),
                folderName: pageParams.folderName || "",
                shareMode: pageParams.shareMode || "",
            },
        });
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (folderId: string, formState: any) => {
        const url = END_POINTS.UPDATE.replace("{FolderId}", folderId);
        return await Api.patch(url, formState);
    };

    GetAllQuestionSetByLimit = async (folderId: string, pageParams: FolderQuestionSetPageParams) => {
        const url = END_POINTS.GET_ALL_QUESTION_SET_BY_LIMIT.replace("{FolderId}", folderId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber <= 0 ? 1 : pageParams.pageNumber,
                pageSize: Math.max(5, Math.min(pageParams.pageSize || 5, 100)),
                questionSetName: pageParams.questionSetName || "",
            },
        });
    };

    AddQuestionSet = async (folderId: string, questionSetId: string) => {
        const url = END_POINTS.QUESTION_SET_IN_FOLDER.replace("{FolderId}", folderId).replace(
            "{QuestionSetId}",
            questionSetId,
        );
        return await Api.post(url);
    };

    DeleteQuestionSet = async (folderId: string, questionSetId: string) => {
        const url = END_POINTS.QUESTION_SET_IN_FOLDER.replace("{FolderId}", folderId).replace(
            "{QuestionSetId}",
            questionSetId,
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
        const url = END_POINTS.UPDATE_SHARING.replace("{FolderId}", formState.id);
        return await Api.patch(url, formState);
    };
}

export default new ApiFolder();
