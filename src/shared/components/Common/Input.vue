<script setup lang="ts">
import { ref } from "vue";

const modelValue = defineModel<string>("modelValue");
const placeholder = defineModel<string>("placeholder");
const label = defineModel<string>("label");
const name = defineModel<string>("name");

const isRequired = defineModel<boolean>("isRequired");
const maxLength = defineModel<number>("maxLength");
const readonly = defineModel<boolean>("readonly");

const emit = defineEmits(["update:value", "change"]);

const isTouched = ref(false); // disable is-invalid at first

const onUpdate = () => {
    if (!isTouched.value) isTouched.value = true;

    emit("update:value", modelValue.value);
    emit("change", modelValue.value);
};

const checkInvalid = () => {
    const valueLength = modelValue.value?.length ?? 0;
    const max = maxLength.value ?? Infinity;

    const required = isRequired.value;
    const isEmpty = !modelValue.value;

    const isOutOfRange = valueLength > max;
    const isInvalid = (required && isEmpty && isTouched.value) || isOutOfRange;

    let message = "This field is required";
    if (isOutOfRange) message = `Limit: ${max} characters.`;

    return { isInvalid, message };
};
</script>

<template>
    <a-form-item :label="label" :name="name" class="input-item">
        <a-tooltip :title="checkInvalid().isInvalid ? checkInvalid().message : null" :color="'red'">
            <a-input
                :readonly="readonly"
                v-model:value="modelValue"
                @input="onUpdate()"
                :placeholder="placeholder"
                :class="['input', checkInvalid().isInvalid ? 'is-invalid' : '']"
            >
                <template #prefix>
                    <slot name="icon" />
                </template>
            </a-input>
        </a-tooltip>
    </a-form-item>
</template>

<style scoped>
.input-item {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 0px;
    color: var(--text-color);
    width: 100%;
}

.input {
    height: 35px;
    padding: 5px 10px;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
    color: var(--text-color);
}

.input.is-invalid {
    border: 1px solid red !important;
}

.input:hover {
    border: 1px solid var(--form-item-border-color);
}

.input::placeholder {
    color: var(--text-color-grey) !important;
    opacity: 0.6;
}

.input:focus-within {
    box-shadow: none;
}

/*---*/

::v-deep(.input input) {
    color: var(--text-color);
    background-color: var(--form-item-background-color);
}

::v-deep(.ant-form-item-label > label) {
    color: var(--text-color);
    font-weight: 500;
    font-size: 14px;
}

::v-deep(.input input::placeholder) {
    color: var(--text-color-grey) !important;
    opacity: 0.6;
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
