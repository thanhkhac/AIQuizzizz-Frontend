<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";

import { Editor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

const modelValue = defineModel("modelValue");
const placeholder = defineModel("placeholder", { default: "" });
const label = defineModel("label", { default: "" });
const name = defineModel("name", { default: "" });
const html = defineModel("html");
const isRequired = defineModel("isRequired", { default: false });

const autoEscapeHtml = defineModel("autoEscapeHtml", { default: true });

const editor = ref(null);

const emit = defineEmits(["update:modelValue", "change"]);

function escapeHtmlTags(text) {
    if (!text || typeof text !== "string") {
        return text;
    }

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

function containsHtmlTags(text) {
    if (!text || typeof text !== "string") {
        return false;
    }

    const htmlTagRegex = /<\/?[a-zA-Z][^>]*>/g;
    return htmlTagRegex.test(text);
}

function prepareTipTapContent(content) {
    if (!content || !autoEscapeHtml.value) {
        return content;
    }

    // if content containe HTML tag escape
    if (containsUnmatchedTags(content) || containsCodeLikeTags(content)) {
        return escapeHtmlTags(content);
    }

    return content;
}

function containsUnmatchedTags(text) {
    const openTagRegex = /<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;

    const openTags = [];
    const closeTags = [];

    let match;
    while ((match = openTagRegex.exec(text)) !== null) {
        openTags.push(match[1].toLowerCase());
    }

    while ((match = closeTagRegex.exec(text)) !== null) {
        closeTags.push(match[1].toLowerCase());
    }

    // more open than close -> unmatch
    return openTags.length > closeTags.length;
}

function containsCodeLikeTags(text) {
    // to check if text contain similar patterns
    const codeLikePatterns = [
        /what does.*<[^>]+>/i,
        /explain.*<[^>]+>/i,
        /<[^>]+>\s*means/i,
        /<[^>]+>\s*tag/i,
    ];

    return codeLikePatterns.some((pattern) => pattern.test(text));
}

function escapeContent(content) {
    return escapeHtmlTags(content);
}

// set content with optional escaping
function setEditorContent(content, shouldEscape = null) {
    if (!editor.value) return;

    const escape = shouldEscape !== null ? shouldEscape : autoEscapeHtml.value;
    const processedContent = escape ? prepareTipTapContent(content) : content;

    editor.value.commands.setContent(processedContent, false);
}

onMounted(() => {
    const initialContent = html.value || modelValue.value;

    editor.value = new Editor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: placeholder.value,
            }),
        ],
        content: prepareTipTapContent(initialContent),
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML();
            modelValue.value = newContent;
            emit("change", newContent);
        },
    });

    if (isRequired.value && editor.value?.isEmpty) {
        const proseMirrorEl = editor.value?.view?.dom;
        proseMirrorEl?.classList.add("invalid");
    }
});

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy();
    }
});

const editorContainer = ref(null);

watch(modelValue, async (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
        setEditorContent(newValue);
    }
    await nextTick();

    const proseMirrorEl = editor.value?.view?.dom;
    if (!proseMirrorEl) return;

    if (isRequired.value) {
        const isEmpty = newValue?.replace(/<\/?p>/g, "").trim() === "";
        proseMirrorEl.classList.toggle("invalid", isEmpty);
    }
});

defineExpose({
    editor,
    escapeContent,
    setEditorContent,
    prepareTipTapContent,
});
</script>
<template>
    <a-form-item class="input-container" :name="name" :label="label">
        <div class="toolbar">
            <button
                :class="['toolbar-button', !editor?.can().undo() ? 'is-disabled' : '']"
                @click="editor?.chain().focus().undo().run()"
                :disabled="!editor?.can().undo()"
            >
                <i class="bx bx-undo"></i>
            </button>
            <button
                :class="['toolbar-button', !editor?.can().redo() ? 'is-disabled' : '']"
                @click="editor?.chain().focus().redo().run()"
                :disabled="!editor?.can().redo()"
            >
                <i class="bx bx-redo"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleBold() ? 'is-disabled' : '',
                    editor?.isActive('bold') ? 'is-active' : '',
                ]"
                @click="editor?.chain().focus().toggleBold().run()"
                :disabled="!editor?.can().toggleBold()"
            >
                <i class="bx bx-bold"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleItalic() ? 'is-disabled' : '',
                    editor?.isActive('italic') ? 'is-active' : '',
                ]"
                @click="editor?.chain().focus().toggleItalic().run()"
                :disabled="!editor?.can().toggleItalic()"
            >
                <i class="bx bx-italic"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleUnderline() ? 'is-disabled' : '',
                    editor?.isActive('underline') ? 'is-active' : '',
                ]"
                @click="editor.chain().focus().toggleUnderline().run()"
            >
                <i class="bx bx-underline"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleBulletList() ? 'is-disabled' : '',
                    editor?.isActive('bulletList') ? 'is-active' : '',
                ]"
                @click="editor?.chain().focus().toggleBulletList().run()"
            >
                <i class="bx bx-list-ul"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleOrderedList() ? 'is-disabled' : '',
                    editor?.isActive('orderedList') ? 'is-active' : '',
                ]"
                @click="editor?.chain().focus().toggleOrderedList().run()"
            >
                <i class="bx bx-list-ol"></i>
            </button>
            <button
                :class="[
                    'toolbar-button',
                    !editor?.can().toggleCodeBlock() ? 'is-disabled' : '',
                    editor?.isActive('codeBlock') ? 'is-active' : '',
                ]"
                @click="editor.chain().focus().toggleCodeBlock().run()"
            >
                <i class="bx bx-code-alt"></i>
            </button>
        </div>
        <editor-content ref="editorContainer" :editor="editor" :placeholder="placeholder" />
    </a-form-item>
</template>

<style>
.input-container {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
}
.toolbar {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    overflow: hidden;
    padding: 5px 0px;
}
.toolbar-button {
    padding: 10px;
    background-color: var(--form-item-background-color);
    border: none;
    margin: 0px 10px;
    color: var(--text-color);
    height: 100% !important;
    border-radius: 5px;
    display: flex;
    align-items: center;
}
.toolbar-button:hover {
    background-color: var(--main-color);
}

.toolbar-button i {
    font-size: 20px;
}

.is-disabled {
    color: var(--text-color-grey);
}
.is-disabled:hover {
    cursor: default;
    background-color: var(--form-item-background-color);
}
.is-active {
    background-color: var(--main-color);
}

.ProseMirror {
    background-color: var(--content-item-children-background-color);
    border: 1px solid var(--form-item-border-color);
    padding: 10px;
    height: 100%;
    min-height: 100px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    color: var(--text-color);
}

.ProseMirror:focus {
    border: 1px solid var(--form-item-border-color);
    outline: none;
    box-shadow: none;
}

.ProseMirror pre {
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    padding: 10px;
    border-radius: 5px;
}

pre {
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    color: var(--text-color);
    padding: 10px;
    border-radius: 5px;
}

.ProseMirror p {
    margin-bottom: 0px;
}

.ant-form-item-label > label {
    color: var(--text-color) !important; /* or any custom color */
    font-weight: 500;
    font-size: 14px;
}
.ProseMirror.invalid {
    border-color: red !important;
}
</style>
