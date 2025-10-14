<template>
  <a-tree-select
    v-model="selectedValue"
    :data="deptTreeData"
    :placeholder="placeholder"
    :style="{ width: width }"
    :size="size"
    :allow-clear="clearable"
    :allow-search="allowSearch"
    :multiple="multiple"
    :loading="loading"
    :max-tag-count="maxTagCount"
    :tree-checkable="multiple"
    :tree-check-strictly="multiple"
    :tree-props="{
      children: 'children',
      title: 'label',
      key: 'id',
    }"
    :field-names="{
      key: 'id',
      title: 'label',
      children: 'children',
    }"
    @change="handleChange"
  >
  </a-tree-select>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getDeptTreeSelect } from '@/api/system/dept';
  import type { DeptOption } from './types';

  // 定义组件属性
  interface Props {
    modelValue?: string | string[] | number | number[] | null;
    placeholder?: string;
    width?: string;
    size?: 'mini' | 'small' | 'medium' | 'large';
    clearable?: boolean;
    allowSearch?: boolean;
    multiple?: boolean;
    maxTagCount?: number;
  }

  // 定义组件事件
  interface Emits {
    (
      e: 'update:modelValue',
      value: string | string[] | number | number[] | null
    ): void;
    (
      e: 'change',
      value: string | string[] | number | number[] | null,
      labels?: string
    ): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    placeholder: '请选择部门',
    width: '100%',
    size: 'medium',
    clearable: true,
    allowSearch: true,
    multiple: false,
    maxTagCount: 3,
  });

  const emit = defineEmits<Emits>();

  // 响应式数据
  const selectedValue = ref<string | string[] | number | number[] | null>(
    props.modelValue || null
  );
  const deptTreeData = ref<DeptOption[]>([]);
  const loading = ref(false);
  const flatDeptMap = ref<Map<string | number, string>>(new Map());

  // 构建扁平化映射（递归遍历树）
  const buildFlatMap = (data: DeptOption[]) => {
    flatDeptMap.value.clear();
    const traverse = (nodes: DeptOption[]) => {
      nodes.forEach((node) => {
        flatDeptMap.value.set(node.id, node.label);
        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(data);
  };

  // 加载部门树数据
  const loadDeptTreeData = async () => {
    loading.value = true;
    try {
      const response = await getDeptTreeSelect();

      if (response && Array.isArray(response)) {
        deptTreeData.value = response;
        buildFlatMap(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        deptTreeData.value = response.data;
        buildFlatMap(response.data);
      }
    } catch (error: any) {
      Message.error(error?.message || '加载部门树失败');
      deptTreeData.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 查找部门名称
  const findDeptNames = (
    value: string | string[] | number | number[] | null
  ): string => {
    if (!value) return '';

    const values = Array.isArray(value) ? value : [value];
    const names = values
      .map((id) => {
        return flatDeptMap.value.get(id) || '';
      })
      .filter((name) => name);

    return names.join(',');
  };

  // 处理选择变化
  const handleChange = (
    value: string | string[] | number | number[] | null
  ) => {
    selectedValue.value = value;
    emit('update:modelValue', value);

    const deptNames = findDeptNames(value);
    emit('change', value, deptNames);
  };

  // 监听外部值变化
  watch(
    () => props.modelValue,
    (newValue) => {
      selectedValue.value = newValue || null;
    },
    { immediate: true }
  );

  // 组件挂载时加载数据
  onMounted(() => {
    loadDeptTreeData();
  });
</script>

<style scoped lang="less"></style>
