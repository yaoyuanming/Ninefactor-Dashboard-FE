<template>
  <div class="dept-tree-container">
    <div class="search-container">
      <a-input v-model="searchKey" placeholder="请输入部门名称" allow-clear>
        <template #prefix>
          <icon-search />
        </template>
      </a-input>
    </div>
    <div class="tree-container">
      <a-tree
        v-if="filteredTreeData.length > 0"
        ref="treeRef"
        :data="filteredTreeData"
        :field-names="{
          key: 'deptId',
          title: 'deptName',
          children: 'children',
        }"
        :default-expand-all="true"
        :show-line="true"
        :selectable="true"
        :block-node="true"
        @select="handleNodeClick"
      >
        <template #title="nodeData">
          <span>{{ nodeData.deptName }}</span>
        </template>
      </a-tree>
      <div v-else class="empty-tip"> 暂无部门数据 </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted, computed } from 'vue';
  import * as DeptApi from '@/api/system/dept';

  const emit = defineEmits(['nodeClick']);

  const searchKey = ref('');
  const treeData = ref<any[]>([]);
  const treeRef = ref();

  // 获取部门树数据
  const getDeptTree = async () => {
    try {
      const response = await DeptApi.getDeptTreeList();
      // 直接使用 response 作为完整的响应对象
      if (response && response.success && response.data) {
        treeData.value = response.data;
      } else {
        treeData.value = [];
      }
    } catch (error) {
      treeData.value = [];
    }
  };

  // 递归过滤树节点
  const filterTree = (data: any[], keyword: string): any[] => {
    if (!keyword) return data;

    const result: any[] = [];

    data.forEach((item) => {
      // 检查当前节点是否匹配
      const nodeMatches =
        item.deptName &&
        item.deptName.toLowerCase().includes(keyword.toLowerCase());

      // 递归过滤子节点
      const filteredChildren = item.children
        ? filterTree(item.children, keyword)
        : [];

      // 如果当前节点匹配或有匹配的子节点，则包含这个节点
      if (nodeMatches || filteredChildren.length > 0) {
        result.push({
          ...item,
          children: filteredChildren,
        });
      }
    });

    return result;
  };

  // 计算过滤后的树数据
  const filteredTreeData = computed(() => {
    return filterTree(treeData.value, searchKey.value);
  });

  // 处理节点点击
  const handleNodeClick = (selectedKeys: string[], data: any) => {
    if (selectedKeys.length > 0 && data.node) {
      emit('nodeClick', data.node);
    }
  };

  // 初始化
  onMounted(() => {
    getDeptTree();
  });
</script>

<style scoped lang="less">
  .dept-tree-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    background-color: #fff;
    border-radius: 4px;

    .search-container {
      margin-bottom: 16px;
    }

    .tree-container {
      flex: 1;
      overflow: hidden;

      .empty-tip {
        padding: 20px;
        color: #999;
        text-align: center;
      }
    }
  }
</style>
