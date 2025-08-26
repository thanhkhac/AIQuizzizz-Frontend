<script setup lang="ts">
import ApiClass from "@/api/ApiClass";

import type ClassQuestionSetPageParams from "@/models/request/class/classQSPageParams";
import type { Class } from "@/models/response/class/class";
import type { ClassQuestionSet } from "@/models/response/class/classQuestionSet";
import CLASS_STUDENT_POSITION from "@/constants/classStudentPosition";

import { ref, onMounted, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { message, Modal } from "ant-design-vue";
import Input from "@/shared/components/Common/Input.vue";
import { useI18n } from "vue-i18n";
import Validator from "@/services/Validator";
import ERROR from "@/constants/errors";

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

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    name: route.query.name?.toString() || "",
    // shareMode: route.query.shareMode || share_mode_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});

const question_set_data = ref<ClassQuestionSet[]>([]);
const userRoleInClass = ref<string>("");
const loading = ref(false);
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
        updateClassFormState.name = classData.value.name;
        updateClassFormState.topic = classData.value.topic;
    } catch (error: any) {
        const errorKeys = Object.keys(error.response.data.errors);
        if (
            errorKeys.includes(ERROR.NOT_FOUND_STUDENT_IN_CLASS) ||
            errorKeys.includes(ERROR.NOT_FOUND_USER_IN_CLASS)
        ) {
            router.push({ name: "User_Class" });
            return;
        }
    }
};

const getData = async () => {
    try {
        loading.value = true;
        let result = await ApiClass.GetAllQSByLimit(
            classId.value.toString(),
            pageParams as ClassQuestionSetPageParams,
        );
        if (result.data.success) {
            let resultData = result.data.data;
            question_set_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Class_Quiz",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            // shareMode: pageParams.shareMode,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Class_Quiz",
                        params: {
                            id: classId.value,
                        },
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            // shareMode: pageParams.shareMode,
                        },
                    });
                }
                pageParams.statusFilter = !pageParams.statusFilter; //toggle filter status
            }
        }
    } catch (error) {
        console.log("ERROR: GETALLEXAMBYLIMIT class qs: " + error);
    } finally {
        loading.value = false;
    }
};

//update when page change (url)
// onUpdated(() => {
//     if (Object.keys(route.query).length === 0) {
//         pageParams.pageNumber = route.query.pageNumber || 1;
//         pageParams.pageSize = route.query.pageSize || 10;
//         pageParams.name = route.query.name?.toString() || "";
//         // pageParams.shareMode = route.query.status || share_mode_options.value[0].value;
//         pageParams.statusFilter = true;

//         getData();
//     }
// });

watch(
    () => Object.keys(route.query).length,
    () => {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.name = route.query.name?.toString() || "";
        // pageParams.shareMode = route.query.status || share_mode_options.value[0].value;
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

const onDeleteQSFromClass = (questionSetId: string) => {
    Modal.confirm({
        title: t("class_question_set.modal.delete_title"),
        content: t("class_question_set.modal.delete_content"),
        okText: t("sidebar.buttons.ok"),
        cancelText: t("sidebar.buttons.cancel"),
        onOk: async () => {
            const result = await ApiClass.DeleteQuestionSetFromClass(
                classData.value.classId,
                questionSetId,
            );
            if (!result.data.success) {
                message.success(t("message.removed_failed"));
                return;
            }
            message.success(t("message.removed_successfully"));
            getData();
        },
    });
};

const onRedirectToDetail = (id: string) => {
    router.push({ name: "User_QuestionSet_Detail", params: { id } });
};

//#region update class

const rules = {
    name: [
        {
            required: true,
            message: t("message.required"),
            trigger: "change",
        },
        {
            max: 100,
            message: t("message.out_of_range", { max_length: 100 }),
            trigger: "change",
        },
    ],
    topic: [
        {
            max: 100,
            message: t("message.out_of_range", { max_length: 100 }),
            trigger: "change",
        },
    ],
};

const modal_update_open = ref(false);

const updateClassFormRef = ref();
const updateClassFormState = reactive({
    name: classData.value.name,
    topic: classData.value.topic,
});

const isUpdateLoading = ref(false);
const onUpdateClass = async () => {
    isUpdateLoading.value = true;
    try {
        updateClassFormRef.value?.validate(); //this will throw err to catch
        let result = await ApiClass.Update({
            classId: classId.value,
            name: updateClassFormState.name,
            topic: updateClassFormState.topic,
        });
        if (!result.data.success) {
            message.error(t("message.updated_failed"));
            return;
        }
        message.success(t("message.updated_successfully"));
        modal_update_open.value = false;
        window.location.reload();
    } catch (error) {
        console.log(error);
    } finally {
        isUpdateLoading.value = false;
    }
};
//#endregion

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
                    <template v-if="userRoleInClass === CLASS_STUDENT_POSITION.OWNER">
                        <li class="title-breadcrumb-item">
                            <RouterLink
                                :to="{ name: '' }"
                                class="breadcrumb-item-class"
                                @click="modal_update_open = true"
                            >
                                <span> {{ classData.name }} </span>
                                <span class="breadcrumb-item-topic"> {{ classData.topic }} </span>
                            </RouterLink>
                            <i class="bx bx-edit"></i>
                        </li>
                    </template>
                    <template v-else>
                        <li class="title-breadcrumb-item">
                            <RouterLink :to="{ name: '' }" class="breadcrumb-item-class">
                                <span> {{ classData.name }} </span>
                                <span class="breadcrumb-item-topic"> {{ classData.topic }} </span>
                            </RouterLink>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("class_question_set.title") }}</span>
                        <span>{{ $t("class_question_set.sub_title") }}</span>
                    </div>
                </div>
                <div class="content-item-functions">
                    <div class="content-item-navigators">
                        <div class="navigator-container">
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Exam' }">
                                {{ $t("class_index.navigators.exam") }}
                            </RouterLink>
                            <RouterLink class="navigator-item navigator-active" :to="{ name: '' }">
                                {{ $t("class_index.navigators.quiz") }}
                            </RouterLink>
                            <RouterLink class="navigator-item" :to="{ name: 'User_Class_Student' }">
                                {{ $t("class_index.navigators.member") }}
                            </RouterLink>
                        </div>
                    </div>
                    <!-- <a-select
                        v-model:value="pageParams.shareMode"
                        style="width: 200px"
                        @change="getData"
                    >
                        <a-select-option v-for="option in share_mode_options" :value="option.value">
                            {{ option.label }}
                        </a-select-option>
                    </a-select> -->
                    <div style="width: 300px; padding: 0px">
                        <Input
                            @input="getData"
                            v-model="pageParams.name"
                            :placeholder="t('question_sets_index.search_placeholder')"
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
                    <div v-if="question_set_data.length > 0" class="quiz-item-container">
                        <div class="quiz-item" v-for="exam in question_set_data">
                            <i class="bx bx-book-open quiz-item-icon"></i>
                            <div>
                                <div class="quiz-item-title">
                                    {{ exam.name }}
                                </div>
                                <div class="quiz-item-description">
                                    {{ exam.description }}
                                </div>
                                <div class="quiz-item-info quiz-info-detail">
                                    <div class="quiz-item-questions">
                                        <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                        {{ exam.totalQuestionCount }}
                                        {{ $t("dashboards.list_items.quiz.questions") }}
                                    </div>
                                    <div class="quiz-item-created-by">
                                        {{ $t("class_question_set.other.created_by") }}
                                        {{ exam.createBy }}
                                    </div>
                                </div>
                            </div>
                            <div class="exam-item-actions">
                                <a-button
                                    type="primary"
                                    class="me-3 main-color-btn"
                                    @click="onRedirectToDetail(exam.id)"
                                >
                                    {{ $t("class_question_set.buttons.view") }}
                                </a-button>

                                <a-tooltip
                                    v-if="userRoleInClass !== CLASS_STUDENT_POSITION.STUDENT"
                                >
                                    <template #title>
                                        {{ $t("question_sets_index.buttons.delete") }}
                                    </template>
                                    <i
                                        style="cursor: pointer"
                                        class="text-danger bx bx-trash-alt"
                                        @click="onDeleteQSFromClass(exam.id)"
                                    ></i>
                                </a-tooltip>
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
                                `${range[0]}-${range[1]} of ${total} ${t('class_question_set.other.items')}`
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

    <a-modal
        centered
        wrap-class-name="medium-modal"
        :open="modal_update_open"
        @cancel="modal_update_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink @click="modal_update_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("class_index.modal.update_title") }}</span>
                    </a-col>
                </a-row>
            </div>
            <a-form
                ref="updateClassFormRef"
                layout="vertical"
                :rules="rules"
                :model="updateClassFormState"
            >
                <a-form-item>
                    <Input
                        :label="t('class_index.modal.create_class_name_label')"
                        :name="'name'"
                        v-model="updateClassFormState.name"
                        :placeholder="t('class_index.modal.create_class_name_placeholder')"
                        :is-required="true"
                        :max-length="100"
                    ></Input>
                </a-form-item>
                <a-form-item>
                    <Input
                        :label="t('class_index.modal.create_class_topic_label')"
                        :name="'topic'"
                        v-model="updateClassFormState.topic"
                        :placeholder="t('class_index.modal.create_class_topic_placeholder')"
                        :max-length="100"
                    ></Input>
                </a-form-item>
            </a-form>
        </div>
        <template #footer>
            <a-button
                :loading="isUpdateLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onUpdateClass"
            >
                {{ $t("update_QS.buttons.update") }}
            </a-button>
        </template>
    </a-modal>
</template>
<style scoped>
.navigator-item {
    font-size: 14px !important;
}

.quiz-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
}

.quiz-item-icon {
    display: flex;
    width: 35px;
    height: 35px;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    font-size: 16px;
    border-radius: 50%;
    background: var(--main-color-theme);
    color: var(--main-color);
    margin-right: 12px;
}
</style>
