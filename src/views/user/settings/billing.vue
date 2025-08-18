<script setup lang="ts">
import { onActivated, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Input from "@/shared/components/Common/Input.vue";
import { message } from "ant-design-vue";
import ApiPlan from "../../../../src/api/ApiPlan";
import type HistoryPayment from "../../../../src/models/request/plan/historyPayment";
import type PaymentHistory from "../../../../src/models/response/plan/paymentHistory";
import { useAuthStore } from "@/stores/AuthStore";

const { t } = useI18n();
const authStore = useAuthStore();
const user_info = authStore.getUserInfo();
const modal_qr_open = ref(false);
const isCreateQrLoading = ref(false);
const dataSource = ref<PaymentHistory[]>([]);
const historyPaymentPayload = ref<HistoryPayment>({
    pageNumber: 1,
    pageSize: 5,
});
const qrSrc = ref<string>("");
const onOpenQrModal = async () => {
    onQrGenerate();
    modal_qr_open.value = true;
};
const inputAmountFormRef = ref({
    amount: "",
});
const errorMessage = ref("");
watch(
    () => inputAmountFormRef.value.amount,
    (raw) => {
        const digits = String(raw ?? "").replace(/\D/g, "");

        if (!digits) {
            errorMessage.value = t("settings.billing.err.number_only");
            return;
        }

        const num = Number(digits);
        if (num <= 5000) {
            errorMessage.value = t("settings.billing.err.greater_than_5000");
        } else {
            errorMessage.value = "";
        }
    },
    { immediate: true },
);

const getHistoryPayment = async () => {
    try {
        let result = await ApiPlan.HistoryPayment(historyPaymentPayload.value);
        dataSource.value = result.data.data.items;
    } catch (err) {
        console.log(err);
    }
};

const onQrGenerate = async () => {
    isCreateQrLoading.value = true;
    try {
        const amount = inputAmountFormRef.value.amount;
        console.log("Số tiền nhập:", amount);
        let result = await ApiPlan.QrCodeGenerate(amount);

        if (result.data.success) {
            qrSrc.value = result.data.data;
        }
    } catch (error: any) {
        message.error("Create Qr fail.");
        console.log("error", error.response.data);
    } finally {
        isCreateQrLoading.value = false;
    }
};

const formatDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatCurrency = (num?: number) => {
    return Number(num).toLocaleString("en-US") + " VND";
};

const columns = [
    {
        title: "No",
        dataIndex: "no",
        customRender: ({ index }: { index: number }) => index + 1,
        width: 50,
        align: "center",
    },
    {
        title: "Date",
        dataIndex: "date",
        key: "date",
        width: 300,
        align: "center",
    },
    {
        title: "Plan",
        dataIndex: "planName",
        key: "planName",
        width: 200,
        align: "center",
    },
    {
        title: "Amount",
        dataIndex: "price",
        key: "price",
        width: 200,
        align: "center",
        customRender: ({ text }: { text: number }) => formatCurrency(text),
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        defaultSortOrder: "ascend",
        width: 200,
        align: "center",
    },
];

onMounted(() => {
    getHistoryPayment();
});
</script>
<template>
    <div class="content">
        <div class="content-item">
            <div class="content-item-title">
                <div class="w-50">
                    <span>{{ $t("settings.billing.title") }}</span>
                    <span>{{ $t("settings.billing.sub_title") }}</span>
                </div>
                <div class="w-50 justify-content-center m-2">
                    <span class="text-end">AIQuizz Points: {{ user_info.balance }}</span>
                </div>
            </div>

            <div class="w-100">
                <a-table :data-source="dataSource" :columns="columns" row-key="id">
                    <template #bodyCell="{ column, text }">
                        <template v-if="column.key === 'date'"> {{ formatDate(text) }}</template>

                        <template v-if="column.key === 'status'">
                            <span
                                :class="['status-pill', `status-${String(text).toLowerCase()}`]"
                                >{{ text === "TopUp" ? "Deposit" : text }}</span
                            >
                        </template>
                    </template>
                </a-table>
            </div>
        </div>

        <div class="content-item">
            <div class="content-item-title">
                <div class="w-50">
                    <span>{{ $t("settings.billing.title") }}</span>
                    <span>{{ $t("settings.billing.sub_title") }}</span>
                </div>
            </div>
            <div class="d-flex">
                <div class="content-item-title w-50 d-flex flex-column">
                    <div class="content-item w-75">
                        <span>{{ t("settings.billing.bank.name") }}</span>
                        <span>Nguyen Khac Thanh</span>
                    </div>
                    <div class="content-item w-75">
                        <span>{{ t("settings.billing.bank.number") }}</span>
                        <span>4271033443</span>
                    </div>
                    <div class="content-item w-75">
                        <span>{{ t("settings.billing.bank.bank_name") }}</span>
                        <span>BIDV</span>
                    </div>
                </div>
                <div class="w-50">
                    <div class="content-item d-flex flex-column gap-2">
                        <div class="d-flex justify-content-center">
                            <i class="me-2 bx bx-qr" style="font-size: 24px"></i>
                            <span>{{ t("settings.billing.qr.title") }}</span>
                        </div>

                        <div class="d-flex gap-2 justify-content-center align-items-center">
                            <span class="">{{ t("settings.billing.qr.amount") }}:</span>
                            <span>
                                <Input
                                    v-model:value="inputAmountFormRef.amount"
                                    placeholder="Số tiền"
                                    style="width: 100%"
                                    :is-required="true"
                                />
                            </span>
                            <span>VNĐ</span>
                        </div>
                        <div class="d-flex gap-2 justify-content-center align-items-center">
                            <span v-if="errorMessage" class="text-danger">{{ errorMessage }}</span>
                        </div>

                        <div class="d-flex gap-2 justify-content-center align-items-center">
                            <a-button
                                :loading="isCreateQrLoading"
                                class="main-color-btn"
                                type="primary"
                                size="large"
                                @click="
                                    () => {
                                        if (!errorMessage) onOpenQrModal();
                                    }
                                "
                            >
                                <i class="me-2 bx bx-qr"></i>
                                {{ t("settings.billing.qr.qr_gen") }}
                            </a-button>
                        </div>
                        <div class="d-flex flex-column justify-content-center align-items-center">
                            <div class="d-flex">
                                <i class="me-2 bx bx-info-circle" style="font-size: 24px"></i>
                                <span class="fw-bold">{{ t("settings.billing.noti.title") }}</span>
                            </div>
                            <span>• {{ t("settings.billing.noti.content1") }}: 5000 VNĐ</span>
                            <span>• {{ t("settings.billing.noti.content2") }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="noti-content">
                <div class="text-white fw-bold fs-6">
                    {{ $t("settings.billing.note.title") }}
                </div>
                <div class="text-white-50">
                    {{ $t("settings.billing.note.content1") }}
                </div>
                <div class="text-white-50">
                    {{ $t("settings.billing.note.content2") }}
                </div>
                <div class="text-white-50">
                    {{ $t("settings.billing.note.contact") }}: 0986386984
                </div>
            </div>
        </div>
    </div>

    <!-- qr modal -->
    <a-modal
        width="750px"
        centered
        wrap-class-name="medium-modal"
        :open="modal_qr_open"
        @cancel="modal_qr_open = false"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="2">
                        <RouterLink @click="modal_qr_open = false" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col :span="1" class="d-flex align-items-center justify-content-center">
                        <i class="me-2 bx bx-qr" style="font-size: 27px"></i>
                    </a-col>
                    <a-col class="main-title" :span="21">
                        <span>{{ t("settings.billing.modal.title") }}</span> <br />
                        <span>{{ t("settings.billing.modal.content") }}</span> <br />
                    </a-col>
                </a-row>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <div class="content-item w-25 d-flex justify-content-center">
                {{ t("settings.billing.qr.amount") }}: {{ inputAmountFormRef.amount }} VND
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <img v-if="qrSrc" :src="qrSrc" alt="QR Code" />
        </div>

        <template #footer>
            <a-button
                class="main-color-btn"
                key="submit"
                type="primary"
                @click="modal_qr_open = false"
            >
                {{ t("settings.billing.modal.close_btn") }}
            </a-button>
        </template>
    </a-modal>
</template>

<style scoped>
.status-pill {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 14px;
    font-weight: 500;
}

.status-paid {
    background-color: rgba(0, 128, 0, 0.7);
    color: var(--text-color);
    border: 1px solid rgba(0, 255, 0, 1);
}
.status-topup {
    background-color: rgba(255, 215, 0, 0.7);
    color: var(--text-color);
    border: 1px solid rgba(255, 215, 0, 1);
}
.noti-content {
    width: calc(100% / 2);
    margin: 8px;
    margin-bottom: 0px;
    padding: 10px;
    background-color: var(--main-color);
    border: 1px solid var(--main-sub-color);
    color: var(--text-color);
    border-radius: 8px;
    overflow-y: hidden;
    z-index: 2;
}
</style>
