<script setup lang="ts">
import { reactive, ref } from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import { notification } from "ant-design-vue";
import { MailOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();

const formRef = ref();
const labelCol = { span: 24 };
const wrapperCol = { span: 24 };

const formState = reactive({
    email: "",
});

const button_loading = ref(false);

const rules = {
    email: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
        {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t("auth.validation.email"),
            trigger: "change",
        },
    ],
};

type NotificationType = "success" | "info" | "warning" | "error";
const showNotification = (type: NotificationType, message: string, description: string) => {
    notification[type]({
        message,
        description,
    });
};

const onFinish = () => {
    formRef.value.validate().then(async () => {
        try {
            button_loading.value = true;
            const result = await ApiAuthentication.ForgotPassword(formState);
            if (result.data.success) {
                showNotification("success", "Forgot-password result", "Success");
                setTimeout(() => {
                    router.push({ name: "reset-password" });
                }, 1000);
                return;
            }
            showNotification("error", "Register result", "ERROR");
        } catch (error) {
            console.log(error);
        } finally {
            button_loading.value = false;
        }
    });
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.forgotPassword") }} </span> <br />
            <span>
                {{ $t("auth.instructions.forgotPassword") }}
            </span>
        </div>
        <a-form
            class="authentication-item-form"
            ref="formRef"
            :model="formState"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :rules="rules"
        >
            <a-form-item label="" name="email">
                <label>{{ $t("auth.inputs.email") }}</label>
                <a-input
                    size="large"
                    v-model:value="formState.email"
                    :placeholder="$t('auth.inputs.email')"
                >
                    <template #addonBefore>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-button
                    class="main-color-btn"
                    :loading="button_loading"
                    @click="onFinish"
                    size="large"
                    type="primary"
                    style="width: 100%"
                >
                    {{ $t("auth.buttons.send") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.forgot_signIn_ins") }}
            <RouterLink :to="{ name: 'login' }">
                {{ $t("auth.navigators.back_signIn_link") }}
            </RouterLink>
        </div>
    </div>
</template>
