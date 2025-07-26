class Validator {
    isValidGuid(guid: string): boolean {
        const guidRegex =
            /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
        return guidRegex.test(guid);
    }
}

export default new Validator();
