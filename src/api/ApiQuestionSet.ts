import Api from "@/api/Api";
const END_POINTS = {
    CREATE: "QuestionSet",
    UPDATE: "QuestionSet/{questionSetId}",
    LEARN_QUESTIONS: "QuestionSet/{questionSetId}/LearnQuestions",
    LEARN_HISTORY: "QuestionSet/{questionSetId}/LearnHistory",
    DELETE_LEARN_HISTORY: "QuestionSet/{questionSetId}/LearnHistory",
};

class ApiQuestionSet {
    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };

    Update = async (questionSetId: string, formState: object) => {
        const url = END_POINTS.UPDATE.replace("{questionSetId}", questionSetId);
        return await Api.patch(url, formState);
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
}

export default new ApiQuestionSet();
