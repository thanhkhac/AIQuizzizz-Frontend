<script setup lang="ts">
import { message } from "ant-design-vue";
import { ref, reactive } from "vue";
import { useI18n } from "vue-i18n";

interface FormState {
    title: string;
    description: string;
    tags: string[];
    questions: any[]; // or specify the type if you know it
}

const { t } = useI18n();

const formRef = ref();

const formState = reactive<FormState>({
    title: "",
    description: "",
    tags: [],
    questions: [],
});

const rules = {
    title: [
        {
            required: "true",
            message: "This field is required",
            trigger: "change",
        },
        {
            length: 100,
            message: "Limit 100",
            trigger: "change",
        },
    ],
    description: [
        {
            length: 200,
            message: "Limit 200",
            trigger: "change",
        },
    ],
    tags: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 5) {
                    return Promise.reject("You can only add up to 5 tags.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
    questions: [
        {
            validator: (rule: string, value: []) => {
                if (value && value.length > 500) {
                    return Promise.reject("You can only add up to 5 questions.");
                }
                return Promise.resolve();
            },
            trigger: "change",
        },
    ],
};
const tagContent = ref("");
const addTag = () => {
    if (tagContent.value) {
        formState.tags.push(tagContent.value);
        tagContent.value = "";
    }
};

const removeTag = (index: number) => {
    console.log(index);
    formState.tags.splice(index, 1);
};
</script>
<template>
    <div class="page-container">
        <div class="title-container">
            <a-row class="w-100 d-flex align-items-center">
                <a-col :span="1">
                    <RouterLink :to="{ name: 'User_Library' }">
                        <i class="bx bx-chevron-left navigator-back-button"></i>
                    </RouterLink>
                </a-col>
                <a-col class="main-title" :span="23">
                    <span> {{ $t("question_sets_index.title") }}</span> <br />
                    <span>
                        {{ $t("question_sets_index.sub_title") }}
                    </span>
                </a-col>
            </a-row>
        </div>
        <div class="content">
            <div class="content-item">
                <div class="content-item-title">
                    <div>
                        <span>{{ $t("question_sets_index.sections.quiz.title") }}</span>
                        <span>{{ $t("question_sets_index.sections.quiz.sub_title") }}</span>
                    </div>
                </div>
                <div class="content-item-body"></div>
            </div>
            <div class="content-item">
                <div class="form-item">
                    <label>Quiz title</label>
                    <div class="input-item">
                        <input
                            v-model="formState.title"
                            :placeholder="t('question_sets_index.search_placeholder')"
                        />
                    </div>
                </div>
                <div class="d-flex">
                    <div class="form-item">
                        <label>Description</label>
                        <div class="input-item">
                            <textarea
                                v-model="formState.description"
                                placeholder="textarea with clear icon"
                                allow-clear
                            />
                        </div>
                    </div>
                    <div class="form-item">
                        <label>Tag</label>
                        <div class="tag-container">
                            <div
                                class="tag-item"
                                v-for="(tag, index) in formState.tags"
                                :key="index"
                            >
                                {{ tag }}
                                <i class="bx bx-x" @click="removeTag(index)"></i>
                            </div>
                        </div>
                        <div class="tag-inputter">
                            <div class="input-item">
                                <input
                                    v-model="tagContent"
                                    :placeholder="t('question_sets_index.search_placeholder')"
                                />
                            </div>
                            <i class="bx bx-plus" @click="addTag"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.navigator-back-button {
    padding: 5px;
    font-size: 30px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    color: var(--text-color-white);
    transition: all 0.2s ease-in-out;
}
.navigator-back-button:hover {
    background-color: var(--main-color);
}
.form-item {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
}
.form-item label {
    color: var(--text-color-white);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 5px;
}

.input-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #27272a;
    background: #1f1f20;
    width: 100%;
}

.input-item input {
    flex: 1;
    padding: 5px 10px;
    border: none;
    background-color: #1f1f20;
    color: var(--text-color-white);
}

.input-item input:focus {
    outline: none;
}

.input-item i {
    color: #757575;
    margin: 0px 5px;
}

.input-item textarea {
    flex: 1;
    padding: 5px 10px;
    border: none;
    background-color: #1f1f20 !important;
    color: var(--text-color-white);
    max-height: 150px;
    min-height: 60px;
}
.input-item:nth-child(2) {
    margin-bottom: 10px;
}
.tag-container {
    height: 150px;
    max-height: 150px;
    display: flex;
    justify-content: start;
    flex-wrap: wrap;
    padding: 5px;
    margin-bottom: 10px;
    background-color: #101010 !important;
    overflow-y: scroll;
    border: 1px solid #27272a;
    border-radius: 5px;
}

.tag-item {
    padding: 0px 1px 0px 6px;
    border: 1px solid #a1a1aa;
    border-radius: 120px;
    height: 22px;
    font-size: 14px;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;
}

.tag-item i {
    background-color: #f44336;
    padding: 2px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 10px;
}

.tag-inputter {
    display: flex;
}

.tag-inputter i {
    padding: 5px;
    font-size: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--main-color);
    border-radius: 5px;
    margin-left: 10px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.tag-inputter i:hover {
    background-color: var(--main-sub-color);
}
</style>
