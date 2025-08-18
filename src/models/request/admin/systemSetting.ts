export default interface SystemSettings {
    inputCostPerMillionTokens: number;
    outputCostPerMillionTokens: number;
    fixedSystemFee: number;
    maxInputToken: number;
    maxOutputToken: number;
}
