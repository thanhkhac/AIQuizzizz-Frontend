import type { ResponseQuestion } from "@/models/response/question";
export interface TestTemplateWithQuestion {
    testTemplateId: string;
    name: string;
    questions: ResponseQuestion[];
}
