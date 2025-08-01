<script setup lang="ts">
import ApiClass from "@/api/ApiClass";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { ref, onMounted, reactive, h } from "vue";
import { useRoute, useRouter } from "vue-router";

import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();

const indicator = h(LoadingOutlined, {
    style: {
        fontSize: "100px",
        color: "var(--main-color)",
    },
    spin: true,
});

const joinClassFormState = reactive({
    code: route.params.code.toString(),
});

const onJoinClass = async () => {
    try {
        const result = await ApiClass.JoinClass(joinClassFormState);
        if (!result.data.success) {
            message.error("Join class failed");
        }
        message.success("Join class successfully.");
    } catch (error) {
        console.log(error);
        router.push({ name: "User_Class" });
    }
};

onMounted(async () => {
    if (!joinClassFormState.code) router.push({ name: "404" });
    await onJoinClass();
});
</script>
<template>
    <div
        style="width: 100vw; height: 100vh"
        class="d-flex justify-content-center align-items-center"
    >
        <a-spin size="large" :indicator="indicator" />
    </div>
</template>
