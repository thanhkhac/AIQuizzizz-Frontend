import Api from "@/api/Api";
import type QuestionSetPublicPageParams from "@/models/request/question_set/publicPageParams";
import type QuestionSetPageParams from "@/models/request/question_set/questionSetPageParams";

import qs from "qs";

const END_POINTS = {
    CREATE: "QuestionSet",
    UPDATE: "QuestionSet/{questionSetId}",
    LEARN_QUESTIONS: "QuestionSet/{questionSetId}/LearnQuestions",
    LEARN_HISTORY: "QuestionSet/{questionSetId}/LearnHistory",
    DELETE_LEARN_HISTORY: "QuestionSet/{questionSetId}/LearnHistory",
    GET_DETAIL_BY_ID: "QuestionSet/{questionSetId}",
    GET_QUESTIONS_BY_ID: "QuestionSet/{questionSetId}/Questions",
    GET_RECENT_BY_LIMIT: "QuestionSet/Recent",
    GET_PUBLIC_BY_LIMIT: "QuestionSet/Public",
    GET_ALL_BY_LIMIT: "QuestionSet/SharedOrOwned",
    DELETE: "QuestionSet/{questionSetId}",
};

class ApiQuestionSet {
    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (questionSetId: string, formState: object) => {
        const url = END_POINTS.UPDATE.replace("{questionSetId}", questionSetId);
        return await Api.patch(url, formState);
    };

    Delete = async (questionSetId: string) => {
        const url = END_POINTS.DELETE.replace("{questionSetId}", questionSetId);
        return await Api.delete(url);
    };

    LearnQuestions = async (questionSetId: string, questionCount: number) => {
        const url = END_POINTS.LEARN_QUESTIONS.replace("{questionSetId}", questionSetId);
        return await Api.get(url, { params: { questionCount } });
    };

    LearnHistory = async (questionSetId: string, leanrHistory: any[]) => {
        const url = END_POINTS.LEARN_HISTORY.replace("{questionSetId}", questionSetId);
        return await Api.post(url, leanrHistory);
    };

    resetLearnHistory = async (questionId: string) => {
        const url = END_POINTS.DELETE_LEARN_HISTORY.replace("{questionSetId}", questionId);
        return await Api.delete(url);
    };

    GetDetailById = async (questionSetId: string) => {
        const url = END_POINTS.GET_DETAIL_BY_ID.replace("{questionSetId}", questionSetId);
        return await Api.get(url);
    };

    GetQuestionById = async (questionSetId: string) => {
        const url = END_POINTS.GET_QUESTIONS_BY_ID.replace("{questionSetId}", questionSetId);
        return await Api.get(url);
    };

    GetRecentByLimit = async (pageParams: QuestionSetPublicPageParams) => {
        return await Api.get(`${END_POINTS.GET_RECENT_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 5,
            },
        });
    };

    GetPublicByLimit = async (pageParams: QuestionSetPublicPageParams) => {
        return await Api.get(`${END_POINTS.GET_PUBLIC_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 5,
                name: pageParams.name.toLowerCase() || "",
                tagIds: pageParams.tagIds || [],
                sortBy: pageParams.sortBy || "",
            },
            paramsSerializer: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
        });
    };

    GetAllByLimit = async (pageParams: QuestionSetPageParams) => {
        return await Api.get(`${END_POINTS.GET_ALL_BY_LIMIT}`, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 5,
                name: pageParams.name.toLowerCase() || "",
                filterBy: pageParams.filterBy || "",
            },
        });
    };
}

export default new ApiQuestionSet();
