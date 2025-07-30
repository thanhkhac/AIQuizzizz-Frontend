import Api from "@/api/Api";

const END_POINTS = {
    GET_BY_ID: "Test/{testId}",
    CREATE: "Test",
    UPDATE: "Test/{testId}",
    DELETE: "Test/{testId}",
};

class ApiTest {
    GetById = async (testId: string) => {
        const url = END_POINTS.GET_BY_ID.replace("{testId}", testId);
        return await Api.get(url);
    };

    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (testId: string, formState: object) => {
        const url = END_POINTS.UPDATE.replace("{testId}", testId);
        return await Api.patch(url, formState); //body 2 //query 3
    };

    Delete = async (testId: string) => {
        const url = END_POINTS.DELETE.replace("{testId}", testId);
        return await Api.delete(url);
    };
}

export default new ApiTest();
