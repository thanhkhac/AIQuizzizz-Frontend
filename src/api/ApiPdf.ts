import Api from "@/api/Api";

const END_POINTS = {
    GET_PDF_STRUCTURE: "PdfService/GetPdfStructure",
};

class ApiPdf {
    GetPdfStructure = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await Api.post(END_POINTS.GET_PDF_STRUCTURE, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
    };
}

export default new ApiPdf();
