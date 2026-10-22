<script setup lang="ts">
import ApiUser from "@/api/ApiUser";
import { computed, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "@/stores/AuthStore";
import { prepareAvatarFile } from "@/services/AvatarService";

import Input from "@/shared/components/Common/Input.vue";
import UserAvatar from "@/shared/components/Common/UserAvatar.vue";
import { useI18n } from "vue-i18n";
import { message, Modal } from "ant-design-vue";
const { t } = useI18n();

const authStore = useAuthStore();

const user = ref(authStore.getUserInfo());

const formState = reactive({
    fullName: "",
    email: "",
});

const formRef = ref();

const rules = {
    fullName: [
        {
            required: true,
            whitespace: true,
            message: t("message.required"),
            trigger: "change",
        },
        {
            max: 250,
            message: t("message.out_of_range", { max_length: 250 }),
            trigger: "change",
        },
    ],
};

const onFinish = () => {
    formRef.value
        .validate()
        .then(async () => {
            const result = await ApiUser.UpdateProfile({
                fullName: formState.fullName,
            });

            if (result.data.success) {
                message.success(t("message.updated_successfully"));
                user.value = await authStore.refreshUserInfo();
                formState.fullName = user.value?.fullName ?? formState.fullName;
            }
        })
        .catch((error: any) => {
            console.log(error);
        });
};

//#region ảnh đại diện
const avatarId = computed(() => user.value?.avatarId ?? null);
const avatarInputRef = ref<HTMLInputElement>();
const avatarUploading = ref(false);
const avatarDeleting = ref(false);

const onPickAvatar = () => avatarInputRef.value?.click();

const onAvatarSelected = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ""; // chọn lại cùng file vẫn kích hoạt change
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        message.error(t("settings.profile.avatar.not_image"));
        return;
    }

    avatarUploading.value = true;
    try {
        // cắt vuông + thu nhỏ ở trình duyệt; server chuẩn hoá và kiểm duyệt ngay trong request
        const prepared = await prepareAvatarFile(file);
        const result = await ApiUser.UploadAvatar(prepared);
        if (result.data.success) {
            user.value = await authStore.refreshUserInfo();
            message.success(t("settings.profile.avatar.updated"));
        }
    } catch (error) {
        // lỗi (vi phạm, quá dung lượng, ...) đã được interceptor hiển thị
        console.log(error);
    } finally {
        avatarUploading.value = false;
    }
};

const onDeleteAvatar = () => {
    Modal.confirm({
        title: t("settings.profile.avatar.delete_confirm"),
        okText: t("settings.profile.avatar.delete"),
        cancelText: t("settings.profile.avatar.cancel"),
        okButtonProps: { danger: true },
        onOk: async () => {
            avatarDeleting.value = true;
            try {
                const result = await ApiUser.DeleteAvatar();
                if (result.data.success) {
                    user.value = await authStore.refreshUserInfo();
                    message.success(t("settings.profile.avatar.deleted"));
                }
            } finally {
                avatarDeleting.value = false;
            }
        },
    });
};
//#endregion

onMounted(() => {
    if (user.value) {
        formState.fullName = user.value.fullName || "";
        formState.email = user.value.email || "";
    }
});
</script>
<template>
    <div class="content">
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{ $t("settings.profile.title") }}</span>
                    <span>{{ $t("settings.profile.sub_title") }}</span>
                </div>
            </div>
            <a-form ref="formRef" :model="formState" :rules="rules" class="mt-5" layout="vertical">
                <a-row>
                    <a-col :span="4" class="user-image-container">
                        <div class="avatar-wrapper">
                            <UserAvatar :avatar-id="avatarId" :size="100" :alt="formState.fullName" />
                            <div v-if="avatarUploading" class="avatar-busy" aria-live="polite">
                                <a-spin size="small" />
                            </div>
                        </div>
                        <input
                            ref="avatarInputRef"
                            type="file"
                            accept="image/*"
                            class="d-none"
                            @change="onAvatarSelected"
                        />
                        <div class="avatar-actions">
                            <a-button
                                size="small"
                                :loading="avatarUploading"
                                :disabled="avatarDeleting"
                                @click="onPickAvatar"
                            >
                                <i class="bx bx-camera"></i>
                                {{
                                    avatarUploading
                                        ? $t("settings.profile.avatar.checking")
                                        : $t("settings.profile.avatar.change")
                                }}
                            </a-button>
                            <a-button
                                v-if="avatarId"
                                size="small"
                                type="text"
                                danger
                                :loading="avatarDeleting"
                                :disabled="avatarUploading"
                                @click="onDeleteAvatar"
                            >
                                {{ $t("settings.profile.avatar.delete") }}
                            </a-button>
                        </div>
                        <div class="avatar-hint">{{ $t("settings.profile.avatar.hint") }}</div>
                    </a-col>
                    <a-col :span="20" class="user-info-container">
                        <a-row>
                            <a-col :span="10">
                                <Input
                                    :label="t('settings.profile.fullname_label')"
                                    :placeholder="t('settings.profile.fullname_placeholder')"
                                    name="fullName"
                                    :max-length="250"
                                    v-model="formState.fullName"
                                />
                            </a-col>
                            <a-col :span="10" :offset="4">
                                <Input
                                    :disable="true"
                                    :readonly="true"
                                    :label="t('settings.profile.email_label')"
                                    :placeholder="t('settings.profile.email_placeholder')"
                                    v-model="formState.email"
                                />
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col class="mt-4 mb-2 d-flex justify-content-end" :span="24">
                                <a-button
                                    @click="onFinish"
                                    class="main-color-btn"
                                    type="primary"
                                    size="large"
                                >
                                    {{ $t("settings.profile.save_change") }}
                                </a-button>
                            </a-col>
                        </a-row>
                    </a-col>
                </a-row>
            </a-form>
        </div>
    </div>
</template>
<style scoped>
.user-image-container {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.avatar-wrapper {
    position: relative;
    margin: 10px;
}

.avatar-busy {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.35);
}

.avatar-actions {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.avatar-actions .ant-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.avatar-hint {
    margin-top: 6px;
    max-width: 160px;
    font-size: 12px;
    line-height: 1.4;
    text-align: center;
    color: var(--c-text-muted);
}
</style>
