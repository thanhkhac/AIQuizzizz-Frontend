import Api from "@/api/Api";

const END_POINTS = {
    GENERATE_QUESTION: "AiGenerate/GenerateQuestion",
    GENERATE_DOCUMENT_STRUCTURE: "AiGenerate/GenerateDocumentStructure",
    GET_COST_TO_GENERATE: "AiGenerate/DocumentStructure/GetCostToGenerate",
};

class ApiAIGenerate {
    GenerateQuestion = async (formData: FormData) => {
        return await Api.post(END_POINTS.GENERATE_QUESTION, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    };

    GenerateDocumentStructure = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.GENERATE_DOCUMENT_STRUCTURE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    };

    GetCostToGenerate = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.GET_COST_TO_GENERATE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    };
}

export default new ApiAIGenerate();
