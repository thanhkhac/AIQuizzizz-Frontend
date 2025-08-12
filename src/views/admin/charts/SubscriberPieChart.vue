<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import Highcharts from "highcharts";

type PiePoint = { name: string; y: number };

const props = defineProps<{
    data: PiePoint[];
    title?: string;
    background?: string;
}>();

const containerRef = ref<HTMLElement | null>(null);
let chart: Highcharts.Chart | null = null;
let ro: ResizeObserver | null = null;

function renderChart() {
    if (!containerRef.value) return;
    chart?.destroy();

    chart = Highcharts.chart(containerRef.value as HTMLElement, {
        chart: {
            type: "pie",
            backgroundColor: props.background ?? "#151518",
        },
        title: { text: props.title ?? "Subscribers", style: { color: "#fff" } },
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
                        return `${this.point.name}: ${this.percentage?.toFixed(1)}%`;
                    },
                    style: { color: "#fff" },
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
});

watch(
    () => props.data,
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
