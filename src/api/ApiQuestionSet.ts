import Api from "@/api/Api";
const END_POINTS = {
    CREATE: "QuestionSet",
    UPDATE: "QuestionSet/{questionSetId}",
};

class ApiQuestionSet {
    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (questionSetId: string, formState: object) => {
        const url = END_POINTS.UPDATE.replace("{questionSetId}", questionSetId);
        return await Api.patch(url, formState);
    };
}

export default new ApiQuestionSet();
