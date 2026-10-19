<script setup lang="ts">
// Tab "Tài khoản": gộp Hồ sơ + Bảo mật + Giao diện thành một tab duy nhất (mỗi phần vẫn là một thẻ riêng, xếp dọc)
import Profile from "@/views/user/settings/profile.vue";
import Security from "@/views/user/settings/security.vue";
import Appearance from "@/views/user/settings/appearance.vue";
</script>
<template>
    <Profile />
    <Security />
    <Appearance />
</template>
