<script setup lang="ts">
import { computed, ref } from "vue";
import { isMarkdownFormat } from "@/services/ContentModeService";
import RichContent from "./RichContent.vue";

//@ts-ignore
import InputEditor from "./InputEditor.vue";

/**
 * Ô nhập nội dung dài (nội dung câu hỏi / giải thích) theo chế độ của câu hỏi:
 *  - Rich text: TipTap (InputEditor), giữ nguyên hành vi cũ
 *  - Markdown : textarea monospace + xem trước trực tiếp (>= 992px: cạnh nhau, nhỏ hơn: xếp dọc,
 *               < 576px: chuyển qua lại Soạn thảo / Xem trước)
 * Các attrs (validateStatus, help...) được chuyển tiếp cho a-form-item / InputEditor.
 */
defineOptions({ inheritAttrs: false });

interface Props {
    format?: string | null;
    name?: string;
    label?: string;
    placeholder?: string;
    isRequired?: boolean;
    maxLength?: number;
}

const props = withDefaults(defineProps<Props>(), {
    format: null,
    name: "",
    label: "",
    placeholder: "",
    isRequired: false,
    maxLength: 5000,
});

const model = defineModel<string>({ default: "" });

const isMarkdown = computed(() => isMarkdownFormat(props.format));

// chỉ dùng ở < 576px
const tab = ref<"edit" | "preview">("edit");

const length = computed(() => (model.value ?? "").length);
const isInvalid = computed(
    () => (props.isRequired && !(model.value ?? "").trim()) || length.value > props.maxLength,
);
</script>

<template>
    <InputEditor
        v-if="!isMarkdown"
        v-bind="$attrs"
        v-model="model"
        :name="name"
        :label="label"
        :placeholder="placeholder"
        :is-required="isRequired"
    />
    <a-form-item v-else v-bind="$attrs" class="input-container md-editor-field" :name="name" :label="label">
        <div class="md-editor" :data-tab="tab">
            <div class="md-editor-tabs" role="tablist">
                <button
                    type="button"
                    role="tab"
                    :aria-selected="tab === 'edit'"
                    :class="['md-tab', { active: tab === 'edit' }]"
                    @click="tab = 'edit'"
                >
                    {{ $t("rich_content.mode.tab_edit") }}
                </button>
                <button
                    type="button"
                    role="tab"
                    :aria-selected="tab === 'preview'"
                    :class="['md-tab', { active: tab === 'preview' }]"
                    @click="tab = 'preview'"
                >
                    {{ $t("rich_content.mode.tab_preview") }}
                </button>
            </div>
            <div class="md-editor-grid">
                <div class="md-pane md-pane-edit">
                    <div class="md-pane-title">{{ $t("rich_content.mode.tab_edit") }}</div>
                    <a-textarea
                        v-model:value="model"
                        class="md-textarea"
                        :class="{ 'is-invalid': isInvalid }"
                        :placeholder="placeholder"
                        :auto-size="{ minRows: 5, maxRows: 18 }"
                        spellcheck="false"
                    />
                    <div class="md-meta">
                        <span class="md-hint">
                            <template v-if="name === 'questionText'">
                                {{ $t("rich_content.mode.markdown_hint") }}
                            </template>
                        </span>
                        <span :class="['md-count', { over: length > maxLength }]">
                            {{ length }} / {{ maxLength }}
                        </span>
                    </div>
                </div>
                <div class="md-pane md-pane-preview">
                    <div class="md-pane-title">{{ $t("rich_content.mode.preview") }}</div>
                    <div class="md-preview-body">
                        <RichContent v-if="(model ?? '').trim()" :content="model" format="Markdown" />
                        <div v-else class="md-preview-empty">
                            {{ $t("rich_content.mode.nothing_to_preview") }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-form-item>
</template>

<style scoped>
.md-editor {
    width: 100%;
    min-width: 0;
}
.md-editor-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    align-items: start; /* hai cột bắt đầu cùng một mức */
}
@media (min-width: 992px) {
    .md-editor-grid {
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
}
.md-pane {
    min-width: 0;
}

.md-editor-tabs {
    display: none;
    gap: 6px;
    margin-bottom: 8px;
}
.md-tab {
    min-height: 40px;
    padding: 4px 16px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 6px;
    background: var(--form-item-background-color);
    color: var(--c-text);
    font-size: 14px;
    cursor: pointer;
}
.md-tab.active {
    border-color: var(--main-color);
    background: var(--main-color);
    color: var(--c-on-primary);
}
@media (max-width: 575.98px) {
    .md-editor-tabs {
        display: flex;
    }
    .md-editor[data-tab="edit"] .md-pane-preview,
    .md-editor[data-tab="preview"] .md-pane-edit {
        display: none;
    }
    /* điện thoại đã có tab Edit/Preview nên không cần tiêu đề cột */
    .md-pane-title {
        display: none;
    }
}

.md-textarea {
    padding: 10px;
    border: 1px solid var(--form-item-border-color);
    border-radius: 5px;
    background-color: var(--form-item-background-color);
    color: var(--c-text);
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 14px;
    line-height: 1.5;
    tab-size: 4;
}
.md-textarea.is-invalid {
    border-color: red !important;
}
.md-meta {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 4px;
    font-size: 13px;
    color: var(--c-text-muted);
}
.md-hint {
    min-width: 0;
    overflow-wrap: anywhere;
}
.md-count {
    flex: none;
}
.md-count.over {
    color: var(--c-danger-text);
    font-weight: 600;
}

.md-pane-preview {
    display: flex;
    flex-direction: column;
}
/* Tiêu đề cột: ô nhập và khung xem trước dùng cùng 1 kiểu/chiều cao để hai khung thẳng hàng */
.md-pane-title {
    height: 20px;
    margin-bottom: 4px;
    font-size: 13px;
    line-height: 20px;
    color: var(--c-text-muted);
}
.md-preview-body {
    flex: 1;
    min-height: 126px; /* ≈ 5 dòng, bằng chiều cao tối thiểu của ô nhập */
    max-height: 420px;
    padding: 10px 12px;
    border: 1px dashed var(--form-item-border-color);
    border-radius: 5px;
    background-color: var(--content-item-background-color);
    color: var(--c-text);
    overflow: auto;
}
.md-preview-empty {
    color: var(--c-text-muted);
    font-size: 14px;
}
</style>
