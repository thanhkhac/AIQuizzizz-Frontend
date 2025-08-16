<script lang="ts" setup>
import ApiTest from "@/api/ApiTest";

import { ref, onMounted, computed } from "vue";
import dayjs, { Dayjs } from "dayjs";

import "dayjs/locale/vi";
import "dayjs/locale/en";

import viVN from "ant-design-vue/es/locale/vi_VN";
import enUS from "ant-design-vue/es/locale/en_US";

import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

//#region locale
const locale = ref(viVN);
const changeLocale = () => {
    const lang = localStorage.getItem("locale") || "en";
    if (lang === "en") {
        locale.value = enUS;
        dayjs.locale("en");
    } else {
        locale.value = viVN;
        dayjs.locale("vi");
    }
};
//#endregion

//#region interface
interface TestSchedule {
    testId: string;
    testName: string;
    classId: string;
    className: string;
}

interface ScheduleData {
    date: string;
    testSchedules: TestSchedule[];
}

//#endregion

const data = ref<ScheduleData[]>([]);

const chosenDate = ref<Dayjs>(dayjs());
const watchChosenDate = ref<Dayjs>(dayjs());

const chosenDateTestSchedules = computed(() => {
    return chosenDate.value
        ? data.value.find((x) => dayjs(chosenDate.value).isSame(dayjs(x.date), "day"))
              ?.testSchedules || []
        : [];
});

const loading = ref(false);
const getData = async () => {
    try {
        loading.value = true;
        const result = await ApiTest.GetTestSchedule(
            chosenDate.value.month() + 1,
            chosenDate.value.year(),
        );
        if (result.data.success) {
            data.value = result.data.data;
            watchChosenDate.value = chosenDate.value;
        }
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};

//change to another month or year
const GetCalendarData = async () => {
    if (
        !dayjs(chosenDate.value).isSame(dayjs(watchChosenDate.value), "month") ||
        !dayjs(chosenDate.value).isSame(dayjs(watchChosenDate.value), "year")
    ) {
        await getData();
    }
};

const getListData = (date: string) => {
    const numberOfTest = data.value.find((x) => dayjs(date).isSame(dayjs(x.date), "day"))
        ?.testSchedules.length;

    if (!numberOfTest) return null;

    return `${numberOfTest} tests`;
};

const onRedirectToClass = (classId: string) => {
    router.push({ name: "User_Class_Exam", params: { id: classId } });
};

const emit = defineEmits(["updateSidebar"]);
onMounted(async () => {
    const sidebarActiveItem = "schedule";
    emit("updateSidebar", sidebarActiveItem);
    changeLocale();

    await getData();
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("schedule.title") }}</span> <br />
                </a-col>
            </a-row>
        </div>
        <div class="content d-flex flex-row justify-content-between">
            <div class="col-md-9 content-item">
                <div class="schedule-container">
                    <a-config-provider :locale="locale">
                        <a-calendar v-model:value="chosenDate" @change="GetCalendarData">
                            <template #dateCellRender="{ current }">
                                <a-badge
                                    v-if="getListData(current)"
                                    :status="'success'"
                                    :text="getListData(current)"
                                />
                            </template>
                            <template #monthCellRender="{ current }"></template>
                        </a-calendar>
                    </a-config-provider>
                </div>
            </div>
            <div class="col-md-3 content-item">
                <div class="schedule-detail-title">
                    <div>
                        {{
                            $t("schedule.current_date", {
                                date: dayjs(chosenDate).format("DD/MM/YYYY"),
                            })
                        }}
                    </div>
                    <div class="schedule-detail-sub-title">
                        {{ $t("schedule.count_exam") }}
                        <span class="exam_count">{{ chosenDateTestSchedules.length }}</span>
                    </div>
                </div>
                <div class="schedule-item-container">
                    <template v-if="chosenDateTestSchedules.length > 0">
                        <div
                            v-for="(schedule, index) in chosenDateTestSchedules"
                            :key="schedule.testId"
                            class="schedule-item"
                        >
                            <div>{{ index + 1 }}.</div>
                            <div class="schedule-item-info">
                                <div
                                    class="schedule-item-info-test"
                                    @click="onRedirectToClass(schedule.classId)"
                                >
                                    {{ schedule.testName }}
                                </div>
                                <div class="schedule-item-info-class">{{ schedule.className }}</div>
                            </div>
                        </div>
                    </template>
                    <template v-else>
                        <div class="w-100 h-100 d-flex justify-content-center align-items-center">
                            <a-empty>
                                <template #description>
                                    <span> {{ $t("class_index.other.no_data_matches") }}</span>
                                </template>
                            </a-empty>
                        </div>
                    </template>
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
    color: var(--text-color-contrast) !important;
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
    display: none;
}

::v-deep(.ant-radio-button-wrapper-checked) {
    border-color: var(--main-color) !important;
    color: var(--main-color) !important;
}

::v-deep(.ant-badge-status-text) {
    color: var(--text-color) !important;
}

.schedule-item-container {
    height: 500px;
    max-height: 700px;
    overflow-y: auto;
    padding: 0px 5px;
    margin-top: 10px;
}

.schedule-item {
    display: flex;
    padding: 5px 10px;
    border-bottom: 1px solid var(--content-item-border-color);
    border-radius: 5px;
}

.schedule-item:hover {
    background: var(--form-item-background-color);
}

.schedule-item-info {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
}

.schedule-item-info-test {
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.schedule-item-info-test:hover {
    color: var(--main-color);
}

.schedule-item-info-class {
    font-size: 14px;
    color: var(--text-color-grey);
}
.exam_count {
    color: var(--main-color);
}
</style>
