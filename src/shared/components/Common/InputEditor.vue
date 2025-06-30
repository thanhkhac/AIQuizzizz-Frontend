<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";

import { Editor, EditorContent } from "@tiptap/vue-3";
import { StarterKit } from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

const modelValue = defineModel("modelValue");
const placeholder = defineModel("placeholder", { default: "" });
const label = defineModel("label", { default: "" });
const name = defineModel("name", { default: "" });

const editor = ref(null);

const emit = defineEmits(["update:modelValue", "change"]);

onMounted(() => {
    editor.value = new Editor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({
                placeholder: placeholder.value,
            }),
        ],
        content: modelValue.value,
        onUpdate: ({ editor }) => {
            modelValue.value = editor.getHTML();
            emit("change", editor.getHTML());
        },
    });
});

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy();
    }
});

watch(modelValue, (newValue) => {
    if (editor.value && newValue !== editor.value.getHTML()) {
        editor.value.commands.setContent(newValue, false);
    }
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
        <editor-content :editor="editor" :placeholder="placeholder" />
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
    background-color: var(--input-item-background-color);
    border: 1px solid var(--input-item-border-color);
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    overflow: hidden;
    padding: 5px 0px;
}
.toolbar-button {
    padding: 10px;
    background-color: var(--input-item-background-color);
    border: none;
    margin: 0px 10px;
    color: var(--text-color-white);
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
    background-color: var(--input-item-background-color);
}
.is-active {
    background-color: var(--main-color);
}

.ProseMirror {
    border: 1px solid var(--input-item-border-color);
    padding: 10px;
    height: 100%;
    min-height: 100px;
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
    color: var(--text-color-white);
}

.ProseMirror:focus {
    border: 1px solid var(--input-item-border-color);
    outline: none;
    box-shadow: none;
}

.ProseMirror pre {
    background-color: var(--input-item-background-color);
    border: 1px solid var(--input-item-border-color);
    padding: 10px;
    border-radius: 5px;
}

pre {
    background-color: var(--input-item-background-color);
    color: var(--text-color-white);
    border: 1px solid var(--input-item-border-color);
    padding: 10px;
    border-radius: 5px;
}

.ProseMirror p {
    margin-bottom: 0px;
}

.ant-form-item-label > label {
    color: var(--text-color-white) !important; /* or any custom color */
    font-weight: 500;
    font-size: 14px;
}
</style>
