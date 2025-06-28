<script setup lang="ts">
const modelValue = defineModel<string>("modelValue");
const placeholder = defineModel<string>("placeholder");
const label = defineModel<string>("label");
</script>

<template>
    <a-form-item :label="label" name="title" class="input-item">
        <a-textarea v-model:value="modelValue" :placeholder="placeholder" class="input">
            <template #prefix>
                <slot name="icon" />
            </template>
        </a-textarea>
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
    height: 100px !important;
    max-height: 160px !important;
    color: var(--text-color-white);
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
