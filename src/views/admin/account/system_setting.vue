<script setup lang="ts">
import ApiAdmin from "@/api/ApiAdmin";
import type SystemSettingsResp from "@/models/response/admin/systemSettingResp";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["updateSidebar"]);
const { t } = useI18n();

const isUpdateLoading = ref(false);
const updateSystemSettingFormRef = ref();

onMounted(() => {
    const sidebarActiveItem = "system_settings";
    emit("updateSidebar", sidebarActiveItem);
    getSystemSettingsData();
});

const system_settings = reactive<SystemSettingsResp>({
    id: "",
    inputCostPerMillionTokens: 0,
    outputCostPerMillionTokens: 0,
    fixedSystemFee: 0,
    maxInputToken: 0,
    maxOutputToken: 0,
});

const rules = {
    inputCostPerMillionTokens: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            type: "number",
            max: 1000000000,
            message: "Max Output Token must be less than 1,000,000,000",
            trigger: "change",
        },
    ],
    outputCostPerMillionTokens: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            type: "number",
            max: 1000000000,
            message: "Max Output Token must be less than 1,000,000,000",
            trigger: "change",
        },
    ],
    fixedSystemFee: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            type: "number",
            max: 1000000000,
            message: "Max Output Token must be less than 1,000,000,000",
            trigger: "change",
        },
    ],
    maxInputToken: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            type: "number",
            min: 0,
            max: 1048575,
            message: "Max Input Token must be less than 1,048,576",
            trigger: "change",
        },
    ],
    maxOutputToken: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        {
            type: "number",
            max: 65535,
            message: "Max Output Token must be less than 65,536",
            trigger: "change",
        },
    ],
};

const onUpdate = async () => {
    try {
        await updateSystemSettingFormRef.value.validate();
        isUpdateLoading.value = true;
        const plainData = { ...system_settings };
        const { id, ...dataWithoutId } = plainData;

        console.log("System settings (without id):", dataWithoutId);
        let result = await ApiAdmin.SystemSettingsUpdate(dataWithoutId);
        if (result.data.success) {
            message.success("Update successfully.");
        }
        getSystemSettingsData();
    } catch (error: any) {
        message.error("Update fail.");
        console.log("error", error.response.data);
    } finally {
        isUpdateLoading.value = false;
    }
};

const getSystemSettingsData = async () => {
    try {
        let result = await ApiAdmin.SystemSettings();
        const data = result.data.data as SystemSettingsResp;
        console.log(data);
        if (result.data.success) {
            Object.assign(system_settings, {
                id: data.id,
                inputCostPerMillionTokens: data.inputCostPerMillionTokens,
                outputCostPerMillionTokens: data.outputCostPerMillionTokens,
                fixedSystemFee: data.fixedSystemFee,
                maxInputToken: data.maxInputToken,
                maxOutputToken: data.maxOutputToken,
            });
        }
    } catch (err) {
        console.log(err);
    }
};
</script>

<template>
    <div class="page-container">
        <!-- header title -->
        <div class="title-container">
            <div class="main-title">
                <span>System settings</span>
            </div>
        </div>

        <div class="content">
            <div class="content-item">
                <a-form
                    layout="vertical"
                    ref="updateSystemSettingFormRef"
                    :model="system_settings"
                    :rules="rules"
                >
                    <a-row class="w-100 d-flex justify-content-between">
                        <a-col :span="11">
                            <a-form-item
                                label="Input Cost Per Million Tokens"
                                name="inputCostPerMillionTokens"
                            >
                                <a-input-number
                                    v-model:value="system_settings.inputCostPerMillionTokens"
                                    class="update_input_name"
                                    min="0"
                                    :is-required="true"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :span="11">
                            <a-form-item
                                label="Output Cost Per Million Tokens"
                                name="outputCostPerMillionTokens"
                            >
                                <a-input-number
                                    v-model:value="system_settings.outputCostPerMillionTokens"
                                    class="update_input_name"
                                    min="0"
                                />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="w-100 d-flex justify-content-between">
                        <a-col :span="11">
                            <a-form-item label="Max Input Token" name="maxInputToken">
                                <a-input-number
                                    v-model:value="system_settings.maxInputToken"
                                    class="update_input_name"
                                    min="0"
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :span="11">
                            <a-form-item label="Max Output Token" name="maxOutputToken">
                                <a-input-number
                                    v-model:value="system_settings.maxOutputToken"
                                    class="update_input_name"
                                    min="0"
                                />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <a-row class="w-100 d-flex justify-content-between">
                        <a-col :span="11">
                            <a-form-item label="Fixed System Fee" name="fixedSystemFee">
                                <a-input-number
                                    v-model:value="system_settings.fixedSystemFee"
                                    class="update_input_name"
                                    min="0"
                                />
                            </a-form-item>
                        </a-col>
                    </a-row>
                    <div class="w-100 d-flex justify-content-end">
                        <a-button
                            :loading="isUpdateLoading"
                            class="main-color-btn"
                            key="submit"
                            type="primary"
                            @click="onUpdate"
                        >
                            {{ t("admin.manage_subscription.btn.save") }}
                        </a-button>
                    </div>
                </a-form>
            </div>
        </div>
    </div>
</template>

<style scoped>
.update_input_name {
    width: 100%;
    align-items: center;
}
</style>
