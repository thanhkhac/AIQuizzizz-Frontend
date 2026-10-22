<script setup lang="ts">
import user_image from "@/assets/user.png";
import { avatarUrl } from "@/services/AvatarService";
import { computed, ref, watch } from "vue";

// Ảnh đại diện tròn; chưa có ảnh hoặc tải lỗi -> ảnh mặc định
const props = withDefaults(defineProps<{ avatarId?: string | null; size?: number; alt?: string }>(), {
    avatarId: null,
    size: 40,
    alt: "",
});

const failed = ref(false);
watch(
    () => props.avatarId,
    () => (failed.value = false),
);

const src = computed(() => (!failed.value && avatarUrl(props.avatarId)) || user_image);
const isDefault = computed(() => src.value === user_image);
</script>
<template>
    <img
        :class="['user-avatar', isDefault ? 'user-avatar-default' : '']"
        :src="src"
        :alt="alt"
        :width="size"
        :height="size"
        :style="{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }"
        loading="lazy"
        decoding="async"
        @error="failed = true"
    />
</template>
<style scoped>
.user-avatar {
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background-color: var(--form-item-background-color);
    border: 1px solid var(--form-item-border-color);
}

/* ảnh mặc định là icon: chừa viền trong như trước */
.user-avatar-default {
    object-fit: contain;
    padding: 3px;
}
</style>
