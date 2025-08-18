<script setup lang="ts">
import { reactive, ref } from "vue";
import ApiAuthentication from "@/api/ApiAuthentication";
import { notification } from "ant-design-vue";
import { LockOutlined, MailOutlined } from "@ant-design/icons-vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const router = useRouter();

const sessionEmail = sessionStorage.getItem("email");

const formState = reactive({
    email: sessionEmail,
    verificationCode: "",
});

const resentFormState = reactive({
    email: sessionStorage.getItem("email"),
});

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
    verificationCode: [
        {
            required: true,
            message: t("auth.validation.required"),
            trigger: "change",
        },
    ],
};

const formRef = ref();
const labelCol = { span: 24 };
const wrapperCol = { span: 24 };

const modal_open = ref(false);
const modal_is_success = ref(false);

const send_button_loading = ref(false);
const verify_button_loading = ref(false);

type NotificationType = "success" | "info" | "warning" | "error";
const showNotification = (type: NotificationType, message: string, description: string) => {
    notification[type]({
        message,
        description,
    });
};

const onRequestEmailVerification = () => {
    formRef.value.validate().then(async () => {
        try {
            send_button_loading.value = true;
            let send_email_result = await ApiAuthentication.RequestEmailVerification({
                email: resentFormState.email,
            });
            if (send_email_result.data.success) {
                showNotification("success", "Send email result", "Success");
                sessionStorage.setItem("email", resentFormState.email ? resentFormState.email : "");
                modal_is_success.value = true;
                return;
            }
            showNotification("error", "Send email result", "ERROR");
        } catch (error) {
            console.log(error);
        } finally {
            send_button_loading.value = false;
        }
    });
};

const onFinish = () => {
    formRef.value.validate().then(async () => {
        try {
            verify_button_loading.value = true;

            let result = await ApiAuthentication.VerifyEmail(formState);

            if (!result.data.success) {
                showNotification("error", "Send email result", "ERROR");
                return;
            }

            showNotification("success", "Send email result", "Success. Redirecting...");
            //wait 3sec before go to login
            setTimeout(() => {
                router.push({ name: "login" });
            }, 1000);
        } catch (error) {
            console.log(error);
        } finally {
            verify_button_loading.value = false;
        }
    });
};
</script>
<template>
    <div class="authentication-item">
        <div class="authentication-item-title">
            <span> {{ $t("auth.greetings.verify_email") }}</span> <br />
            <span>{{ $t("auth.instructions.verify_email", { email: sessionEmail }) }}</span>
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
            <a-form-item label="" name="verificationCode">
                <label>{{ $t("auth.inputs.code") }}</label>
                <a-input-password
                    size="large"
                    v-model:value="formState.verificationCode"
                    :placeholder="$t('auth.inputs.code')"
                >
                    <template #addonBefore>
                        <LockOutlined />
                    </template>
                </a-input-password>
            </a-form-item>
            <a-form-item>
                <a-button
                    :loading="verify_button_loading"
                    @click="onFinish"
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
                >
                    {{ $t("auth.buttons.verify") }}
                </a-button>
            </a-form-item>
        </a-form>
        <div class="authentication-item-navigator">
            {{ $t("auth.navigators.resend_email") }}
            <RouterLink :to="{ name: '' }" @click="modal_open = true">
                {{ $t("auth.buttons.resend") }}
            </RouterLink>
        </div>
    </div>

    <a-modal :visible="modal_open" title="" @cancel="modal_open = false" centered>
        <a-form
            :class="['authentication-item-form', modal_is_success ? 'd-none' : '']"
            ref="formRef"
            :model="resentFormState"
            :labelCol="labelCol"
            :wrapperCol="wrapperCol"
            :rules="rules"
        >
            <a-form-item label="" name="email">
                <label>{{ $t("auth.inputs.email") }}</label>
                <a-input
                    size="large"
                    v-model:value="resentFormState.email"
                    :placeholder="$t('auth.inputs.email')"
                >
                    <template #addonBefore>
                        <MailOutlined />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-button
                    :loading="send_button_loading"
                    @click="onRequestEmailVerification"
                    size="large"
                    type="primary"
                    style="background-color: #9823f5; width: 100%"
                >
                    {{ $t("auth.buttons.send") }}
                </a-button>
            </a-form-item>
        </a-form>
        <a-result
            :class="[!modal_is_success ? 'd-none' : '']"
            status="success"
            title="Email sent successfully!"
            :sub-title="$t('auth.instructions.verify_email', { email: resentFormState.email })"
        >
        </a-result>

        <template #footer></template>
    </a-modal>
</template>
<style scoped>
::v-deep(.ant-input-group-addon) {
    background-color: #fff !important;
}
label {
    color: var(--text-color);
}
</style>
