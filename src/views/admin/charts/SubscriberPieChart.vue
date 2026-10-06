<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Highcharts from "highcharts";
import { getChartTheme, observeTheme } from "./chartTheme";

type PiePoint = { name: string; y: number };

const props = defineProps<{
    data: PiePoint[];
    title?: string;
    background?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let chart: Highcharts.Chart | null = null;
let ro: ResizeObserver | null = null;
let stopThemeWatch: (() => void) | null = null;

function renderChart() {
    if (!containerRef.value) return;
    chart?.destroy();

    const theme = getChartTheme();
    chart = Highcharts.chart(containerRef.value as HTMLElement, {
        credits: { enabled: false },
        chart: {
            type: "pie",
            backgroundColor: props.background ?? theme.background,
        },
        title: { text: props.title ?? "Subscribers", style: { color: theme.text } },
        legend: { enabled: false },
        tooltip: {
            pointFormat: "<b>{point.percentage:.1f}%</b> ({point.y})",
        },
        series: [
            {
                type: "pie",
                data: props.data.map((p) => ({ ...p })),
                dataLabels: {
                    enabled: true,
                    formatter() {
                        return `${this.name}: ${this.percentage?.toFixed(1)}%`;
                    },
                    style: { color: theme.text },
                },
            },
        ],
    });

    ro?.disconnect();
    ro = new ResizeObserver(() => chart?.reflow());
    ro.observe(containerRef.value);
}

onMounted(async () => {
    await nextTick();
    renderChart();
    stopThemeWatch = observeTheme(renderChart);
});

watch(
    () => props.data,
    () => nextTick().then(renderChart),
    { deep: true },
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
