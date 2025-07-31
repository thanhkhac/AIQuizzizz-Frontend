import Api from "@/api/Api";

const END_POINTS = {
    GET_ALL_BY_QUESTION_ID: "Comment/Question/{questionId}",
    CREATE: "Comment/Question/{questionId}",
    REPLY: "Comment/{commentId}/Reply",
    DELETE: "Comment/{commentId}",
};

class ApiComment {
    GetAllByQuestionId = async (questionId: string) => {
        const url = END_POINTS.GET_ALL_BY_QUESTION_ID.replace("{questionId}", questionId);
        return await Api.get(url);
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Delete = async (testId: string) => {
        const url = END_POINTS.DELETE.replace("{testId}", testId);
        return await Api.delete(url);
    };
}

export default new ApiComment();
