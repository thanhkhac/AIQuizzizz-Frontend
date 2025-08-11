import Api from "@/api/Api";

const END_POINTS = {
    GENERATE_QUESTION: "AiGenerate/GenerateQuestion",
    GENERATE_DOCUMENT_STRUCTURE: "AiGenerate/GenerateDocumentStructure",
    GET_COST_TO_GENERATE: "AiGenerate/DocumentStructure/GetCostToGenerate",
};

class ApiAIGenerate {
    GenerateQuestion = async (data: any) => {
        return await Api.post(`${END_POINTS.GENERATE_QUESTION}`, data);
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

    GetCostToGenerate = async (data: any) => {
        return await Api.post(`${END_POINTS.GET_COST_TO_GENERATE}`, data);
    };
}

export default new ApiAIGenerate();
