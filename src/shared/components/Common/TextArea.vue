<script setup lang="ts">
import { ref } from "vue";
const modelValue = defineModel<string>("modelValue");
const placeholder = defineModel<string>("placeholder");
const label = defineModel<string>("label");
const name = defineModel<string>("name");

const maxLength = defineModel<number>("maxLength");
const isRequired = defineModel<boolean>("isRequired");

const emit = defineEmits(["update:value", "change"]);

// const isTouched = ref(false); // disable is-invalid at first
//     if (!isTouched.value) isTouched.value = true;

const onUpdate = () => {
    emit("update:value", modelValue.value);
    emit("change", modelValue.value);
};

const checkInvalid = () => {
    const valueLength = modelValue.value?.length ?? 0;
    const max = maxLength.value ?? Infinity;

    const required = isRequired.value;
    const isEmpty = !modelValue.value;

    const isOutOfRange = valueLength > max;
    const isInvalid = (required && isEmpty) || isOutOfRange;

    let message = "This field is required";
    if (isOutOfRange) message = `Limit: ${max} characters.`;

    return { isInvalid, message };
};
</script>

<template>
    <a-form-item :label="label" :name="name" class="input-item">
        <a-tooltip :title="checkInvalid().isInvalid ? checkInvalid().message : null" :color="'red'">
            <a-textarea
                @input="onUpdate"
                v-model:value="modelValue"
                :placeholder="placeholder"
                class="input"
                :class="['input', checkInvalid().isInvalid ? 'is-invalid' : '']"
            >
                <template #prefix>
                    <slot name="icon" />
                </template>
            </a-textarea>
        </a-tooltip>
    </a-form-item>
</template>
<style scoped>
.input-item {
    display: flex;
    justify-content: center;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 0px;
    color: var(--text-color-white);
    width: 100%;
}

.input {
    height: 35px;
    padding: 5px 10px;
    border: none;
    background: var(--input-item-background-color);
    border: 1px solid var(--input-item-border-color);
    min-height: 60px;
    max-height: 160px;
    color: var(--text-color-white);
}

.input.is-invalid {
    border: 1px solid red !important;
}

.input::placeholder {
    color: var(--text-color-grey);
    opacity: 0.6;
}

.input:focus-within {
    box-shadow: none;
}
/*---*/

::v-deep(.input textarea) {
    color: var(--text-color-white);
    background: var(--input-item-background-color);
}

::v-deep(.ant-form-item-label > label) {
    color: var(--text-color-white); /* or any custom color */
    font-weight: 500;
    font-size: 14px;
}

::v-deep(.input i) {
    color: var(--text-color-grey);
    transform: translateY(1px);
    margin-right: 8px;
}

::v-deep(.ant-row) {
    width: 100% !important;
}
</style>
