export default interface ManageAccountsParams {
    keyword: string;
    fieldName: string;
    pageNumber: number;
    pageSize: number;
    IsBanned?: boolean;
    role?: string;
}
