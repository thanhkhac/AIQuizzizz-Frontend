<script setup lang="ts">
import user_image from "@/assets/user.png";
import { reactive, ref } from "vue";
import { useAuthStore } from "@/stores/AuthStore";

import { UploadOutlined } from "@ant-design/icons-vue";
import Input from "@/shared/components/Common/Input.vue";
import TextArea from "@/shared/components/Common/TextArea.vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const authStore = useAuthStore();

const user = ref(authStore.getUserInfo());

const formState = reactive({
    imageList: [],
    fullName: "",
    email: "",
    bio: "",
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
            <a-form class="mt-5" layout="vertical">
                <a-row>
                    <a-col :span="4" class="user-image-container">
                        <img class="user-image" :src="user_image" alt="user_img" />
                        <!-- <a-upload class="user-image-upload" name="file">
                            <a-button>
                                <UploadOutlined />
                                Click to Upload
                            </a-button>
                        </a-upload> -->
                    </a-col>
                    <a-col :span="20" class="user-info-container">
                        <a-row>
                            <a-col :span="10">
                                <Input
                                    :label="t('settings.profile.fullname_label')"
                                    :placeholder="t('settings.profile.fullname_placeholder')"
                                    v-model="formState.fullName"
                                />
                            </a-col>
                            <a-col :span="10" :offset="4">
                                <Input
                                    :label="t('settings.profile.email_label')"
                                    :placeholder="t('settings.profile.email_placeholder')"
                                    v-model="formState.email"
                                />
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24" class="mt-4">
                                <TextArea
                                    :label="t('settings.profile.bio_label')"
                                    :placeholder="t('settings.profile.bio_placeholder')"
                                    v-model="formState.bio"
                                />
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col class="mt-4 mb-2 d-flex justify-content-end" :span="24">
                                <a-button class="main-color-btn" type="primary" size="large">
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

.user-image {
    width: 100px;
    height: 100px;
    margin: 10px;
    aspect-ratio: 1/1;
    background-color: var(--background-color-contrast);
    border: 1px solid var(--content-item-border-color);
    border-radius: 50%;
    color: var(--text-color);
    padding: 5px;
}
</style>
