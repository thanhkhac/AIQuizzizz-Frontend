import type Tag from "../tag/tag";

export default interface QuestionSet {
    id: string;
    name: string;
    description: string;
    numberOfQuestions: number;
    completedQuestions: number;
    ratingCount: number;
    ratingAverage: number;
    createdBy: string;
    createdAt: string;
    createdById: string;
    tags: Tag[];
    lastAccessByMe: string;
    visibilityMode: string;
}
