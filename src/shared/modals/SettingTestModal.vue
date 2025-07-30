<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";

import TEST_GRADE_ATTEMPT_METHOD from "@/constants/testGradeAttempMethod";
import TEST_GRADE_QUESTION_METHOD from "@/constants/testGradeQuestionMethod";
import type { RuleObject } from "ant-design-vue/es/form/interface";

import Input from "../components/Common/Input.vue";

import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { message } from "ant-design-vue";
dayjs.extend(utc);

const { t } = useI18n();

interface Props {
    className: string;
    formState: any;
    formRef: any;
}

const props = defineProps<Props>();

const modal_open = ref(false);

const openTestSettingModal = () => {
    modal_open.value = true;
};

const closeModal = async () => {
    props.formState.startTime = range.value[0].toISOString();
    props.formState.startTime = range.value[1].toISOString();

    try {
        const result = await formRef.value.validate();
        if (result) {
            modal_open.value = false;
        }
    } catch {}
};

//expose functions to main ref
defineExpose({
    openTestSettingModal,
});

//#region formstate range
const formRef = ref(props.formRef);
type RangeValue = [Dayjs, Dayjs];
const range = ref<RangeValue>([dayjs(), dayjs()]);
const onRangeChange = (dates: RangeValue) => {
    if (dates) {
        props.formState.startTime = dates[0].toISOString();
        props.formState.endTime = dates[1].toISOString();
        range.value[0] = dates[0];
        range.value[1] = dates[1];
    }
};

const rules = {
    range: [
        {
            validator(_: RuleObject, value: [Dayjs, Dayjs] | null) {
                if (!range.value) {
                    return Promise.reject("required");
                }
                const diffInMinutes = range.value[1].diff(range.value[0], "minute");
                if (diffInMinutes < props.formState.timeLimit) {
                    return Promise.reject(
                        `Start time and end time must be at least ${props.formState.timeLimit} minutes (time limit) apart`,
                    );
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    title: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            validator: (rule: RuleObject, value: string) => {
                if (value?.length > 100) return Promise.reject("Limit: 100 characters.");
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    timeLimit: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
    passingScore: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
    shuffle: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
    maxAttempt: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
};

//#endregion

//#region attempt select
const optionAttemptKeys = Object.values(TEST_GRADE_ATTEMPT_METHOD);
const select_attempt_options = computed(() =>
    optionAttemptKeys.map((key) => ({
        label: key,
        value: key,
    })),
);

//#endregion

//#region grade question select
// const optionGradeQuestionKeys = Object.values(TEST_GRADE_QUESTION_METHOD);
// const select_grade_question_options = computed(() =>
//     optionGradeQuestionKeys.map((key) => ({
//         label: key,
//         value: key,
//     })),
// );
//#endregion

const onQuestionGradeMethodChange = (checked: boolean) => {
    props.formState.gradeQuestionMethod = checked
        ? TEST_GRADE_QUESTION_METHOD.PARTIAL
        : TEST_GRADE_QUESTION_METHOD.ALL_OR_NOTHING;
};

watch(
    () => [props.formState.startTime, props.formState.startTime],
    ([newStart, newEnd]) => {
        if (newStart && newEnd) {
            range.value[0] = dayjs(newStart);
            range.value[1] = dayjs(newEnd);
        }
    },
    { immediate: true },
);

watch(
    () => props.formState.timeLimit,
    async (newTimeLimit) => {
        try {
            await formRef.value.validate();
        } catch {}
    },
);

onMounted(async () => {
    message.info("Change to startTime endTime when api fixed");
});
</script>

<template>
    <a-modal
        centered
        width="100%"
        wrap-class-name="full-modal setting-modal"
        :open="modal_open"
        @cancel="closeModal"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink @click="closeModal" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="23">
                        <span>Assign new test for class SEP490</span>
                    </a-col>
                </a-row>
            </div>
            <div class="content-item modal-test-setting">
                <div class="content-item-title">
                    <div>
                        <span>Test settings</span>
                        <span>Config how your test work</span>
                    </div>
                </div>
                <a-form
                    ref="formRef"
                    :model="formState"
                    :rules="rules"
                    class="w-100"
                    layout="vertical"
                >
                    <a-form-item>
                        <Input
                            class="question-input-item"
                            v-model="formState.name"
                            :isRequired="true"
                            :placeholder="'Enter test title'"
                            :label="'Test title'"
                            :max-length="100"
                        />
                    </a-form-item>

                    <a-row class="form-item-row">
                        <a-col :span="24">
                            <a-form-item
                                :rules="rules.range"
                                label="Start date | End date"
                                class="input-item"
                                name="range"
                            >
                                <a-range-picker
                                    @change="onRangeChange"
                                    size="large"
                                    show-time
                                    v-model:value="range"
                                ></a-range-picker>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="form-item-row">
                        <a-col :span="10">
                            <a-form-item
                                label="Number of Attempts"
                                class="input-item"
                                name="maxAttempt"
                            >
                                <a-input-number
                                    size="large"
                                    :addon-after="'time'"
                                    v-model:value="formState.maxAttempt"
                                    min="1"
                                    max="100"
                                >
                                    <template #prefix>
                                        <i class="bx bx-repost"></i>
                                    </template>
                                </a-input-number>
                            </a-form-item>
                        </a-col>
                        <a-col :span="10">
                            <a-form-item label="Shuffle" class="input-item" name="shuffle">
                                <a-input-number
                                    size="large"
                                    :addon-after="'times'"
                                    v-model:value="formState.shuffle"
                                    min="1"
                                    max="100"
                                >
                                    <template #prefix>
                                        <i class="bx bx-shuffle"></i>
                                    </template>
                                </a-input-number>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="form-item-row">
                        <a-col :span="10">
                            <a-form-item label="Time Limit" class="input-item" name="timeLimit">
                                <a-input-number
                                    size="large"
                                    :addon-after="'minutes'"
                                    v-model:value="formState.timeLimit"
                                    min="1"
                                    max="1500"
                                >
                                    <template #prefix>
                                        <i class="bx bx-time-five"></i> </template></a-input-number
                            ></a-form-item>
                        </a-col>
                        <a-col :span="10">
                            <a-form-item
                                label="Passing score"
                                class="input-item"
                                name="passingScore"
                            >
                                <a-input-number
                                    size="large"
                                    :addon-after="'%'"
                                    v-model:value="formState.passingScore"
                                    min="1"
                                    max="100"
                                >
                                    <template #prefix>
                                        <i class="bx bx-check-circle"></i>
                                    </template> </a-input-number
                            ></a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="form-item-row">
                        <a-col :span="10" class="input-item switch">
                            <div class="switch-content">
                                <div class="switch-title">Show correct answers</div>
                                <div class="switch-sub-title">
                                    Allow students to view correct answer after test
                                </div>
                            </div>
                            <a-switch v-model:checked="formState.isShowCorrectAnswerInReview">
                            </a-switch
                        ></a-col>
                        <a-col :span="10">
                            <a-form-item label="Final score (optional)" class="input-item">
                                <a-select size="large" v-model:value="formState.gradeAttemptMethod">
                                    <a-select-option
                                        v-for="option in select_attempt_options"
                                        :value="option.value"
                                    >
                                        {{ option.label }}
                                    </a-select-option>
                                </a-select>
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="form-item-row">
                        <a-col :span="10" class="input-item switch">
                            <div class="switch-content">
                                <div class="switch-title">Partial grade method</div>
                                <div class="switch-sub-title">
                                    Give partial credit if the student’s answer partially matches
                                    the expected answer
                                </div>
                            </div>
                            <a-switch
                                :checked="
                                    formState.gradeQuestionMethod ===
                                    TEST_GRADE_QUESTION_METHOD.PARTIAL
                                "
                                @change="onQuestionGradeMethodChange"
                            >
                            </a-switch>
                        </a-col>
                        <a-col :span="10" class="input-item switch">
                            <div class="switch-content">
                                <div class="switch-title">Review attempts</div>
                                <div class="switch-sub-title">
                                    Allow students to review their answers after taking the test
                                </div>
                            </div>
                            <a-switch v-model:checked="formState.isAllowReviewAfterSubmit">
                            </a-switch>
                        </a-col>
                    </a-row>
                </a-form>
            </div>
        </div>
        <template #footer>
            <a-button class="main-color-btn" size="large" key="submit" type="ghost">
                Cancel
            </a-button>
            <a-button
                class="main-color-btn"
                size="large"
                key="submit"
                type="primary"
                @click="closeModal"
            >
                Next
            </a-button>
        </template>
    </a-modal>
</template>
<style scoped>
.modal-test-setting {
    border-radius: 10px;
    border: 1px solid var(--form-item-border-color);
    background: var(--content-item-background-color);
    box-shadow:
        0 4px 6px -4px rgba(0, 0, 0, 0.1),
        0 10px 15px -3px rgba(0, 0, 0, 0.1);

    height: 60%;
    width: 60%;
    margin: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

::v-deep(.ant-row) {
    width: 100%;
}
::v-deep(.ant-picker) {
    width: 100%;
}

::v-deep(.ant-input-number-group-wrapper) {
    width: 100%;
}

::v-deep(.ant-select) {
    width: 100%;
}

.form-item-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.input-item.switch {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.switch-content {
    flex: 0.8;
}
.switch-title {
    font-weight: 500;
}
.switch-sub-title {
    font-size: 14px;
    color: var(--text-color-grey);
}
</style>
