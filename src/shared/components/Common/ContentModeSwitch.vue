<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { Modal } from "ant-design-vue";
import type { RequestQuestion } from "@/models/request/question";
import {
    hasContent,
    modeOf,
    switchQuestionMode,
    type EditorMode,
} from "@/services/ContentModeService";

/**
 * Công tắc chế độ nội dung của một câu hỏi: "Rich text" (TipTap) | "Markdown".
 * Đổi chế độ chuyển luôn nội dung câu hỏi + giải thích; có nội dung thì hỏi xác nhận (chuyển đổi có thể mất định dạng).
 */
const props = defineProps<{ question: RequestQuestion }>();

const { t } = useI18n();

const mode = computed<EditorMode>(() => modeOf(props.question.textFormat));

const onChange = (event: { target?: { value?: unknown } }) => {
    const target = event?.target?.value as EditorMode | undefined;
    if (!target || target === mode.value) return;

    const needsConfirm = hasContent(props.question.questionText) || hasContent(props.question.explainText);
    if (!needsConfirm) {
        switchQuestionMode(props.question, target);
        return;
    }

    const toMarkdown = target === "markdown";
    Modal.confirm({
        title: t(
            toMarkdown
                ? "rich_content.mode.switch_to_markdown_title"
                : "rich_content.mode.switch_to_rich_title",
        ),
        content: t(
            toMarkdown
                ? "rich_content.mode.switch_to_markdown_content"
                : "rich_content.mode.switch_to_rich_content",
        ),
        okText: t("create_QS.buttons.ok"),
        cancelText: t("create_QS.buttons.cancel"),
        centered: true,
        onOk: () => switchQuestionMode(props.question, target),
    });
};
</script>

<template>
    <div class="content-mode-switch" role="group" :aria-label="$t('rich_content.mode.label')">
        <a-radio-group
            :value="mode"
            button-style="solid"
            size="middle"
            @change="onChange"
        >
            <a-radio-button value="rich">{{ $t("rich_content.mode.rich") }}</a-radio-button>
            <a-radio-button value="markdown">{{ $t("rich_content.mode.markdown") }}</a-radio-button>
        </a-radio-group>
    </div>
</template>

<style scoped>
.content-mode-switch {
    margin-right: 10px;
    white-space: nowrap;
}

/* màu theo theme + accent của app (mặc định Ant là xanh dương) */
.content-mode-switch :deep(.ant-radio-button-wrapper) {
    min-height: 32px;
    border-color: var(--form-item-border-color);
    background-color: var(--form-item-background-color);
    color: var(--c-text);
}
.content-mode-switch :deep(.ant-radio-button-wrapper:hover) {
    color: var(--c-primary-text);
}
.content-mode-switch :deep(.ant-radio-button-wrapper-checked),
.content-mode-switch :deep(.ant-radio-button-wrapper-checked:hover) {
    border-color: var(--main-color) !important;
    background-color: var(--main-color) !important;
    color: var(--c-on-primary) !important;
}
.content-mode-switch :deep(.ant-radio-button-wrapper-checked::before) {
    background-color: var(--main-color) !important;
}
.content-mode-switch :deep(.ant-radio-button-wrapper:focus-within) {
    outline: 2px solid var(--c-focus-ring);
    outline-offset: 1px;
}
</style>
