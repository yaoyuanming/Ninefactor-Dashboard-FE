<template>
  <a-tree-select
    v-model="selectedValue"
    :data="regionOptions"
    :field-names="fieldNames"
    :placeholder="placeholder"
    :style="{ width: width }"
    :allow-clear="clearable"
    :allow-search="allowSearch"
    :tree-checkable="false"
    :tree-props="{
      checkStrictly: checkStrictly,
    }"
    @change="handleChange"
  />
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getRegionTreeSelect } from '@/api/region';
  import type { RegionTreeNode } from './types';

  // 定义组件属性
  interface Props {
    modelValue?: string | number | null;
    placeholder?: string;
    width?: string;
    clearable?: boolean;
    checkStrictly?: boolean;
    defaultFirst?: boolean; // 是否默认选择第一个选项
    allowSearch?: boolean; // 是否支持搜索
  }

  // 定义组件事件
  interface Emits {
    (e: 'update:modelValue', value: string | number | null): void;
    (e: 'change', value: string | number | null, label?: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    placeholder: '请选择区域',
    width: '200px',
    clearable: true,
    checkStrictly: true,
    defaultFirst: false,
    allowSearch: true,
  });

  const emit = defineEmits<Emits>();

  // 响应式数据
  const selectedValue = ref<string | number | null>(props.modelValue || null);
  const regionOptions = ref<RegionTreeNode[]>([]);

  // Arco Design 树形选择器字段映射
  const fieldNames = {
    key: 'id',
    title: 'label',
    children: 'children',
  };

  // 加载区域数据
  const loadRegionOptions = async () => {
    try {
      const response = await getRegionTreeSelect();
      regionOptions.value = response.data || response;

      // 如果设置了默认选择第一个选项，且当前没有选中值
      if (
        props.defaultFirst &&
        !selectedValue.value &&
        regionOptions.value.length > 0
      ) {
        const firstOption = regionOptions.value[0];
        selectedValue.value = firstOption.id;
        emit('update:modelValue', firstOption.id);
        emit('change', firstOption.id, firstOption.label);
      }
    } catch (error: any) {
      Message.error(error?.message || '加载区域数据失败');
    }
  };

  // 查找区域名称的递归函数
  const findRegionLabel = (
    regions: RegionTreeNode[],
    targetId: string | number
  ): string => {
    let result = '';
    regions.some((region) => {
      if (region.id === targetId || String(region.id) === String(targetId)) {
        result =
          region.label || region.name || region.title || String(targetId);
        return true;
      }
      if (region.children && region.children.length > 0) {
        const found = findRegionLabel(region.children, targetId);
        if (found) {
          result = found;
          return true;
        }
      }
      return false;
    });
    return result;
  };

  // 处理选择变化
  const handleChange = (value: string | number | null) => {
    selectedValue.value = value;
    emit('update:modelValue', value);

    // 查找对应的区域名称
    let regionLabel = '';
    if (value && regionOptions.value.length > 0) {
      regionLabel = findRegionLabel(regionOptions.value, value);
    }

    emit('change', value, regionLabel);
  };

  // 监听外部值变化
  watch(
    () => props.modelValue,
    (newValue) => {
      selectedValue.value = newValue || null;
    }
  );

  // 组件挂载时加载数据
  onMounted(() => {
    loadRegionOptions();
  });
</script>

<style scoped lang="less">
  // 如果需要自定义样式可以在这里添加
</style>
