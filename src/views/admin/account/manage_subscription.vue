<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import type ManageSubscriptionPlanResp from "../../../../src/models/response/admin/manageSubscriptionPlanResp";
import ApiAdmin from "../../../../src/api/ApiAdmin";
import Input from "@/shared/components/Common/Input.vue";
import { message, Modal } from "ant-design-vue";
import type CreateSubscription from "../../../../src/models/request/admin/createSubscription";
import type UpdateSubscription from "../../../models/request/admin/updateSubscription";
import Highcharts from "highcharts";
import RevenueLineChart from "../charts/RevenueLineChart.vue";
import SubscriberPieChart from "../charts/SubscriberPieChart.vue";
import ClassLineChart from "../charts/ClassLineChart.vue";
import type PlatformOverViewResp from "../../../models/response/admin/platformOverViewResp";

const { locale } = useI18n();
function toFullLocaleTag(tag: string) {
    if (tag === "en") return "en-US";
    if (tag === "vi") return "vi-VN";
    return "en-US";
}
const safeLocale = toFullLocaleTag(locale.value);

const emit = defineEmits(["updateSidebar"]);

const { t } = useI18n();

const modal_create_subscription_open = ref(false);
const modal_update_subscription_open = ref(false);

onMounted(() => {
    const sidebarActiveItem = "subscription";
    emit("updateSidebar", sidebarActiveItem);
    getPlatformOverviewData();
    getAllPlanData();
});

const apiData: ApiYearData[] = [];

const platform_ov = ref<PlatformOverViewResp>();
const plans = ref<ManageSubscriptionPlanResp[]>([]);

const subscribersData = computed(() => [
    { name: "New Subscribers", y: platform_ov.value?.usersHavePlan ?? 0 },
    {
        name: "Unsubscribers",
        y: (platform_ov.value?.users ?? 0) - (platform_ov.value?.usersHavePlan ?? 0),
    },
]);

const createPlanFormRef = ref();
const updatePlanFormRef = ref();

const createPlanForm = reactive<CreateSubscription>({
    name: "",
    price: 0,
    duration: 0,
    unit: "",
    canLearn: false,
    canOpenTest: false,
    canCopyOrImportQuestionSet: false,
    isActive: false,
});

const updatePlanForm = reactive<UpdateSubscription>({
    planId: "",
    name: "",
    price: 0,
    duration: 0,
    unit: "",
    canLearn: false,
    canOpenTest: false,
    canCopyOrImportQuestionSet: false,
    isActive: true,
});

const isCreateLoading = ref(false);
const isUpdateLoading = ref(false);

// create new plan
const onCreatePlan = async () => {
    isCreateLoading.value = true;
    try {
        await createPlanFormRef.value.validate();
        const UpdateCreateForm = { ...createPlanForm };
        // console.log("Dữ liệu createForm:", UpdateCreateForm);

        let result = await ApiAdmin.CreatePlan(UpdateCreateForm);
        if (result.data.success) {
            message.success("Create successfully.");
            modal_create_subscription_open.value = false;
        }
        getAllPlanData();
    } catch (error: any) {
        message.error("Create fail.");
        console.log("error", error.response.data);
    } finally {
        isCreateLoading.value = false;
    }
};

// update plan
const onUpdatePlan = async () => {
    isUpdateLoading.value = true;
    try {
        await updatePlanFormRef.value.validate();
        const UpdatePlanForm = { ...updatePlanForm };
        // console.log("Dữ liệu UpdateForm:", UpdatePlanForm);
        let result = await ApiAdmin.UpdatePlan(UpdatePlanForm);

        if (result.data.success) {
            modal_update_subscription_open.value = false;
            message.success("Update successfully.");
        }
        getAllPlanData();
    } catch (error: any) {
        message.error("Update fail.");
        console.log("error", error.response.data);
    } finally {
        isUpdateLoading.value = false;
    }
};

// validate fields
const rules = {
    name: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
    ],
    price: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        { type: "number", min: 1, message: "Price must be greater than 0", trigger: "change" },
    ],
    duration: [
        {
            required: true,
            message: "This field is required.",
            trigger: "change",
        },
        { type: "number", min: 1, message: "Duration must be greater than 0", trigger: "change" },
    ],
};

// reset form create
const resetCreatePlanForm = () => {
    createPlanForm.name = "";
    createPlanForm.price = 0;
    createPlanForm.duration = 0;
    createPlanForm.unit = unit_plan_credit_options.value[0].value;
    createPlanForm.canLearn = false;
    createPlanForm.canOpenTest = false;
    createPlanForm.canCopyOrImportQuestionSet = false;
};
watch(modal_create_subscription_open, (val) => {
    if (val) {
        resetCreatePlanForm();
    }
});

const optionKeysUnitPlan = ["Day", "Month", "Year"];
const unit_plan_credit_options = computed(() =>
    optionKeysUnitPlan.map((key) => ({
        label: t(`admin.manage_subscription.plan_unit.${key}`),
        value: key,
    })),
);

function mapPlanToFeatures(plan: ManageSubscriptionPlanResp) {
    return [
        plan.canLearn && t(`admin.manage_subscription.plan_feature.canLearn`),
        plan.canOpenTest && t(`admin.manage_subscription.plan_feature.canOpenTest`),
        plan.canCopyOrImportQuestionSet &&
            t(`admin.manage_subscription.plan_feature.canCopyOrImportQuestionSet`),
    ].filter(Boolean) as string[];
}

// get plan data by id
const getPlanData = async (planId: string) => {
    try {
        let result = await ApiAdmin.GetPlan(planId);
        const data = result.data.data;
        console.log(data);
        if (result.data.success) {
            Object.assign(updatePlanForm, {
                planId: data.id,
                name: data.name,
                price: data.price,
                duration: data.duration,
                unit: data.unit,
                canLearn: data.canLearn,
                canOpenTest: data.canOpenTest,
                canCopyOrImportQuestionSet: data.canCopyOrImportQuestionSet,
                isActive: data.isActive,
            });
        }
    } catch (err) {
        console.log(err);
    }
};
const formatCurrency = (num?: number) => {
    return Number(num).toLocaleString("en-US");
};

//platform overview
const getPlatformOverviewData = async () => {
    try {
        let result = await ApiAdmin.PlatformOverview();
        platform_ov.value = result.data.data;
    } catch (err) {
        console.log(err);
    }
};

// get all plan data
const getAllPlanData = async () => {
    try {
        let result = await ApiAdmin.GetAllPlan();
        plans.value = result.data.data;
        // console.log("All plan: ", plans.value);
    } catch (err) {
        console.log(err);
    }
};

// activate/unactivate plan
const updateActivePlan = async (plan: ManageSubscriptionPlanResp) => {
    try {
        Object.assign(updatePlanForm, {
            planId: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            unit: plan.unit,
            canLearn: plan.canLearn,
            canOpenTest: plan.canOpenTest,
            canCopyOrImportQuestionSet: plan.canCopyOrImportQuestionSet,
            isActive: plan.isActive,
        });
        let result = await ApiAdmin.UpdatePlan({ ...updatePlanForm });

        if (result.data.success) {
            modal_update_subscription_open.value = false;
            message.success("Update plan activity status successfully");
        }
        getAllPlanData();
    } catch (error: any) {
        message.error("Active fail.");
        console.log("error", error.response.data);
    } finally {
        isUpdateLoading.value = false;
    }
};

async function onTogglePlan(plan: ManageSubscriptionPlanResp) {
    Modal.confirm({
        title: "Confirm Active Subscription",
        content: "Are you sure you want to update this subscription activation status?",
        centered: true,
        onOk: async () => {
            await updateActivePlan(plan);
        },
        onCancel: () => {
            getAllPlanData();
        },
    });
}

// edit subscription
function onEditPlan(plan: ManageSubscriptionPlanResp) {
    modal_update_subscription_open.value = true;
    // console.log("PlanId edit: ", plan.id);
    getPlanData(plan.id);
}

// delete subscription
const deletePlan = async (planId: string) => {
    try {
        let result = await ApiAdmin.DeletePlan(planId);
        message.success("Delete successfully.");
        getAllPlanData();
    } catch (err) {
        message.error("Delete fail.");
        console.log(err);
    }
};
const onDeletePlan = (plan: ManageSubscriptionPlanResp) => {
    Modal.confirm({
        title: "Confirm Delete Subscription",
        content: "Are you sure you want to delete this subscription?",
        centered: true,
        onOk: () => {
            // console.log("PlanId to delete:", plan.id);
            deletePlan(plan.id);
        },
        onCancel: () => {},
    });
};
</script>
<template>
    <div class="page-container">
        <!-- header title -->
        <div class="title-container">
            <div class="main-title">
                <span>{{ t(`admin.manage_subscription.title`) }}</span>
            </div>

            <div class="title-button-container">
                <a-button
                    type="primary"
                    class="main-color-btn"
                    style="gap: 5px"
                    size="large"
                    @click="modal_create_subscription_open = true"
                >
                    <i class="bx bx-plus"></i>
                    {{ $t("admin.manage_subscription.create_new_sub") }}
                </a-button>
            </div>
        </div>

        <div class="content">
            <!-- statistic -->
            <div class="stat-content">
                <div class="stat-card">
                    <div class="stat-title">
                        <span> {{ t(`admin.manage_subscription.stat_card.total_subs`) }} </span>
                        <span> {{ platform_ov?.users }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">
                        <span> {{ t(`admin.manage_subscription.stat_card.monthly_rev`) }} </span>
                        <span> {{ formatCurrency(platform_ov?.revenue) }} VND</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">
                        <span> {{ t(`admin.manage_subscription.stat_card.new_subs`) }} </span>
                        <span> {{ platform_ov?.usersHavePlan }}</span>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">
                        <span> {{ t(`admin.manage_subscription.stat_card.class`) }} </span>
                        <span> {{ platform_ov?.classes }}</span>
                    </div>
                </div>
            </div>

            <!-- chart -->
            <div class="chart-content">
                <RevenueLineChart
                    :years="[2024, 2025]"
                    :apiData="apiData"
                    :locale="safeLocale"
                    title="Monthly Revenue"
                    @year-change="(y) => console.log('Parent year:', y)"
                />
            </div>
            <div class="chart-content">
                <ClassLineChart
                    :years="[2024, 2025]"
                    :apiData="apiData"
                    :locale="safeLocale"
                    title="Monthly New Class"
                />
                <SubscriberPieChart :data="subscribersData" title="Subscribers" />
            </div>

            <!-- plan comparison -->
            <div class="plan-comparison">
                <div class="content-item">
                    <!-- title plan comparison -->
                    <div class="title-container">
                        <a-row class="w-100 d-block">
                            <a-col class="main-title" :span="20">
                                <span>{{ t(`admin.manage_subscription.plan_comparison`) }}</span>
                            </a-col>
                            <span>{{
                                t(`admin.manage_subscription.plan_comparison_content`)
                            }}</span>
                        </a-row>
                    </div>

                    <!-- list plan -->
                    <div class="plan-comparison-row">
                        <div v-for="plan in plans" :key="plan.id" class="plan-compa-content-item">
                            <div
                                :class="{ invisible: plan.price === 0 }"
                                class="plan-comparison-card-action"
                            >
                                <a-tooltip>
                                    <template #title> Edit Plan </template>
                                    <i
                                        class="bx bx-edit"
                                        style="font-size: 20px"
                                        @click="onEditPlan(plan)"
                                    ></i>
                                </a-tooltip>
                                <a-tooltip>
                                    <template #title> Delete Plan </template>
                                    <i
                                        class="bx bx-trash"
                                        style="color: #ff002e; font-size: 20px"
                                        @click="onDeletePlan(plan)"
                                    ></i>
                                </a-tooltip>
                            </div>
                            <h5 class="mb-2">{{ plan.name }}</h5>
                            <div class="display-6 fw-bold mb-3">
                                {{ formatCurrency(plan.price) }}<span class="vnd-icon">VND</span>
                                <span class="fs-6 fw-normal">
                                    / {{ plan.duration }} {{ plan.unit }}</span
                                >
                            </div>
                            <ul class="mb-0">
                                <li v-for="f in mapPlanToFeatures(plan)" :key="f">{{ f }}</li>
                            </ul>
                            <div
                                :class="{ invisible: plan.price === 0 }"
                                class="d-flex justify-content-end mt-auto pt-1"
                            >
                                <a-tooltip>
                                    <template #title> Active/Inactive </template>
                                    <a-switch
                                        v-model:checked="plan.isActive"
                                        :checked-children="''"
                                        :un-checked-children="''"
                                        @change="onTogglePlan(plan)"
                                    />
                                </a-tooltip>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- popup create subscription -->
    <a-modal
        centered
        width="50%"
        wrap-class-name="large-modal"
        :closable="false"
        :open="modal_create_subscription_open"
        @cancel="modal_create_subscription_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink
                            @click="modal_create_subscription_open = false"
                            :to="{ name: '' }"
                        >
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("admin.manage_subscription.modal.title_create") }}</span>
                    </a-col>
                </a-row>
            </div>
            <div class="content">
                <div class="modal-content-subs-item">
                    <a-form
                        layout="vertical"
                        ref="createPlanFormRef"
                        :model="createPlanForm"
                        :rules="rules"
                    >
                        <a-form-item
                            :label="t('admin.manage_subscription.create_plan.name')"
                            name="name"
                        >
                            <Input
                                v-model:value="createPlanForm.name"
                                :placeholder="t('admin.manage_subscription.create_plan.name')"
                                style="width: 100%"
                                :is-required="true"
                            />
                        </a-form-item>

                        <a-row class="row-3-input">
                            <a-col :span="8">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.price')"
                                    name="price"
                                    class="form-item-third"
                                >
                                    <a-input-number
                                        v-model:value="createPlanForm.price"
                                        :min="0"
                                        :placeholder="
                                            t('admin.manage_subscription.create_plan.price')
                                        "
                                        style="width: 100%"
                                        :is-required="true"
                                        class="my-price-input"
                                    />
                                </a-form-item>
                            </a-col>

                            <a-col :span="8">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.duration')"
                                    class="form-item-third"
                                    name="duration"
                                >
                                    <a-input-number
                                        v-model:value="createPlanForm.duration"
                                        :min="0"
                                        :placeholder="
                                            t('admin.manage_subscription.create_plan.duration')
                                        "
                                        style="width: 100%"
                                        :is-required="true"
                                        class="my-price-input"
                                    />
                                </a-form-item>
                            </a-col>

                            <a-col :span="6">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.unit')"
                                    class="form-item-third"
                                >
                                    <a-select v-model:value="createPlanForm.unit">
                                        <a-select-option
                                            v-for="option in unit_plan_credit_options"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-form-item
                            :label="t('admin.manage_subscription.create_plan.feature')"
                            style="margin-top: 28px"
                        >
                            <div class="feature-switch-row">
                                <div class="feature-switch-item">
                                    <span>{{
                                        t("admin.manage_subscription.plan_feature.canLearn")
                                    }}</span>
                                    <a-switch v-model:checked="createPlanForm.canLearn" />
                                </div>
                                <div class="feature-switch-item">
                                    <span>{{
                                        t("admin.manage_subscription.plan_feature.canOpenTest")
                                    }}</span>
                                    <a-switch v-model:checked="createPlanForm.canOpenTest" />
                                </div>
                                <div class="feature-switch-item">
                                    <span>{{
                                        t(
                                            "admin.manage_subscription.plan_feature.canCopyOrImportQuestionSet",
                                        )
                                    }}</span>
                                    <a-switch
                                        v-model:checked="createPlanForm.canCopyOrImportQuestionSet"
                                    />
                                </div>
                            </div>
                        </a-form-item>
                    </a-form>
                </div>
            </div>
        </div>

        <template #footer>
            <a-button
                :loading="isCreateLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onCreatePlan"
            >
                {{ t("admin.manage_subscription.btn.create") }}
            </a-button>
        </template>
    </a-modal>

    <!-- popup update subscription -->
    <a-modal
        centered
        width="50%"
        wrap-class-name="large-modal"
        :closable="false"
        :open="modal_update_subscription_open"
        @cancel="modal_update_subscription_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="4">
                        <RouterLink
                            @click="modal_create_subscription_open = false"
                            :to="{ name: '' }"
                        >
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="20">
                        <span>{{ t("admin.manage_subscription.modal.title_update") }}</span>
                    </a-col>
                </a-row>
            </div>
            <div class="content">
                <div class="modal-content-subs-item">
                    <a-form
                        layout="vertical"
                        ref="updatePlanFormRef"
                        :model="updatePlanForm"
                        :rules="rules"
                    >
                        <a-form-item
                            :label="t('admin.manage_subscription.create_plan.name')"
                            name="name"
                        >
                            <a-input
                                v-model:value="updatePlanForm.name"
                                class="update_input_name"
                            />
                        </a-form-item>

                        <a-row class="row-3-input">
                            <a-col :span="7">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.price')"
                                    name="price"
                                    class="form-item-third"
                                >
                                    <a-input-number
                                        v-model:value="updatePlanForm.price"
                                        :min="0"
                                        :placeholder="
                                            t('admin.manage_subscription.create_plan.price')
                                        "
                                        style="width: 100%"
                                        :is-required="true"
                                        class="my-price-input"
                                    />
                                </a-form-item>
                            </a-col>

                            <a-col :span="7">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.duration')"
                                    class="form-item-third"
                                    name="duration"
                                >
                                    <a-input-number
                                        v-model:value="updatePlanForm.duration"
                                        :min="0"
                                        :placeholder="
                                            t('admin.manage_subscription.create_plan.duration')
                                        "
                                        style="width: 100%"
                                        :is-required="true"
                                        class="my-price-input"
                                    />
                                </a-form-item>
                            </a-col>

                            <a-col :span="7">
                                <a-form-item
                                    :label="t('admin.manage_subscription.create_plan.unit')"
                                    class="form-item-third"
                                >
                                    <a-select v-model:value="updatePlanForm.unit">
                                        <a-select-option
                                            v-for="option in unit_plan_credit_options"
                                            :key="option.value"
                                            :value="option.value"
                                        >
                                            {{ option.label }}
                                        </a-select-option>
                                    </a-select>
                                </a-form-item>
                            </a-col>
                        </a-row>

                        <a-form-item
                            :label="t('admin.manage_subscription.create_plan.feature')"
                            style="margin-top: 28px"
                        >
                            <div class="feature-switch-row">
                                <div class="feature-switch-item">
                                    <span>{{
                                        t("admin.manage_subscription.plan_feature.canLearn")
                                    }}</span>
                                    <a-switch v-model:checked="updatePlanForm.canLearn" />
                                </div>
                                <div class="feature-switch-item">
                                    <span>{{
                                        t("admin.manage_subscription.plan_feature.canOpenTest")
                                    }}</span>
                                    <a-switch v-model:checked="updatePlanForm.canOpenTest" />
                                </div>
                                <div class="feature-switch-item">
                                    <span>{{
                                        t(
                                            "admin.manage_subscription.plan_feature.canCopyOrImportQuestionSet",
                                        )
                                    }}</span>
                                    <a-switch
                                        v-model:checked="updatePlanForm.canCopyOrImportQuestionSet"
                                    />
                                </div>
                            </div>
                        </a-form-item>
                    </a-form>
                </div>
            </div>
        </div>

        <template #footer>
            <a-button
                :loading="isUpdateLoading"
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="onUpdatePlan"
            >
                {{ t("admin.manage_subscription.btn.save") }}
            </a-button>
        </template>
    </a-modal>
</template>

<style scoped>
.modal-content-subs-item {
    width: 100%;
    padding: 20px;
    margin-bottom: 0px;
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    color: var(--text-color);
    border-radius: 8px;
    overflow-y: hidden;
    z-index: 2;
}
.row-3-input {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    width: 100%;
}

.form-item-third {
    flex: 1 1 0;
    margin-bottom: 0 !important;
}

::v-deep(.my-price-input .ant-input-number-input::placeholder) {
    color: var(--text-color-grey) !important;
}
.stat-content {
    width: calc(100% - 40px);
    display: flex;
    justify-content: space-between;
    padding: 10px;
}

.stat-card {
    width: calc(20%);
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    border-radius: 8px;
}
.stat-title {
    padding: 20px;
}

.stat-title > span:nth-child(1) {
    color: var(--text-color);
    font-size: 22px;
    font-weight: 500;
}
.stat-title > span:nth-child(2) {
    color: var(--text-color);
    font-size: 20px;
    font-weight: 500;
}
.stat-title span {
    display: block;
}

.plan-comparison-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    margin-bottom: 20px;
}

.plan-compa-content-item {
    display: flex;
    flex-direction: column;
    width: calc(30%);
    margin: 8px;
    margin-bottom: 0px;
    padding: 20px;
    background-color: var(--content-item-background-color);
    border: 1px solid var(--content-item-border-color);
    color: var(--text-color);
    border-radius: 8px;
    overflow-y: hidden;
    z-index: 2;
}

.plan-comparison-card-action {
    display: flex;
    justify-content: flex-end;
    gap: 5px;
}

.plan-comparison-card-action i {
    transition:
        opacity 0.2s,
        color 0.2s;
    opacity: 1;
    cursor: pointer;
}
.plan-comparison-card-action i:hover {
    opacity: 0.6;
}

.vnd-icon {
    font-weight: bold;
    color: var(--category-3st-color);
    margin-left: 2px;
}

.feature-switch-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.feature-switch-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px;
    background-color: var(--content-item-background-color);
    border: 2px solid var(--content-item-border-color);
    border-radius: 8px;
}

.feature-switch-item span {
    color: var(--category-3st-color);
    font-size: 17px;
    font-weight: 600;
}

.update_input_name {
    height: 35px;
    padding: 5px 10px;
    background-color: var(--content-item-children-background-color);
    border: 1px solid var(--form-item-border-color);
    color: var(--text-color-white);
}

.chart-content {
    width: calc(100% - 40px);
    justify-content: space-between;
    display: flex;
    padding: 10px;
    gap: 20px;
}

.chart-content > div {
    flex: 1;
    border: 1px solid var(--form-item-border-color);
    border-radius: 10px;
}
</style>
