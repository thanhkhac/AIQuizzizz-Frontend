export interface ChartTheme {
    background: string;
    text: string;
    grid: string;
    series: string;
    controlBackground: string;
    controlBorder: string;
}

// đọc màu từ CSS variables của theme hiện tại (.theme-dark / .theme-light trên <html>)
export const getChartTheme = (): ChartTheme => {
    const style = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
        style.getPropertyValue(name).trim() || fallback;

    return {
        background: read("--content-item-background-color", "#151518"),
        text: read("--text-color", "#fff"),
        grid: read("--content-item-border-color", "#444"),
        series: read("--correct-answer-color", "#19e580"),
        controlBackground: read("--form-item-background-color", "#222"),
        controlBorder: read("--form-item-border-color", "#555"),
    };
};

// gọi callback khi người dùng đổi theme (class trên <html> thay đổi); trả về hàm huỷ theo dõi
export const observeTheme = (callback: () => void) => {
    const observer = new MutationObserver(callback);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
};

// tên tháng ngắn theo ngôn ngữ giao diện ("vn" -> "vi" cho Intl): Jan... / Thg 1...
export const getMonthNames = (lang: string): string[] => {
    const tag = lang === "vn" ? "vi" : lang || "en";
    let fmt: Intl.DateTimeFormat;
    try {
        fmt = new Intl.DateTimeFormat(tag, { month: "short" });
    } catch {
        fmt = new Intl.DateTimeFormat("en", { month: "short" });
    }
    return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(2000, i, 1)));
};
