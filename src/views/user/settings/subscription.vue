<script setup lang="ts">
import ApiPlan from "@/api/ApiPlan";
import type Plan from "@/models/response/plan/plan";
import { message, Modal } from "ant-design-vue";

import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const planData = ref<Plan[]>([]);

const loading = ref(false);
const getData = async () => {
    try {
        loading.value = true;

        const result = await ApiPlan.GetAll();
        if (result.data.success) {
            planData.value = result.data.data;
        }
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false;
    }
};

const onBuyPlan = (plan: Plan) => {
    Modal.confirm({
        title: "Are your sure to perform this action?",
        content: `This will cost you ${plan.price}đ for purchasing this plan`,
        centered: true,
        onOk: async () => {
            const result = await ApiPlan.BuyPlan(plan.id);
            if (result.data.success) {
                message.success(t("message.purchased_successfully"));
            }
        },
    });
};

onMounted(async () => {
    await getData();
});
</script>

<template>
    <div class="content">
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span>{{ $t("settings.subscription.title") }}</span>
                    <span>{{ $t("settings.subscription.sub_title") }}</span>
                </div>
            </div>
        </div>
        <div class="content-item">
            <div class="content-item-title">
                <div>
                    <span> {{ $t("settings.subscription.plan.title") }} </span>
                    <span> {{ $t("settings.subscription.plan.sub_title") }} </span>
                </div>
            </div>
            <template v-if="loading">
                <a-skeleton :loading="loading"></a-skeleton>
                <a-skeleton :loading="loading"></a-skeleton>
            </template>
            <div v-else class="plan-container">
                <div
                    v-for="plan in planData"
                    :class="[
                        'plan-item',
                        plan.id === '8d4acf9c-1eb2-4941-a2bc-01034db75ca0' ? 'popular-item' : '',
                    ]"
                >
                    <div
                        v-if="plan.id === '8d4acf9c-1eb2-4941-a2bc-01034db75ca0'"
                        class="popular-badge"
                    >
                        {{ $t("settings.subscription.plan.popular") }} 🔥
                    </div>
                    <div class="plan-name">{{ plan.name }}</div>
                    <div class="plan-price">
                        {{ plan.price }}đ
                        <div v-if="plan.unit === 'Day'" class="plan-duration">
                            {{ plan.duration }} ({{ $t("settings.subscription.plan.day_plural") }})
                        </div>
                        <div v-if="plan.unit === 'Year'" class="plan-duration">
                            {{ plan.duration }} ({{
                                $t(
                                    `settings.subscription.plan.${plan.duration > 0 ? "year_plural" : "year_singular"}`,
                                )
                            }})
                        </div>
                    </div>
                    <div class="plan-advance-container">
                        <div class="plan-advance">
                            <i v-if="plan.canLearn" class="bx bx-check"></i>
                            <i v-else class="bx bx-x"></i>
                            {{ $t("settings.subscription.plan.learn") }}
                        </div>
                        <div class="plan-advance">
                            <i v-if="plan.canOpenTest" class="bx bx-check"></i>
                            <i v-else class="bx bx-x"></i>
                            {{ $t("settings.subscription.plan.test") }}
                        </div>
                    </div>
                    <a-button
                        type="primary"
                        size="large"
                        class="main-color-btn"
                        @click="onBuyPlan(plan)"
                    >
                        {{ $t("settings.subscription.buttons.Change_plan") }}
                    </a-button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.plan-container {
    width: 100%;
    display: flex;
    flex-direction: row;
    padding: 10px;
}

.plan-item {
    width: calc(100% / 3 - 20px);
    height: 300px;
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin: 0px 10px;
    border: 2px solid var(--form-item-border-color);
    border-radius: 8px;
    cursor: pointer;
}
.plan-item:hover {
    background-color: var(--content-item-border-color);
}

.popular-item {
    position: relative;
    border-color: var(--main-color);
}

.popular-badge {
    position: absolute;
    top: -12px;
    right: 20px;

    background-color: var(--main-color);
    color: var(--text-color-contrast);
    font-size: 14px;
    padding: 0px 15px;
    border-radius: 10px;
}

.plan-name {
    color: var(--text-color);
    font-size: 18px;
    font-weight: 600;
}
.plan-price {
    font-size: 24px;
    font-weight: 700;
    margin: 0px 10px 20px 0px;
    display: flex;
    flex-direction: column;
}
.plan-duration {
    font-size: 14px;
    font-synthesis: 400px;
}

.plan-advance-container {
    flex: 1;
}
.plan-advance i {
    color: var(--correct-answer-color);
}
.main-color-btn {
    display: flex;
    justify-content: center;
}
</style>
