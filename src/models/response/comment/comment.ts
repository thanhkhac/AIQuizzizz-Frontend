export interface Comment {
    id: string;
    parentId: string;
    content: string;
    createBy: {
        userId: string;
        fullName: string;
    };
    createdAt: string;
    replyCount: number;
    childComments: Comment[];
}
