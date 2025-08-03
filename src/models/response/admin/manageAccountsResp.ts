export default interface ManageAccountsResp {
    id: string;
    email: string;
    fullName: string;
    token: number;
    balance: number;
    isBanned: boolean;
    role: string;
}
