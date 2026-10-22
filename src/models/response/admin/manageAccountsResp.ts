export default interface ManageAccountsResp {
    id: string;
    email: string;
    fullName: string;
    avatarId?: string | null;
    token: number;
    balance: number;
    isBanned: boolean;
    role: string;
}
