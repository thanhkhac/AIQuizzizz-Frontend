<script setup lang="ts">
import ApiAIGenerate from "@/api/ApiAIGenerate";
import { ref, computed, h, nextTick, watch } from "vue";
import { LoadingOutlined, ExclamationCircleFilled } from "@ant-design/icons-vue";

import { TreeSelect as ATreeSelect, message, Modal } from "ant-design-vue";
import { Tree as ATree } from "ant-design-vue";

interface TreeNode {
    title: string;
    key: string;
    children?: TreeNode[];
}

interface Props {
    file: File;
}

interface Cost {
    miniumPointToGenerate: number;
    tokenCount: number;
}

const props = defineProps<Props>();

const indicator = h(LoadingOutlined, {
    style: { fontSize: "100px", color: "var(--main-color)" },
    spin: true,
});
//#region tree data
const modalContentRef = ref<HTMLElement>();

const serverData = ref<TreeNode[]>([]);

function toArray<T>(x: T | T[] | null | undefined): T[] {
    if (!x) return [];
    return Array.isArray(x) ? x : [x];
}

function addRandomKeys(treeLike: TreeNode[] | TreeNode | null | undefined): TreeNode[] {
    const arr = toArray<TreeNode>(treeLike);
    return arr.map((node) => {
        const childrenArr = toArray<TreeNode>((node as any)?.children);
        return {
            ...node,
            title: String((node as any)?.title ?? ""),
            key: crypto.randomUUID(),
            children: childrenArr.length ? addRandomKeys(childrenArr) : undefined,
        };
    });
}

const treeData = ref<TreeNode[]>([]);

const checked = ref<string[]>([]);

function filterTree(data: TreeNode[], selected: string[]): TreeNode[] {
    const result: TreeNode[] = [];
    for (const node of data) {
        const isSelected = selected.includes(node.key);
        const filteredChildren = node.children ? filterTree(node.children, selected) : [];
        if (isSelected || filteredChildren.length > 0) {
            result.push({
                title: node.title,
                key: node.key,
                children: filteredChildren.length ? filteredChildren : undefined,
            });
        }
    }
    return result;
}
const selectedTree = computed(() => filterTree(treeData.value, checked.value));

watch(treeData, async () => {
    if (treeData.value.length > 0) {
        await nextTick();
        if (modalContentRef.value) {
            modalContentRef.value.scrollTop = 0;
        }
    }
});

//#endregion

//#region modal
const cost = ref<Cost | null>(null);

const modal_open = ref(false);
const loading = ref(false);

const getCostToGenerate = async () => {
    try {
        loading.value = true;
        const result = await ApiAIGenerate.GetCostToGenerate(props.file);
        if (!result.data.success) {
            Modal.error({
                title: "Error",
                content: result.data.message || "Failed to get cost to generate.",
            });
            return null;
        }
        return result.data.data as Cost;
    } catch (e) {
        console.error(e);
        return null;
    } finally {
        loading.value = false;
    }
};

const generateTreeData = async () => {
    try {
        loading.value = true;

        const result = await ApiAIGenerate.GenerateDocumentStructure(props.file);

        if (!result.data.success) {
            Modal.error({
                title: "Error",
                content: result.data.message || "Failed to generate file structure.",
            });
            return;
        }

        const envelope = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
        const root = envelope?.data;
        const topLevel = toArray<TreeNode>(root?.children);

        serverData.value = topLevel;
        treeData.value = addRandomKeys(serverData.value);
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
        modal_confirm_generate_structure_open.value = false;
    }
};

const openModal = async () => {
    modal_open.value = true;

    if (serverData.value.length > 0 || cost.value) return;

    const costResult = await getCostToGenerate();

    if (!costResult) {
        message.error("Failed to get cost to generate file structure.");
        return;
    }

    cost.value = costResult;

    //open confirm generate modal
    modal_confirm_generate_structure_open.value = true;
};

const closeModal = () => {
    modal_open.value = false;
    onEmitImport();
};

const modal_confirm_generate_structure_open = ref(false);

const onConfirmGenerateFileStructure = async () => {
    if (!cost.value) return;
    await generateTreeData();
};

const emit =
    defineEmits<(e: "import", document_structure: string, selected_structure: string) => void>();

const onEmitImport = () => {
    if (treeData.value.length === 0 || selectedTree.value.length === 0) {
        return;
    }

    const treeRoot = treeData.value?.[0];
    const document_structure = JSON.stringify({
        title: treeRoot.title,
        children: treeRoot.children,
    });

    const selectedRoot = selectedTree.value?.[0];
    const selected_structure = JSON.stringify({
        title: selectedRoot.title,
        children: selectedRoot.children,
    });

    emit("import", document_structure, selected_structure);
};

const onConfirmImportStructure = () => {
    if (selectedTree.value.length === 0) {
        Modal.error({
            title: "Error",
            content: "Please choose at least one section in your document to proceed.",
            centered: true,
        });
        return;
    }
    onEmitImport();
    closeModal();
};

const clearData = () => {
    serverData.value = [];
    treeData.value = [];
    cost.value = null;
};

//#endregion

defineExpose({ openModal, closeModal, clearData });
</script>

<template>
    <a-modal
        centered
        width="100%"
        wrap-class-name="medium-modal large"
        :open="modal_open"
        @cancel="closeModal"
    >
        <div class="modal-container">
            <div class="modal-title-container">
                <a-row class="w-100 d-flex align-items-center">
                    <a-col :span="1">
                        <RouterLink @click="closeModal" :to="{ name: '' }">
                            <i class="bx bx-chevron-left navigator-back-button"></i>
                        </RouterLink>
                    </a-col>
                    <a-col class="main-title" :span="23">
                        <span> {{ $t("generate_file_structure.title") }}</span> <br />
                        <span>
                            {{ $t("generate_file_structure.sub_title") }}
                        </span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-content-item" ref="modalContentRef">
                <div v-if="loading" class="loading-container">
                    <a-spin size="large" :indicator="indicator" />
                    <div v-if="!cost">{{ $t("generate_file_structure.other.calculating") }}</div>
                </div>

                <div v-else class="content-wrapper">
                    <div v-if="treeData.length > 0" class="tree-container">
                        <a-tree
                            v-model:checkedKeys="checked"
                            :tree-data="treeData"
                            checkable
                            :show-icon="false"
                            :show-line="true"
                            :field-names="{ title: 'title', key: 'key', children: 'children' }"
                            :defaultExpandAll="true"
                            style="width: 100%"
                        />
                    </div>
                    <!-- get cost success but cancel -->
                    <div v-else-if="cost" class="button-container">
                        <a-button
                            type="primary"
                            class="main-color-btn"
                            @click="modal_confirm_generate_structure_open = true"
                        >
                            {{ $t("generate_file_structure.buttons.generate_structure") }}
                        </a-button>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <a-button class="main-color-btn" type="primary" @click="onConfirmImportStructure">
                {{ $t("generate_file_structure.buttons.confirm") }}
            </a-button>
        </template>
    </a-modal>
    <a-modal
        wrap-class-name="medium-modal"
        centered
        :open="modal_confirm_generate_structure_open"
        :closable="false"
    >
        <div class="confirm-modal-container">
            <div class="d-flex align-items-center">
                <ExclamationCircleFilled class="fs-4 me-3 text-warning" />
                <div class="fs-6 fw-bold">
                    {{ $t("generate_file_structure.confirm_modal.title") }}
                </div>
            </div>
            <div class="fs-6 ms-5 mt-3">
                {{ $t("generate_file_structure.confirm_modal.content") }}
                <span class="fw-bold text-danger">{{ cost?.miniumPointToGenerate }}</span>
                {{ $t("generate_file_structure.confirm_modal.content_tail") }}
            </div>
        </div>
        <template #footer>
            <a-button
                :class="['main-color-btn-ghost', loading ? 'main-color-btn-disabled' : '']"
                type="ghost"
                @click="modal_confirm_generate_structure_open = false"
            >
                {{ $t("sidebar.buttons.cancel") }}
            </a-button>
            <a-button
                :loading="loading"
                class="main-color-btn"
                type="primary"
                @click="onConfirmGenerateFileStructure"
            >
                {{ $t("generate_file_structure.buttons.confirm") }}
            </a-button>
        </template>
    </a-modal>
</template>

<style scoped>
.modal-content-item {
    height: 500px;
    max-height: 500px;
    overflow-y: auto;
    position: relative;
}

.content-wrapper {
    width: 100%;
    min-height: 100%;
}

.tree-container {
    padding: 20px;
    width: 100%;
}

.loading-container {
    min-height: 50vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.button-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

.confirm-modal-container {
    padding: 20px 10px;
}
</style>
