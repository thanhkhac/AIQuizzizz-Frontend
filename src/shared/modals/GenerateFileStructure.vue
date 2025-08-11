<script setup lang="ts">
import ApiAIGenerate from "@/api/ApiAIGenerate";
import { ref, computed, h } from "vue";
import { LoadingOutlined } from "@ant-design/icons-vue";
import { TreeSelect as ATreeSelect } from "ant-design-vue";

interface TreeNode {
    title: string;
    key: string;
    children?: TreeNode[];
}

interface Props {
    file: File;
}
const props = defineProps<Props>();

const indicator = h(LoadingOutlined, {
    style: { fontSize: "100px", color: "var(--main-color)" },
    spin: true,
});

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

const modal_open = ref(false);
const loading = ref(false);

const openModal = async () => {
    modal_open.value = true;
    try {
        loading.value = true;

        const res = await ApiAIGenerate.GenerateDocumentStructure(props.file);
        const envelope = typeof res.data === "string" ? JSON.parse(res.data) : res.data;

        const root = envelope?.data;
        const topLevel = toArray<TreeNode>(root?.children);

        serverData.value = topLevel;
        treeData.value = addRandomKeys(serverData.value);
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    modal_open.value = false;
};

defineExpose({ openModal, closeModal });
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
                        <span> {{ $t("create_QS.title") }}</span> <br />
                        <span>
                            {{ $t("create_QS.sub_title") }}
                        </span>
                    </a-col>
                </a-row>
            </div>
            <div class="modal-content-item">
                <div
                    v-if="loading"
                    class="d-flex justify-content-center align-items-center"
                    style="min-height: 50vh"
                >
                    <a-spin size="large" :indicator="indicator" />
                </div>

                <div v-else>
                    <a-tree-select
                        v-model:value="checked"
                        :tree-data="treeData"
                        :field-names="{ label: 'title', value: 'key', children: 'children' }"
                        tree-checkable
                        :show-checked-strategy="'SHOW_PARENT'"
                        allow-clear
                        show-search
                        placeholder="Select sections to include"
                        style="width: 100%"
                        :max-tag-count="3"
                    />

                    <h3>Selected Tree Structure:</h3>
                    <div style="background-color: black">
                        <pre style="color: #d1d5db">{{
                            JSON.stringify(selectedTree, null, 2)
                        }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </a-modal>
</template>
<style scoped>
.modal-content-item {
    display: block;
    max-height: 500px;
    overflow-y: scroll;
}
</style>
