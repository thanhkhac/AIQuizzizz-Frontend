import type Tag from "../tag/tag";

export default interface QuestionSet {
    id: string;
    name: string;
    description: string;
    totalQuestionCount: number;
    completedQuestionCount: number;
    ratingCount: number;
    ratingAverage: number;
    createBy: string;
    createdAt: string;
    createdById: string;
    tags: Tag[];
    lastAccessByMe: string;
    visibilityMode: string;
}
