// navigator.clipboard chỉ có trên secure context (https/localhost): fallback textarea ẩn + execCommand("copy")
function copyTextFallback(text: string): boolean {
    if (typeof document === "undefined" || !document.body) return false;

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let success = false;
    try {
        success = document.execCommand("copy");
    } catch {
        success = false;
    }
    document.body.removeChild(textarea);
    return success;
}

/**
 * Sao chép text vào clipboard.
 * @returns true nếu sao chép thành công, false nếu thất bại (caller tự hiển thị toast)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            return copyTextFallback(text);
        }
    }
    return copyTextFallback(text);
}
