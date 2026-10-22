export interface Comment {
    id: string;
    parentId: string;
    content: string;
    createBy: {
        userId: string;
        fullName: string;
        avatarId?: string | null;
    };
    createdAt: string;
    replyCount: number;
    childComments: Comment[];
}
