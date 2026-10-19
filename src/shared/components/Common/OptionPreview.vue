<script setup lang="ts">
import { computed } from "vue";
import { isMarkdownFormat } from "@/services/ContentModeService";
import RichContent from "./RichContent.vue";

/** Dòng xem trước inline markdown dưới ô nhập đáp án / item (chỉ hiện khi câu hỏi ở chế độ Markdown) */
const props = defineProps<{ text?: string | null; format?: string | null }>();

const visible = computed(() => isMarkdownFormat(props.format) && !!props.text?.trim());
</script>

<template>
    <div v-if="visible" class="option-preview">
        <span class="option-preview-label">{{ $t("rich_content.mode.option_preview") }}</span>
        <RichContent class="option-preview-content" :content="text" format="Markdown" inline />
    </div>
</template>

<style scoped>
.option-preview {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-top: 4px;
    min-width: 0;
    font-size: 14px;
    color: var(--c-text);
}
.option-preview-label {
    flex: none;
    font-size: 13px;
    color: var(--c-text-muted);
}
.option-preview-content {
    flex: 1;
    min-width: 0;
}
</style>
