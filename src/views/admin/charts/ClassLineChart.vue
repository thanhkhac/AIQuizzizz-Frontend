<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Highcharts from "highcharts";
import ApiAdmin from "@/api/ApiAdmin";

type ApiPoint = { month: number; revenue: number };

const props = defineProps<{
    years: number[];
    year?: number;
    locale?: string;
    title?: string;
    background?: string;
}>();

const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

const containerRef = ref<HTMLElement | null>(null);
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
    return MONTH_NAMES.map((name, idx) => {
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

    const categories = MONTH_NAMES.slice(0, limit);
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
            chart.setTitle(
                { text: `${props.title ?? "Monthly New Class"} in ${year}` },
                undefined,
                false,
            );
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

    const select = document.createElement("select");
    yearSelected = select;

    Object.assign(select.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: "2000",
        background: "#222",
        color: "#fff",
        border: "1px solid #555",
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

    chart = Highcharts.chart(containerRef.value as HTMLElement, {
        chart: {
            type: "column",
            backgroundColor: props.background ?? "#151518",
            events: {
                load: function (this: Highcharts.Chart) {
                    attachYearSelect(this);
                },
            },
        },
        title: {
            text: `${props.title ?? "Monthly New Class"} in ${currentYear}`,
            style: { color: "#fff" },
        },
        xAxis: {
            categories: [...MONTH_NAMES],
            labels: { style: { color: "#fff" } },
            lineColor: "#fff",
            tickColor: "#fff",
            tickInterval: 1,
        },
        yAxis: {
            title: { text: "Number of class", style: { color: "#fff" } },
            labels: {
                formatter() {
                    const n = Number(this.value);
                    const loc = props.locale || "en-US";
                    return new Intl.NumberFormat(loc).format(n);
                },
                style: { color: "#fff" },
            },
            gridLineColor: "#444",
        },
        legend: { enabled: false },
        series: [
            {
                type: "column",
                name: "Class",
                color: "#00FF00",
                data: seriesData.value,
            },
        ],
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true,
                    style: { color: "#fff" },
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
