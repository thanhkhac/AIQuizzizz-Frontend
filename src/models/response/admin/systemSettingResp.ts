export default interface SystemSettingsResp {
    id: string;
    inputCostPerMillionTokens: number;
    outputCostPerMillionTokens: number;
    fixedSystemFee: number;
    maxInputToken: number;
    maxOutputToken: number;
}
