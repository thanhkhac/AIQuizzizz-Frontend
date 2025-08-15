<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import ApiTest from "@/api/ApiTest";
import type TestResultPageParams from "@/models/request/test/testResultPageParams";
import type { Class } from "@/models/response/class/class";
import type TestDetail from "@/models/response/test/testDetail";

import TEST_STATUS from "@/constants/testStatus";
import TEST_GRADE_ATTEMPT_METHOD from "@/constants/testGradeAttempMethod";
import TEST_GRADE_QUESTION_METHOD from "@/constants/testGradeQuestionMethod";

import { message, Modal, type TableColumnType } from "ant-design-vue";
import { ref, onMounted, watch, reactive, computed, nextTick } from "vue";

import Input from "@/shared/components/Common/Input.vue";
import Validator from "@/services/Validator";

import dayjs from "dayjs";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

//#region interface
type TestResult = {
    studentId: string;
    studentName: string;
    studentEmail: string;
    score: number;
    status: string;
};

//#endregion

const loading = ref<boolean>(false);
const classId = ref(route.params.classId || "");
const classData = ref<Class>({
    classId: "",
    name: "",
    topic: "",
});

const testId = ref(route.params.testId || "");
const testData = ref<TestDetail>({
    name: "",
    classId: route.params.classId.toString() || "",
    timeLimit: 0,
    startTime: "",
    endTime: "",
    questionCount: 0,
    gradeAttemptMethod: TEST_GRADE_ATTEMPT_METHOD.HIGHEST_SCORE,
    gradeQuestionMethod: TEST_GRADE_QUESTION_METHOD.PARTIAL,
    isShowCorrectAnswerInReview: true,
    isAllowReviewAfterSubmit: true,
    numberOfShuffles: 0,
    maxAttempt: 0,
    passingScore: 0,
    totalScore: 0,
});

const testResultData = ref<TestResult[]>([]);

type MyColumn = TableColumnType<TestResult>;

const columns: MyColumn[] = [
    {
        title: "No",
        key: "no",
        customRender: (info: { index: number }) => info.index + 1,
    },
    {
        title: t("class_member.column.fullName"),
        dataIndex: "studentName",
        key: "studentName",
        sorter: (a: any, b: any) => a.studentName.localeCompare(b.studentName),
    },
    {
        title: t("class_member.column.email"),
        dataIndex: "studentEmail",
        key: "email",
        sorter: (a: any, b: any) => a.studentEmail.localeCompare(b.studentEmail),
    },
    {
        title: "Final score",
        dataIndex: "score",
        key: "score",
        sorter: (a: any, b: any) => a.score - b.score,
    },
    {
        title: "Result",
        dataIndex: "status",
        key: "status",
    },
];

const optionKeys = Object.values(TEST_STATUS);
const test_status_options = computed(() =>
    optionKeys.map((key) => ({
        label: key,
        value: key !== TEST_STATUS.ALL ? key : "",
    })),
);

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    studentName: route.query.studentName?.toString() || "",
    isPassed: route.query.isPassed?.toString() || null,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const getClassData = async () => {
    try {
        if (!Validator.isValidGuid(classId.value.toString())) {
            router.push({ name: "404" });
            return;
        }

        if (!classId.value) router.push({ name: "404" });

        let result = await ApiClass.GetById(classId.value.toString());
        if (!result.data.success) router.push({ name: "404" });

        classData.value = result.data.data;
    } catch (error) {
        console.log("ERROR: GETBYID class: " + error);
    }
};

const getTestDetail = async () => {
    try {
        if (!Validator.isValidGuid(testId.value.toString())) {
            router.push({ name: "404" });
            return;
        }
        if (!testId.value) router.push({ name: "404" });

        let result = await ApiTest.GetById(testId.value.toString(), false);
        if (!result.data.success) router.push({ name: "404" });

        testData.value = result.data.data;
    } catch (error) {
        console.log("ERROR: GETBYID test: " + error);
    }
};

const getData = async () => {
    try {
        loading.value = true;
        let result = await ApiTest.GetAllExamResultByLimit(
            testId.value.toString(),
            pageParams as TestResultPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;

            testResultData.value = result.data.data.items;

            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Class_Exam_Result",
                        params: {
                            classId: classId.value,
                            testId: testId.value,
                        },
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            studentName: pageParams.studentName,
                            isPassed: pageParams.isPassed,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Class_Exam_Result",
                        params: {
                            classId: classId.value,
                            testId: testId.value,
                        },
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            studentName: pageParams.studentName,
                            isPassed: pageParams.isPassed,
                        },
                    });
                }
                pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            }
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT class exam result: " + error);
    } finally {
        loading.value = false;
    }
};

watch(
    () => Object.keys(route.query).length,
    () => {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 11;
        pageParams.studentName = route.query.studentName?.toString() || "";
        pageParams.isPassed = route.query.isPassed?.toString() || null;
        pageParams.statusFilter = true;

        getData();
    },
);

//change when page change (pageParams)
const onPaginationChange = (page: any, pageSize: any) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};

//#region user history modal
const chosenUser = ref<TestResult>({
    studentId: "",
    studentName: "",
    studentEmail: "",
    score: 0,
    status: "",
});
import UserTestAttempts from "@/shared/modals/UserTestAttempts.vue";
const userHistoryModalRef = ref<InstanceType<typeof UserTestAttempts> | null>(null);

const openUserHistoryModal = async (user: TestResult) => {
    chosenUser.value = user;
    await nextTick();

    userHistoryModalRef.value?.openModal();
};

//#endregion

const getTagColor = (status: string) => {
    switch (status) {
        case TEST_STATUS.PASSED: {
            return "#22C55E";
        }
        case TEST_STATUS.FAILED: {
            return "#cd201f";
        }
    }
};

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);

    await getClassData();
    await getTestDetail();
    await getData();
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <div class="breadcrumb-container">
                <ul>
                    <li class="title-breadcrumb-item">
                        <RouterLink :to="{ name: 'User_Class' }">
                            <span>{{ $t("class_index.title") }}</span> <br />
                        </RouterLink>
                        <i class="bx bx-chevron-right"></i>
                    </li>
                    <li class="title-breadcrumb-item">
                        <RouterLink
                            :to="{
                                name: 'User_Class_Exam',
                                params: { id: classId },
                            }"
                            class="breadcrumb-item-class"
                        >
                            <span> {{ classData.name }} </span>
                            <span class="breadcrumb-item-topic"> {{ classData.topic }} </span>
                        </RouterLink>
                    </li>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>Test name: {{ testData.name }}</span>
                        <span>Class: {{ classData.name }}</span>
                    </div>
                </div>
                <div class="test-info-container">
                    <a-row class="mb-2 d-flex align-items-center justify-content-between">
                        <a-col :span="11" class="test-info-item">
                            <div class="d-flex justify-content-between">
                                <span> StartTime:</span>
                                <span>
                                    {{ dayjs(testData.startTime).format("DD/MM/YYYY HH:mm A") }}
                                </span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span> EndTime:</span>
                                <span>
                                    {{ dayjs(testData.endTime).format("DD/MM/YYYY HH:mm A") }}
                                </span>
                            </div>
                        </a-col>
                        <a-col :span="11" class="test-info-item">
                            <div class="d-flex justify-content-between">
                                <span> Time limit: </span>
                                <span> {{ testData.timeLimit }} minutes</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span> Questions:</span>
                                <span> {{ testData.questionCount }} questions</span>
                            </div>
                        </a-col>
                    </a-row>
                    <a-row class="mb-2 d-flex align-items-center justify-content-between">
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span> Grade attempt method:</span>
                            <span> {{ testData.gradeAttemptMethod }}</span>
                        </a-col>
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span>Max attempt:</span>
                            <span> {{ testData.maxAttempt }} times</span></a-col
                        >
                    </a-row>
                    <a-row class="mb-2 d-flex align-items-center justify-content-between">
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span>Grade question method:</span>
                            <span>{{ testData.gradeQuestionMethod }}</span>
                        </a-col>
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span> Passing Score: </span>
                            <span>
                                {{ testData.totalScore * (testData.passingScore / 100) }}
                                ({{ testData.passingScore }}%)
                            </span>
                        </a-col>
                    </a-row>
                    <a-row class="mb-2 d-flex align-items-center justify-content-between">
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span> Show correct answer in review:</span>
                            <span> {{ testData.isShowCorrectAnswerInReview ? "Yes" : "No" }}</span>
                        </a-col>
                        <a-col :span="11" class="d-flex justify-content-between test-info-item">
                            <span>Allow student to review after submit:</span>
                            <span>{{ testData.isAllowReviewAfterSubmit ? "Yes" : "No" }}</span>
                        </a-col>
                    </a-row>
                </div>
                <div class="content-item-functions">
                    <a-select
                        v-model:value="pageParams.isPassed"
                        style="width: 230px; margin-right: 10px"
                        @change="getData"
                    >
                        <a-select-option
                            v-for="option in test_status_options"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <div style="width: 300px; padding: 0px">
                        <Input
                            @input="getData"
                            v-model="pageParams.studentName"
                            :placeholder="t('class_member.other.search_placeholder')"
                        >
                            <template #icon>
                                <i class="bx bx-search"></i>
                            </template>
                        </Input>
                    </div>
                </div>
                <template v-if="loading">
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                    <a-skeleton :loading="loading"></a-skeleton>
                </template>
                <template v-else>
                    <a-config-provider
                        v-if="testResultData.length > 0"
                        :locale="{
                            Table: {
                                cancelSort: '',
                                triggerAsc: '',
                                triggerDesc: '',
                            },
                        }"
                    >
                        <a-table
                            :columns="columns"
                            :data-source="testResultData"
                            row-key="studentId"
                            :pagination="false"
                        >
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'studentName'">
                                    <div class="student-name" @click="openUserHistoryModal(record)">
                                        {{ record.studentName }}
                                    </div>
                                </template>
                                <template v-if="column.key === 'status'">
                                    <a-tag :color="getTagColor(record.status)">{{
                                        record.status
                                    }}</a-tag>
                                </template>
                            </template>
                        </a-table>
                    </a-config-provider>
                    <template v-else>
                        <div class="w-110 d-flex justify-content-center">
                            <a-empty>
                                <template #description>
                                    <span> {{ $t("class_index.other.no_data_matches") }}</span>
                                </template>
                            </a-empty>
                        </div>
                    </template>
                </template>
                <div class="pagination-container">
                    <a-pagination
                        @change="onPaginationChange"
                        v-model:current="pageParams.pageNumber"
                        :total="pageParams.totalCount"
                        :pageSize="pageParams.pageSize"
                        :show-total="
                            (total: any, range: any) =>
                                `${range[0]}-${range[1]} of ${total} ${t('class_member.other.items')}`
                        "
                        show-size-changer
                        show-quick-jumper
                        class="crud-layout-pagination"
                        :locale="{
                            items_per_page: t('class_index.other.pages'),
                        }"
                    ></a-pagination>
                </div>
            </div>
        </div>
    </div>

    <UserTestAttempts
        ref="userHistoryModalRef"
        :test-id="testId.toString()"
        :user-id="chosenUser?.studentId"
        :test-name="testData.name"
        :passing-score="testData.passingScore"
        :student-name="chosenUser?.studentEmail"
    />
</template>
<style scoped>
.test-info-item {
    border-bottom: 1px solid #e8e8e8;
    padding-bottom: 5px;
    padding-top: 10px;
}

.test-info-item span:nth-child(1) {
    font-weight: 500;
}

.student-name:hover {
    cursor: pointer;
    color: var(--main-color);
}
</style>
