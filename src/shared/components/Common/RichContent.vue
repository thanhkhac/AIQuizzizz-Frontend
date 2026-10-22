<script setup lang="ts">
import { computed, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { message } from "ant-design-vue";
import { copyToClipboard } from "@/services/ClipboardService";
import { highlighterReady, renderContent } from "@/services/RichContentService";
import "@/assets/rich-content.css";

/**
 * Hiển thị nội dung câu hỏi / giải thích / đáp án theo textFormat (PlainText | Html | Markdown).
 * Mọi HTML đều đã qua DOMPurify (xem RichContentService). `inline`: chỉ inline markdown, không <p>, không block
 * (dùng cho đáp án, item ghép cặp / sắp xếp). Với `inline`, format không phải Markdown luôn hiển thị là text thường.
 */
interface Props {
    content?: string | null;
    format?: "PlainText" | "Html" | "Markdown" | string | null;
    inline?: boolean;
    /** Thẻ gốc, mặc định div (inline mode cũng dùng div + display:inline để không dính các luật CSS "span:last-of-type" của Ant) */
    tag?: string;
}

const props = withDefaults(defineProps<Props>(), {
    content: "",
    format: null,
    inline: false,
    tag: undefined,
});

const { t } = useI18n();

const rendered = computed(() => {
    // phụ thuộc vào highlighter để render lại có màu khi highlight.js tải xong
    void highlighterReady.value;
    return renderContent(props.content, props.format, {
        inline: props.inline,
        copyLabel: t("rich_content.copy"),
        copiedLabel: t("rich_content.copied"),
    });
});

const rootTag = computed(() => props.tag ?? "div");

let resetTimer: ReturnType<typeof setTimeout> | null = null;

const onClick = async (event: MouseEvent) => {
    const button = (event.target as HTMLElement | null)?.closest?.("[data-rc-copy]") as HTMLElement | null;
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();

    const code = button.closest(".rc-code")?.querySelector("pre code")?.textContent ?? "";
    const label = button.querySelector(".rc-copy-label");
    if (!(await copyToClipboard(code))) {
        message.error(t("rich_content.copy_failed"));
        return;
    }

    if (!label) return;
    const original = label.textContent;
    label.textContent = button.dataset.copiedLabel ?? "Copied";
    button.classList.add("copied");
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
        label.textContent = original;
        button.classList.remove("copied");
    }, 1500);
};

onBeforeUnmount(() => {
    if (resetTimer) clearTimeout(resetTimer);
});
</script>

<template>
    <component
        :is="rootTag"
        v-if="rendered.kind === 'html'"
        :class="['rich-content', inline ? 'rc-inline' : 'rc-block']"
        @click="onClick"
        v-html="rendered.value"
    ></component>
    <component
        :is="rootTag"
        v-else
        :class="['rich-content rc-plain', inline ? 'rc-inline' : 'rc-block']"
        >{{ rendered.value }}</component
    >
</template>
