import Api from "@/api/Api";
import TEST_STATUS from "@/constants/testStatus";
import type TestResultPageParams from "@/models/request/test/testResultPageParams";

const END_POINTS = {
    GET_BY_ID: "Test/{testId}",
    CREATE: "Test",
    UPDATE: "Test/{testId}",
    DELETE: "Test/{testId}",
    ATTEMPT: "Test/{testId}/Attempt",
    SUBMIT: "Test/Submit",
    GET_ALL_RESULT_BY_LIMIT: "Test/{testId}/Class/Result",
    GET_USER_EXAM_HISTORY: "Test/{testId}/History",
    GET_ATTEMPT_REVIEW: "Test/{attemptId}/Review",
    GET_TEST_SCHEDULE: "Test/Schedule",
};

class ApiTest {
    GetById = async (testId: string, isShowQuestion: boolean = true) => {
        const url = END_POINTS.GET_BY_ID.replace("{testId}", testId);
        return await Api.get(url, { params: { isShowQuestion } });
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (formState: any) => {
        const url = END_POINTS.UPDATE.replace("{testId}", formState.testId);
        return await Api.patch(url, formState); //body 2 //query 3
    };

    Delete = async (testId: string) => {
        const url = END_POINTS.DELETE.replace("{testId}", testId);
        return await Api.delete(url);
    };

    Attempt = async (testId: string) => {
        const url = END_POINTS.ATTEMPT.replace("{testId}", testId);
        return await Api.post(url);
    };

    Submit = async (formState: object) => {
        return await Api.post(`${END_POINTS.SUBMIT}`, formState);
    };

    GetAllExamResultByLimit = async (testId: string, pageParams: TestResultPageParams) => {
        const url = END_POINTS.GET_ALL_RESULT_BY_LIMIT.replace("{testId}", testId);
        return await Api.get(url, {
            params: {
                pageNumber: pageParams.pageNumber <= 0 ? 1 : pageParams.pageNumber,
                pageSize: Math.max(5, Math.min(pageParams.pageSize || 5, 100)),
                studentName: pageParams.studentName || "",
                isPassed: pageParams.isPassed
                    ? pageParams.isPassed === TEST_STATUS.PASSED
                        ? true
                        : false
                    : null,
            },
        });
    };

    GetUserExamHistory = async (testId: string, userId: string | null) => {
        const url = END_POINTS.GET_USER_EXAM_HISTORY.replace("{testId}", testId);

        if (userId) {
            return await Api.get(url, {
                params: {
                    userId,
                },
            });
        }

        return await Api.get(url);
    };
    GetAttemptReview = async (attemptId: string) => {
        const url = END_POINTS.GET_ATTEMPT_REVIEW.replace("{attemptId}", attemptId);
        return await Api.get(url);
    };

    GetTestSchedule = async (month: number, year: number) => {
        return await Api.get(`${END_POINTS.GET_TEST_SCHEDULE}`, {
            params: {
                month: month,
                year: year,
            },
        });
    };
}

export default new ApiTest();
