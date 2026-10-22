<script setup lang="ts">
import { avatarColor, avatarInitial, avatarUrl } from "@/services/AvatarService";
import { computed, ref, watch } from "vue";

// Ảnh đại diện tròn; chưa có ảnh hoặc tải lỗi -> vòng tròn màu + chữ cái đầu tên (alt = họ tên)
const props = withDefaults(defineProps<{ avatarId?: string | null; size?: number; alt?: string | null }>(), {
    avatarId: null,
    size: 40,
    alt: "",
});

const failed = ref(false);
watch(
    () => props.avatarId,
    () => (failed.value = false),
);

const src = computed(() => (failed.value ? null : avatarUrl(props.avatarId)));
const initial = computed(() => avatarInitial(props.alt));
const box = computed(() => ({ width: `${props.size}px`, height: `${props.size}px`, minWidth: `${props.size}px` }));
const initialStyle = computed(() => ({
    ...box.value,
    "--avatar-bg": avatarColor(props.alt),
    fontSize: `${Math.round(props.size * 0.44)}px`,
}));
</script>
<template>
    <img
        v-if="src"
        class="user-avatar"
        :src="src"
        :alt="alt ?? ''"
        :width="size"
        :height="size"
        :style="box"
        loading="lazy"
        decoding="async"
        @error="failed = true"
    />
    <span v-else class="user-avatar user-avatar-initial" role="img" :aria-label="alt ?? ''" :style="initialStyle">
        <template v-if="initial">{{ initial }}</template>
        <i v-else class="bx bxs-user" aria-hidden="true"></i>
    </span>
</template>
<style scoped>
.user-avatar {
    display: inline-block;
    border-radius: 50%;
    object-fit: cover;
    flex-shrink: 0;
    background-color: var(--form-item-background-color);
}

.user-avatar-initial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, color-mix(in srgb, var(--avatar-bg) 82%, #fff), var(--avatar-bg));
    color: #fff;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0;
    user-select: none;
    text-transform: none;
    visibility: visible;
    opacity: 1;
}

.user-avatar-initial i {
    font-size: 0.9em;
}
</style>
