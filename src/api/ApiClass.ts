import Api from "@/api/Api";
import type ClassPageParams from "@/models/request/class/classPageParams";
import type ClassExamPageParams from "@/models/request/class/classExamPageParams";
import type ClassStudentPageParams from "@/models/request/class/classStudentPageParams";
import type ClassQuestionSetPageParams from "@/models/request/class/classQSPageParams";

const END_POINTS = {
    CREATE: "Class",
    GET_ALL_BY_LIMIT: "Class",
    GET_ALL_EXAM_BY_LIMIT: "Class/{ClassId}/Tests",
    GET_ALL_STUDENT_BY_LIMIT: "Class/{ClassId}/Students",
    GET_ALL_QS_BY_LIMIT: "Class/{ClassId}/QuestionSets",
    GET_BY_ID: "Class/{ClassId}",
    CREATE_INVITATION: "Class/{ClassId}/Invitations",
    JOIN_CLASS: "Class/Students",
    DELETE_CLASS: "Class/{ClassId}",
    DELETE_CLASS_MEMBER: "Class/{ClassId}/Members/{UserId}",
    UPDATE_CLASS_MEMBER_POSITION: "Class/{ClassId}/Members/{UserId}",
    DELETE_CLASS_QUESTION_SET: "Class/{ClassId}/QuestionSets/{QuestionSetId}",
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

    async GetById(classId: string) {
        const url = END_POINTS.GET_BY_ID.replace("{ClassId}", classId);
        return await Api.get(url);
    }

    async GetAllExamByLimit(classId: string, pageParams: ClassExamPageParams) {
        const url = END_POINTS.GET_ALL_EXAM_BY_LIMIT.replace("{ClassId}", classId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                testName: pageParams.testName || "",
                status: pageParams.status || "",
            },
        });
    }

    async GetAllQSByLimit(classId: string, pageParams: ClassQuestionSetPageParams) {
        const url = END_POINTS.GET_ALL_QS_BY_LIMIT.replace("{ClassId}", classId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                name: pageParams.name || "",
            },
        });
    }

    async GetAllStudentByLimit(classId: string, pageParams: ClassStudentPageParams) {
        const url = END_POINTS.GET_ALL_STUDENT_BY_LIMIT.replace("{ClassId}", classId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber || 1,
                pageSize: pageParams.pageSize || 10,
                keyword: pageParams.keyword || "",
                fieldName: pageParams.fieldName || "",
            },
        });
    }

    async Delete(classId: string) {
        const url = END_POINTS.DELETE_CLASS.replace("{ClassId}", classId);
        return await Api.delete(url);
    }

    async DeleteClassMember(classId: string, userId: string) {
        const url = END_POINTS.DELETE_CLASS_MEMBER.replace("{ClassId}", classId).replace(
            "{UserId}",
            userId,
        );

        return await Api.delete(url);
    }

    async UpdateClassMemberPosition(classId: string, userId: string, position: string) {
        const url = END_POINTS.UPDATE_CLASS_MEMBER_POSITION.replace("{ClassId}", classId).replace(
            "{UserId}",
            userId,
        );

        return await Api.patch(url, null, {
            params: { position },
        });
    }

    async DeleteQuestionSetFromClass(classId: string, questionSetId: string) {
        const url = END_POINTS.DELETE_CLASS_QUESTION_SET.replace("{ClassId}", classId).replace(
            "{QuestionSetId}",
            questionSetId,
        );
        return await Api.delete(url);
    }
}

export default new ApiUser();
