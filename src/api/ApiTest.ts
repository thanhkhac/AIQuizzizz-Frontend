import Api from "@/api/Api";

const END_POINTS = {
    GET_BY_ID: "Test/{testId}",
    CREATE: "Test",
    UPDATE: "Test/{testId}",
    DELETE: "Test/{testId}",
    ATTEMPT: "Test/{testId}/Attempt",
    SUBMIT: "Test/Submit",
};

class ApiTest {
    GetById = async (testId: string) => {
        const url = END_POINTS.GET_BY_ID.replace("{testId}", testId);
        return await Api.get(url);
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
}

export default new ApiTest();
