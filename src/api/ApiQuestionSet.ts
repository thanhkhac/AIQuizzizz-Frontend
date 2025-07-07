import Api from "@/api/Api";
const END_POINTS = {
    CREATE: "QuestionSets/Create",
};

class ApiQuestionSet {
    Create = async (formState: object) => {
        return await Api.post(`${END_POINTS.CREATE}`, formState);
    };
}

export default new ApiQuestionSet();
