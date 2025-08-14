import Api from "@/api/Api";
import type CommentPageParams from "@/models/request/comment/commentPageParams";

const END_POINTS = {
    GET_ALL_BY_QUESTION_ID: "Comment/Question/{questionId}",
    CREATE: "Comment/Question/{questionId}",
    REPLY: "Comment/{commentId}/Reply",
    DELETE: "Comment/{commentId}",
};

class ApiComment {
    GetAllByQuestionId = async (pageParams: CommentPageParams) => {
        const url = END_POINTS.GET_ALL_BY_QUESTION_ID.replace(
            "{questionId}",
            pageParams.questionId,
        );
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber,
                pageSize: pageParams.pageSize,
            },
        });
    };

    Create = async (formState: any) => {
        const url = END_POINTS.CREATE.replace("{questionId}", formState.questionId);
        return await Api.post(url, formState);
    };

    Reply = async (formState: any) => {
        const url = END_POINTS.REPLY.replace("{commentId}", formState.commentId);
        return await Api.post(url, formState);
    };

    Delete = async (commentId: string) => {
        const url = END_POINTS.DELETE.replace("{commentId}", commentId);
        return await Api.delete(url);
    };
}

export default new ApiComment();
