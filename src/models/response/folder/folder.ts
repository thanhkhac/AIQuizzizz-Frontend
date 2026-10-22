export interface Folder {
    folderTestId: string;
    name: string;
    createBy: string;
}

/** Bộ câu hỏi nằm trong thư mục (GET Folder/{id}/QuestionSets) */
export interface FolderQuestionSet {
    questionSetId: string;
    name: string;
    folderName: string;
    visibilityMode: string;
    numberOfQuestion: number;
    dateCreated: string;
    createBy: string;
}
