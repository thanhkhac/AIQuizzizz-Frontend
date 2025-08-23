<script setup lang="ts">
import ApiAdmin from "@/api/ApiAdmin";
import type SystemSettings from "@/models/request/admin/systemSetting";
import type SystemSettingsResp from "@/models/response/admin/systemSettingResp";
import Input from "@/shared/components/Common/Input.vue";
import { message } from "ant-design-vue";
import { onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["updateSidebar"]);
const { t } = useI18n();

const isUpdateLoading = ref(false);

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

const onUpdate = async () => {
    isUpdateLoading.value = true;
    try {
        const plainData = { ...system_settings };
        const { id, ...dataWithoutId } = plainData;

        console.log("System settings (without id):", dataWithoutId);
        let result = await ApiAdmin.SystemSettingsUpdate(dataWithoutId);
        if (result.data.success) {
            message.success("Update successfully.");
        }
        getSystemSettingsData();
    } catch (error: any) {
        message.error("Create fail.");
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
                <a-form layout="vertical" ref="createPlanFormRef" :model="system_settings">
                    <a-row class="w-100 d-flex justify-content-between">
                        <a-col :span="11">
                            <a-form-item
                                label="Input Cost Per Million Tokens"
                                name="inputCostPerMillionTokens"
                            >
                                <a-input-number
                                    v-model:value="system_settings.inputCostPerMillionTokens"
                                    class="update_input_name"
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
                                />
                            </a-form-item>
                        </a-col>
                        <a-col :span="11">
                            <a-form-item label="Max Output Token" name="maxOutputToken">
                                <a-input-number
                                    v-model:value="system_settings.maxOutputToken"
                                    class="update_input_name"
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
