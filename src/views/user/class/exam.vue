<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import ApiTest from "@/api/ApiTest";

import CLASS_STUDENT_POSITION from "@/constants/classStudentPosition";
import CLASS_EXAM_STATUS from "@/constants/classExamStatus";
import type ClassExamPageParams from "@/models/request/class/classExamPageParams";
import type { Class } from "@/models/response/class/class";
import type { ClassExam } from "@/models/response/class/classExam";

import { ref, onMounted, reactive, computed, onUpdated, watch } from "vue";
import { useI18n } from "vue-i18n";
import dayjs from "dayjs";

import { useRoute, useRouter } from "vue-router";

import Input from "@/shared/components/Common/Input.vue";
import { FileDoneOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";
import Validator from "@/services/Validator";

const route = useRoute();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(["updateSidebar"]);

const classId = ref(route.params.id || "");
const classData = ref<Class>({
    classId: "",
    name: "",
    topic: "",
});

const optionKeys = Object.values(CLASS_EXAM_STATUS);

const exam_status_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`class_exam.select_option.${key}`),
        value: key !== CLASS_EXAM_STATUS.ALL ? key : "",
    })),
);

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    testName: route.query.testName?.toString() || "",
    status: route.query.status || exam_status_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const exam_data = ref<ClassExam[]>([]);
const userRoleInClass = ref<string>("");
const loading = ref<boolean>(false);
const getPermission = async () => {
    try {
        const result = await ApiClass.GetUserPermission(classData.value.classId);
        if (result.data.success) {
            userRoleInClass.value = result.data.data;
        }
    } catch (error) {
        console.log(error);
    }
};

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

const getData = async () => {
    try {
        loading.value = true;
        let result = await ApiClass.GetAllExamByLimit(
            classId.value.toString(),
            pageParams as ClassExamPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            exam_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Class_Exam",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            testName: pageParams.testName,
                            status: pageParams.status,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Class_Exam",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            testName: pageParams.testName,
                            status: pageParams.status,
                        },
                    });
                }
                pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            }
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT class exam: " + error);
    } finally {
        loading.value = false;
    }
};

//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.testName = route.query.testName?.toString() || "";
//         pageParams.status = route.query.status || exam_status_options.value[0].value;
//         pageParams.statusFilter = true;

//         getData();
//     }
// });

watch(
    () => Object.keys(route.query).length,
    () => {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.testName = route.query.testName?.toString() || "";
        pageParams.status = route.query.status || exam_status_options.value[0].value;
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

const getFormattedRelativeTime = (hoursAgo: number) => {
    if (hoursAgo < 24) {
        return `${hoursAgo} hour${hoursAgo !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 7) {
        const days = Math.floor(hoursAgo / 24);
        return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 30) {
        const weeks = Math.floor(hoursAgo / (24 * 7));
        return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    } else if (hoursAgo < 24 * 365) {
        const months = Math.floor(hoursAgo / (24 * 30));
        return `${months} month${months !== 1 ? "s" : ""} ago`;
    } else {
        const years = Math.floor(hoursAgo / (24 * 365));
        return `${years} year${years !== 1 ? "s" : ""} ago`;
    }
};

const getTagColor = (status: string) => {
    switch (status) {
        case CLASS_EXAM_STATUS.COMPLETED: {
            return "#3b82f6";
        }
        case CLASS_EXAM_STATUS.ACTIVE: {
            return "#22C55E";
        }
        case CLASS_EXAM_STATUS.UPCOMING: {
            return "#f59e0b";
        }
    }
};

const onRedirectToCreate = () => {
    router.push({ name: "User_Test_Create", params: { id: classId.value } });
};

const onRedirectToUpdate = (testId: string) => {
    router.push({ name: "User_Test_Update", params: { id: testId } });
};

const onDeleteTest = (testId: string) => {
    Modal.confirm({
        title: t("class_exam.modal.delete_title"),
        content: t("class_exam.modal.delete_content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: async () => {
            let result = await ApiTest.Delete(testId);
            if (result.data.success) {
                message.success(t("message.deleted_successfully"));
                getData();
            }
        },
    });
};

const onRedirectToAttempt = (testId: string) => {
    router.push({ name: "User_Test_Attempt", params: { id: testId } });
};

const onRedirectToResult = (testId: string) => {
    router.push({
        name: "User_Class_Exam_Result",
        params: { classId: classId.value, testId: testId },
    });
};

onMounted(async () => {
    const sidebarActiveItem = "class";
    emit("updateSidebar", sidebarActiveItem);

    await getClassData();
    await getPermission();
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
                        <RouterLink :to="{ name: '' }" class="breadcrumb-item-class">
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
                        <span>{{ $t("class_index.title") }}</span>
                        <span>{{ $t("class_exam.sub_title") }}</span>
                    </div>
                    <a-button type="primary" class="main-color-btn" @click="onRedirectToCreate">
                        <i class="me-2 bx bx-list-plus"></i>
                        {{ $t("class_exam.buttons.assign_test") }}
                    </a-button>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                {{ $t("class_index.navigators.exam") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Quiz' }">
                                {{ $t("class_index.navigators.quiz") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Student' }">
                                {{ $t("class_index.navigators.member") }}
                            </RouterLink>
                        </div>
                    </div>
                    <a-select
                        v-model:value="pageParams.status"
                        style="width: 200px"
                        @change="getData"
                    >
                        <a-select-option
                            v-for="option in exam_status_options"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <div style="width: 300px; padding: 0px">
                        <Input
                            @input="getData"
                            v-model="pageParams.testName"
                            :placeholder="t('class_exam.other.search_placeholder')"
                        >
                            <template #icon>
                                <i class="bx bx-search"></i>
                            </template>
                        </Input>
                    </div>
                </div>

                <template v-if="loading">
                    <a-skeleton active :loading="loading"></a-skeleton>
                    <a-skeleton active :loading="loading"></a-skeleton>
                    <a-skeleton active :loading="loading"></a-skeleton>
                </template>
                <template v-else>
                    <div v-if="exam_data.length > 0" class="exam-item-container">
                        <div class="exam-item" v-for="exam in exam_data">
                            <i class="bx bx-book-open exam-item-icon"></i>
                            <div>
                                <div class="exam-item-title">
                                    {{ exam.name }}
                                    <a-tag :color="getTagColor(exam.status)">
                                        {{ $t(`class_exam.select_option.${exam.status}`) }}
                                    </a-tag>
                                </div>
                                <div class="exam-item-info exam-item-date">
                                    <div>
                                        <i class="bx bx-calendar"></i>
                                        {{ dayjs(exam.timeStart).format("DD/MM/YYYY HH:mm A") }}
                                    </div>
                                </div>
                                <div class="exam-item-info exam-info-detail">
                                    <div class="exam-item-questions">
                                        <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                        {{ exam.numberOfQuestions }}
                                        {{ $t("dashboards.list_items.quiz.questions") }}
                                    </div>
                                    <div class="exam-item-time">
                                        <i class="bx bx-time-five"></i>
                                        {{ exam.timeLimit }}
                                        {{ $t("class_exam.other.min") }}
                                    </div>
                                    <span class="exam-item-assigned completion">
                                        {{ exam.numberOfCompletion }}
                                        {{ $t("class_exam.other.completions") }}
                                    </span>
                                    <span class="exam-item-assigned">
                                        {{ $t("class_exam.other.assigned") }}
                                        {{ getFormattedRelativeTime(exam.relativeTime) }}
                                    </span>
                                </div>
                            </div>
                            <div class="exam-item-actions">
                                <a-button
                                    v-if="exam.status === CLASS_EXAM_STATUS.ACTIVE"
                                    type="primary"
                                    class="main-color-btn"
                                    @click="onRedirectToAttempt(exam.testId)"
                                >
                                    {{ $t("class_exam.buttons.attempt") }}
                                </a-button>
                                <template v-if="userRoleInClass !== CLASS_STUDENT_POSITION.STUDENT">
                                    <a-tooltip v-if="exam.status === CLASS_EXAM_STATUS.UPCOMING">
                                        <template #title>
                                            {{ $t("question_sets_index.buttons.edit") }}
                                        </template>
                                        <i
                                            class="bx bx-edit"
                                            @click="onRedirectToUpdate(exam.testId)"
                                        ></i>
                                    </a-tooltip>
                                    <a-tooltip>
                                        <template #title>
                                            {{ $t("class_member.buttons.history_test") }}
                                        </template>
                                        <i @click="onRedirectToResult(exam.testId)">
                                            <FileDoneOutlined />
                                        </i>
                                    </a-tooltip>

                                    <a-tooltip>
                                        <template #title>
                                            {{ $t("question_sets_index.buttons.delete") }}
                                        </template>
                                        <i
                                            class="text-danger bx bx-trash-alt"
                                            @click="onDeleteTest(exam.testId)"
                                        ></i>
                                    </a-tooltip>
                                </template>
                            </div>
                        </div>
                    </div>
                    <template v-else>
                        <div class="w-100 d-flex justify-content-center">
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
                                `${range[0]}-${range[1]} of ${total} ${t('class_exam.other.items')}`
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
</template>
<style scoped>
.navigator-item {
    font-size: 14px !important;
}

.exam-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
}

.exam-item:hover {
    border: 1px solid var(--main-color);
}

.exam-item i {
    font-size: 18px;
}

.exam-item-icon {
    display: flex;
    width: 35px;
    height: 35px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 16px;
    border-radius: 50%;
    background: #221a32;
    color: #7c3aed;
    margin-right: 12px;
}

.exam-item-title {
    font-size: 18px;
    font-weight: 600;
}

.exam-item-info {
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.exam-item-info i {
    font-size: 14px;
}

.exam-item-date {
    font-size: 14px;
    color: #ccc;
}
.exam-info-detail {
    border-top: 1px solid var(--border-color);
    margin-top: 5px;
    padding-top: 5px;
}

.exam-item-time {
    margin: 0px 20px;
}

.exam-item-assigned {
    color: var(--text-color-grey);
}

.exam-item-assigned.completion {
    margin-right: 10px;
}

.exam-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
.exam-item-actions i {
    font-size: 24px;
    margin: 0px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
}
.main-color-btn {
    font-size: 16px;
}
.exam-item-container {
    min-height: 450px;
}
</style>
