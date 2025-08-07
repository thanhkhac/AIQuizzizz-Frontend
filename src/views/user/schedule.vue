<script lang="ts" setup>
import { ref, onMounted } from "vue";
import dayjs, { Dayjs } from "dayjs";
const chosenDate = ref<Dayjs>();

const getListData = (value: Dayjs) => {
    let result = "";
    switch (value.date()) {
        case 8:
            result = "3 tests";
            break;
        case 10:
            result = "3 tests";
            break;
        case 15:
            result = "3 tests";
        default:
    }
    return result;
};

const emit = defineEmits(["updateSidebar"]);
onMounted(async () => {
    const sidebarActiveItem = "schedule";
    emit("updateSidebar", sidebarActiveItem);
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20"> <span>Exam schedule</span> <br /> </a-col>
            </a-row>
        </div>
        <div class="content d-flex flex-row justify-content-between">
            <div class="col-md-9 content-item">
                <div class="schedule-container">
                    <a-calendar v-model:value="chosenDate">
                        <template #dateCellRender="{ current }">
                            <a-badge
                                v-if="getListData(current)"
                                :status="'success'"
                                :text="getListData(current)"
                            />
                        </template>
                        <template #monthCellRender="{ current }"></template>
                    </a-calendar>
                </div>
            </div>
            <div class="col-md-3 content-item">
                <div class="schedule-detail-title">
                    <div>Date: {{ dayjs(chosenDate).format("DD/MM/YYYY") }}</div>
                    <div class="schedule-detail-sub-title">Exam schedule</div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.schedule-detail-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--text-color);
}
.schedule-detail-sub-title {
    font-size: 14px;
    color: var(--text-color-grey);
}

::v-deep(.ant-picker-calendar) {
    background: var(--content-item-background-color);
}

::v-deep(.ant-picker-body) {
    background: var(--content-item-background-color);
}

::v-deep(.ant-picker-content th) {
    color: var(--text-color);
}

::v-deep(.ant-picker-cell-inner) {
    color: var(--text-color-grey);
    border-color: var(--content-item-border-color) !important;
}

::v-deep(.ant-picker-cell-inner):hover {
    background: var(--content-item-border-color) !important;
}

::v-deep(.ant-picker-cell-in-view .ant-picker-cell-inner) {
    color: var(--text-color) !important;
}

::v-deep(.ant-picker-calendar-date-today.ant-picker-cell-selected) {
    background: #111a2c !important;
    border-color: var(--main-color) !important;
}

::v-deep(.ant-picker-calendar.ant-picker-calendar-full .ant-picker-calendar-date-today) {
    border-color: var(--main-color) !important;
}

::v-deep(.ant-picker-cell-inner.ant-picker-calendar-date-today .ant-picker-calendar-date-value) {
    color: var(--main-color) !important;
}
::v-deep(
    .ant-picker-calendar.ant-picker-calendar-full
        .ant-picker-cell-selected
        .ant-picker-calendar-date
        .ant-picker-calendar-date-value
) {
    color: var(--main-color) !important;
}

::v-deep(.ant-picker-calendar-date-content) {
    color: var(--text-color) !important;
}

::v-deep(.ant-picker-calendar-date-content::-webkit-scrollbar) {
    width: 10px;
}

::v-deep(.ant-picker-calendar-date-content::-webkit-scrollbar-thumb) {
    width: 5px;
    max-height: 5px;
    background-color: var(--main-color);
    border-radius: 5px;
}

::v-deep(.ant-picker-cell-selected .ant-picker-cell-inner) {
    background: #111a2c !important;
}

::v-deep(.ant-radio-button-wrapper) {
    background: var(--form-item-background-color);
    border-color: var(--form-item-border-color);
    color: var(--text-color);
}

::v-deep(.ant-radio-button-wrapper-checked) {
    border-color: var(--main-color) !important;
    color: var(--main-color) !important;
}

::v-deep(.ant-badge-status-text) {
    color: var(--text-color) !important;
}
</style>
