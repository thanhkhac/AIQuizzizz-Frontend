<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Highcharts from "highcharts";

type ApiPoint = { month: number; revenue: number };
type ApiYearData = { year: number; data: ApiPoint[] };

const props = withDefaults(
    defineProps<{
        apiData: ApiYearData[];
        locale?: string;
        title?: string;
        background?: string;
    }>(),
    {
        locale: "en-US",
        title: "Monthly New Class",
        background: "#151518",
    },
);

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

function buildRevenuePoints(year: number): Highcharts.PointOptionsType[] {
    const found = props.apiData.find((y) => y.year === year);
    if (!found) return [];
    const byMonth = new Map<number, number>();
    found.data.forEach((p) => byMonth.set(p.month, p.revenue));
    return MONTH_NAMES.map((name, idx) => {
        const m = idx + 1;
        const val = byMonth.get(m);
        return { name, y: val ?? null };
    });
}

function renderChart() {
    if (!containerRef.value) return;

    chart?.destroy();

    const years = props.apiData.map((d) => d.year).sort((a, b) => a - b);
    let currentYear = years[years.length - 1];

    chart = Highcharts.chart(containerRef.value as HTMLElement, {
        chart: {
            type: "column",
            backgroundColor: props.background ?? "#151518",
            events: {
                load: function (this: Highcharts.Chart) {
                    const c = this;
                    const host = c.container.parentElement as HTMLElement | null;
                    if (host && getComputedStyle(host).position === "static") {
                        host.style.position = "relative";
                    }

                    // dropdown chọn năm
                    const select = document.createElement("select");
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

                    years.forEach((y) => {
                        const opt = document.createElement("option");
                        opt.value = String(y);
                        opt.text = String(y);
                        if (y === currentYear) opt.selected = true;
                        select.appendChild(opt);
                    });

                    select.addEventListener("change", (e) => {
                        const y = Number((e.target as HTMLSelectElement).value);
                        if (y === currentYear) return;
                        currentYear = y;

                        const data = buildRevenuePoints(currentYear).map((p) => ({
                            ...(p as any),
                        }));
                        c.series[0].setData(data, false);
                        c.xAxis[0].setCategories([...MONTH_NAMES], false);
                        c.xAxis[0].setExtremes(0, MONTH_NAMES.length - 1, false);
                        c.setTitle(
                            { text: `${props.title ?? "Monthly New Class "} in ${currentYear}` },
                            undefined,
                            false,
                        );
                        c.redraw();
                    });

                    host?.appendChild(select);
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
                data: buildRevenuePoints(currentYear).map((p) => ({ ...(p as any) })),
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
});

watch(
    () => props.apiData,
    () => nextTick().then(renderChart),
    { deep: true },
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
