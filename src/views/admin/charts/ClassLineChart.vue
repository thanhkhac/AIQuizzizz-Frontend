<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Highcharts from "highcharts";
import ApiAdmin from "@/api/ApiAdmin";
import { useI18n } from "vue-i18n";
import { getChartTheme, getMonthNames, observeTheme } from "./chartTheme";

type ApiPoint = { month: number; revenue: number };

const props = defineProps<{
    years: number[];
    year?: number;
    locale?: string;
    title?: string;
    background?: string;
}>();

const { t, locale } = useI18n();
const monthNames = () => getMonthNames(locale.value);
const chartTitle = (year: number) =>
    t("admin.manage_subscription.chart.in_year", {
        title: props.title ?? "Monthly New Class",
        year,
    });

const containerRef = ref<HTMLElement | null>(null);
let stopThemeWatch: (() => void) | null = null;
let chart: Highcharts.Chart | null = null;
let ro: ResizeObserver | null = null;
let yearSelected: HTMLSelectElement | null = null;

const currentYear = ref<number>(
    props.year ?? (props.years?.length ? Math.max(...props.years) : new Date().getFullYear()),
);
const seriesData = ref<Highcharts.PointOptionsType[]>([]);

const emit = defineEmits<{
    (e: "year-change", year: number): void;
}>();

function mapPoints(data: ApiPoint[]): Highcharts.PointOptionsType[] {
    const byMonth = new Map<number, number>();
    data.forEach((p) => byMonth.set(p.month, p.revenue));
    return monthNames().map((name, idx) => {
        const m = idx + 1;
        const val = byMonth.get(m);
        return { name, y: val ?? 0 };
    });
}

function buildSeriesForYear(year: number, data: ApiPoint[]) {
    const now = new Date();
    const isCurrentYear = year === now.getFullYear();
    const limit = isCurrentYear ? now.getMonth() + 1 : 12;

    const byMonth = new Map<number, number>();
    data.forEach((p) => byMonth.set(p.month, p.revenue));

    const categories = monthNames().slice(0, limit);
    const points: Highcharts.PointOptionsType[] = categories.map((name, idx) => {
        const m = idx + 1;
        const val = byMonth.get(m);
        return { name, y: val ?? 0 };
    });

    return { points, categories };
}

const getNewClassData = async (year: number) => {
    try {
        let result = await ApiAdmin.MonthlyNewClass(year);
        console.log("222: ", result.data.data);

        const apiPoints: ApiPoint[] = result.data.data ?? [];
        const { points, categories } = buildSeriesForYear(year, apiPoints);
        seriesData.value = mapPoints(apiPoints);

        if (chart) {
            chart.series[0].setData(points as any, false);
            chart.xAxis[0].setCategories(categories as any, false);
            chart.xAxis[0].setExtremes(0, categories.length - 1, false);
            chart.setTitle({ text: chartTitle(year) }, undefined, false);
            chart.redraw();
        }
    } catch (err) {
        console.log(err);
    }
};

function attachYearSelect(c: Highcharts.Chart) {
    const host = c.container.parentElement as HTMLElement | null;
    if (!host) return;

    if (getComputedStyle(host).position === "static") host.style.position = "relative";

    // clear select cũ nếu có
    if (yearSelected && yearSelected.parentElement) {
        yearSelected.parentElement.removeChild(yearSelected);
    }

    const theme = getChartTheme();
    const select = document.createElement("select");
    yearSelected = select;

    Object.assign(select.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: "2000",
        background: theme.controlBackground,
        color: theme.text,
        border: `1px solid ${theme.controlBorder}`,
        borderRadius: "10px",
        padding: "2px 6px",
    } as CSSStyleDeclaration);

    // render options theo props.years (sort tăng dần)
    const sortedYears = [...(props.years ?? [])].sort((a, b) => a - b);
    select.innerHTML = "";
    sortedYears.forEach((y) => {
        const opt = document.createElement("option");
        opt.value = String(y);
        opt.text = String(y);
        if (y === currentYear.value) opt.selected = true;
        select.appendChild(opt);
    });

    select.addEventListener("change", async (e) => {
        const y = Number((e.target as HTMLSelectElement).value);
        if (y === currentYear.value) return;
        currentYear.value = y;
        emit("year-change", y);
        await getNewClassData(y);
    });

    host.appendChild(select);
}

function renderChart() {
    if (!containerRef.value) return;

    chart?.destroy();

    const theme = getChartTheme();
    // màn hình hẹp: chừa 1 hàng phía trên cho select năm để không đè lên tiêu đề
    const narrow = containerRef.value.clientWidth < 520;
    chart = Highcharts.chart(containerRef.value as HTMLElement, {
        credits: { enabled: false },
        chart: {
            type: "column",
            backgroundColor: props.background ?? theme.background,
            spacingTop: narrow ? 46 : 10,
            events: {
                load: function (this: Highcharts.Chart) {
                    attachYearSelect(this);
                },
            },
        },
        title: {
            text: chartTitle(currentYear.value),
            style: { color: theme.text },
            ...({ widthAdjust: narrow ? 0 : -110 } as object), // chừa chỗ cho select năm ở góc phải (màn hình hẹp: select nằm hàng riêng phía trên)
        },
        xAxis: {
            categories: monthNames(),
            labels: { style: { color: theme.text } },
            lineColor: theme.text,
            tickColor: theme.text,
            tickInterval: 1,
        },
        yAxis: {
            title: { text: t("admin.manage_subscription.chart.y_class"), style: { color: theme.text } },
            labels: {
                formatter() {
                    const n = Number(this.value);
                    const loc = props.locale || "en-US";
                    return new Intl.NumberFormat(loc).format(n);
                },
                style: { color: theme.text },
            },
            gridLineColor: theme.grid,
        },
        legend: { enabled: false },
        series: [
            {
                type: "column",
                name: t("admin.manage_subscription.chart.series_class"),
                color: theme.series,
                data: seriesData.value,
            },
        ],
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    style: { color: theme.text },
                    formatter() {
                        const value = this.y ?? 0;
                        const loc = props.locale || "en-US";
                        return new Intl.NumberFormat(loc).format(value);
                    },
                },
            },
        },
    });

    ro?.disconnect();
    ro = new ResizeObserver(() => chart?.reflow());
    ro.observe(containerRef.value);
}

onMounted(async () => {
    await nextTick();
    renderChart();
    await getNewClassData(currentYear.value);
    // đổi theme sáng/tối: vẽ lại biểu đồ với màu mới
    stopThemeWatch = observeTheme(async () => {
        renderChart();
        await getNewClassData(currentYear.value);
    });
});

// đổi ngôn ngữ: vẽ lại để tên tháng / tiêu đề trục đổi theo
watch(locale, async () => {
    renderChart();
    await getNewClassData(currentYear.value);
});

watch(
    () => props.year,
    async (y) => {
        if (y && y !== currentYear.value) {
            currentYear.value = y;
            if (yearSelected) yearSelected.value = String(y);
            await getNewClassData(y);
        }
    },
);

onBeforeUnmount(() => {
    stopThemeWatch?.();
    ro?.disconnect();
    chart?.destroy();
    chart = null;
});
</script>

<template>
    <div
        ref="containerRef"
        style="
            width: 100%;
            height: 400px;
            border: 1px solid var(--form-item-border-color);
            border-radius: 10px;
        "
    ></div>
</template>
