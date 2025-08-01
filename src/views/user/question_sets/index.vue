<script setup lang="ts">
import ApiQuestionSet from "@/api/ApiQuestionSet";
import type QuestionSet from "@/models/response/question_set/questionSet";
import type QuestionSetPublicPageParams from "@/models/request/question_set/publicPageParams";
import type QuestionSetPageParams from "@/models/request/question_set/questionSetPageParams";
import QUESTION_SET_SHARE_MODE from "@/constants/questionSetShareMode";
import VISIBILITY from "@/constants/visibility";

import { onMounted, ref, computed, reactive, onUpdated } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";

const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const emit = defineEmits(["updateSidebar"]);

//#region init data
const optionKeys = Object.values(QUESTION_SET_SHARE_MODE);

const share_mode_options = computed(() =>
    optionKeys.map((key) => ({
        label: t(`question_sets_index.credit.${key}`),
        value: key !== QUESTION_SET_SHARE_MODE.ALL ? key : "",
    })),
);

const loading = ref(false);
const quiz_data = ref<QuestionSet[]>([]);

const pageParams = reactive({
    pageNumber: route.query.pageNumber || 1,
    pageSize: route.query.pageSize || 10,
    name: route.query.name?.toString() || "",
    filterBy: route.query.filterBy || share_mode_options.value[0].value,
    totalCount: 0,
    statusFilter: false, //serve as a flag to check if pageParams is in url
});
const getData = async () => {
    try {
        loading.value = true;
        let result = await ApiQuestionSet.GetAllByLimit(pageParams as QuestionSetPageParams);
        if (result.data.success) {
            let resultData = result.data.data;
            quiz_data.value = resultData.items;
            pageParams.pageNumber = resultData.pageNumber;
            pageParams.pageSize = resultData.pageSize;
            pageParams.totalCount = resultData.totalCount;

            if (pageParams.statusFilter) {
                //check if filter is active
                if (pageParams.pageNumber > resultData.totalPages && pageParams.totalCount > 0) {
                    pageParams.pageNumber = 1;

                    router.push({
                        name: "User_Library",
                        query: {
                            pageNumber: 1,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            filterBy: pageParams.filterBy,
                        },
                    });
                } else {
                    router.push({
                        name: "User_Library",
                        query: {
                            pageNumber: pageParams.pageNumber,
                            pageSize: pageParams.pageSize,
                            name: pageParams.name,
                            filterBy: pageParams.filterBy,
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
onUpdated(() => {
    if (Object.keys(route.query).length === 0) {
        pageParams.pageNumber = route.query.pageNumber || 1;
        pageParams.pageSize = route.query.pageSize || 10;
        pageParams.name = route.query.name?.toString() || "";
        pageParams.filterBy = route.query.filterBy || share_mode_options.value[0].value;
        pageParams.statusFilter = true;

        getData();
    }
});

//change when page change (pageParams)
const onPaginationChange = (page: any, pageSize: any) => {
    pageParams.pageNumber = page;
    pageParams.pageSize = pageSize;
    pageParams.statusFilter = true;
    getData();
};
//#endregion

//#region calculate UI

const getPercentageComplete = (total: number, completed: number) => {
    return Math.floor((completed / total) * 100);
};

const getTagColor = (visibility: string) => {
    switch (visibility) {
        case VISIBILITY.PUBLIC:
            return "#22C55E";
        case VISIBILITY.PRIVATE:
            return "#C52225";
        default:
            return "#C52225";
    }
};

//#endregion

//#region redirect
const onRedirectToDetail = (questionSetId: string) => {
    router.push({ name: "User_QuestionSet_Detail", params: { id: questionSetId } });
};

const onRedirectToCreate = () => {
    router.push({ name: "User_QuestionSet_Create" });
};
//#endregion

onMounted(async () => {
    const sidebarActiveItem = "library";
    emit("updateSidebar", sidebarActiveItem);
    await getData();
});
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100">
                <a-col class="main-title" :span="20">
                    <span>{{ $t("question_sets_index.title") }}</span> <br />
                    <span>
                        {{ $t("question_sets_index.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title d-flex align-items-center">
                    <div>
                        <span>{{ $t("question_sets_index.sections.quiz.title") }}</span>
                        <span>{{ $t("question_sets_index.sections.quiz.sub_title") }}</span>
                    </div>

                    <a-button
                        @click="onRedirectToCreate"
                        type="primary"
                        class="main-color-btn content-item-button"
                        size="large"
                    >
                        {{ $t("dashboards.buttons.createNewQuiz") }}
                        <i class="bx bx-plus"></i>
                    </a-button>
                </div>
                <div class="content-item-functions">
                    <a-select
                        v-model:value="pageParams.filterBy"
                        style="width: 200px"
                        @change="getData"
                    >
                        <a-select-option v-for="option in share_mode_options" :value="option.value">
                            {{ option.label }}
                        </a-select-option>
                    </a-select>
                    <div style="width: 300px; padding: 0px">
                        <Input
                            v-model="pageParams.name"
                            :placeholder="t('question_sets_index.search_placeholder')"
                            @input="getData"
                        >
                            <template #icon>
                                <i class="bx bx-search"></i>
                            </template>
                        </Input>
                    </div>
                </div>
                <div class="quiz-item-container">
                    <div v-if="loading">
                        <a-skeleton :loading="loading" active></a-skeleton>
                        <a-skeleton :loading="loading" active></a-skeleton>
                    </div>
                    <template v-else>
                        <template v-if="quiz_data.length > 0">
                            <div
                                class="quiz-item"
                                v-for="quiz in quiz_data"
                                @click="onRedirectToDetail(quiz.id)"
                            >
                                <i class="bx bx-book-open quiz-item-icon"></i>
                                <div>
                                    <div class="quiz-item-title">
                                        {{ quiz.name }}
                                    </div>
                                    <div class="quiz-item-info">
                                        <div>
                                            <i class="bx bx-message-square-edit bx-rotate-270"></i>
                                            {{ quiz.totalQuestionCount }}
                                            {{ $t("dashboards.list_items.quiz.questions") }}
                                        </div>
                                        <div class="quiz-item-progress">
                                            <a-progress
                                                stroke-color="var(--main-color)"
                                                status="active"
                                                :percent="
                                                    getPercentageComplete(
                                                        quiz.totalQuestionCount,
                                                        quiz.completedQuestionCount,
                                                    )
                                                "
                                            />
                                        </div>
                                    </div>
                                    <div class="quiz-item-credit">
                                        <a-tag :color="getTagColor(quiz.visibilityMode)">
                                            {{
                                                $t(
                                                    `question_sets_index.visibility.${quiz.visibilityMode}`,
                                                )
                                            }}
                                        </a-tag>
                                        <span>
                                            |
                                            {{
                                                $t("question_sets_index.credit.createdBy", {
                                                    user: quiz.createBy,
                                                })
                                            }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <a-empty v-else>
                            <template #description>
                                <span>{{ $t("question_sets_index.empty_description") }}</span>
                            </template>
                        </a-empty>
                    </template>
                </div>

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
</template>
<style scoped>
.content-item {
    width: 100%;
    overflow-y: hidden;
}

.content-item-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--main-color);
    border: none;
    border-radius: 5px;
    padding: 8px 10px;
    font-size: 16px;
    color: var(--text-color);
    transition: all 0.2s ease-in-out;
    margin-right: 20px;
    height: 40px;
    text-decoration: none;
}

.content-item-button:hover {
    background-color: var(--main-sub-color);
}

.content-item-button i {
    font-size: 24px;
    margin-left: 10px;
    transform: translateY(1px);
}

.quiz-container {
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    color: var(--text-color);
}

.quiz-item {
    background-color: var(--content-item-children-background-color);
    margin: 10px 0px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 10px;
    display: flex;
    align-items: center;
    width: calc(100% - 50px);
    cursor: pointer;
}

.quiz-item:hover {
    border: 1px solid var(--main-color);
}

.quiz-item i {
    font-size: 18px;
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
    background: #221a32;
    color: #7c3aed;
    margin-right: 12px;
}

.quiz-item-title {
    font-size: 16px;
    font-weight: 600;
}

.quiz-item-info {
    font-size: 14px;
    color: var(--text-color-sub-white);
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 3px 0px;
}
.quiz-item-info i {
    font-size: 14px;
}

.quiz-item-progress {
    font-size: 12px;
    margin-bottom: 0 !important;
    min-width: 250px;
    margin-left: 10px;
}
.quiz-item-credit {
    color: var(--text-color-sub-white);
    font-size: 12px;
    font-weight: 400;
    display: flex;
    align-items: center;
}

.quiz-item-actions {
    flex: 1;
    display: flex;
    justify-content: end;
    align-items: center;
}
.quiz-item-actions button {
    background-color: var(--main-color);
}

.quiz-item-actions button:hover {
    background-color: var(--main-color);
}

::v-deep(.ant-progress) {
    margin: 0 !important;
}

::v-deep(.ant-progress-text) {
    color: var(--text-color) !important;
}
::v-deep(.ant-progress-inner) {
    background-color: var(--content-item-border-color);
}
::v-deep(.ant-tag) {
    font-size: 14px !important;
    font-weight: 500 !important;
}

.ant-dropdown-link {
    padding: 6px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.drop-down-container {
    background: var(--content-item-background-color) !important;
    border: 1px solid var(--main-color);
}

.content-item-functions {
    margin: 10px 0px;
    display: flex;
    align-items: end;
    justify-content: end;
    margin-right: 50px;
}

::v-deep(.ant-select) {
    margin-right: 10px !important;
}

::v-deep(.ant-select-selector) {
    height: 35px !important;
}
</style>
