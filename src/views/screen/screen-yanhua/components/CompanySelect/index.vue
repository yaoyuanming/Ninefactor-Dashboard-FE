<template>
  <a-select
    v-model="selectedValue"
    :placeholder="placeholder"
    :style="{ width: width }"
    :size="size"
    :allow-clear="clearable"
    :allow-search="allowSearch"
    :multiple="multiple"
    :loading="loading"
    :max-tag-count="maxTagCount"
    @change="handleChange"
  >
    <a-option
      v-for="company in companyOptions"
      :key="company.id"
      :value="String(company.id)"
      :label="company.enterpriseName"
    >
      {{ company.enterpriseName }}
    </a-option>
  </a-select>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getCompanyPage } from '@/api/company';
  import type { CompanyOption } from './types';

  // 定义组件属性
  interface Props {
    modelValue?: string | string[] | null;
    placeholder?: string;
    width?: string;
    size?: 'mini' | 'small' | 'medium' | 'large';
    clearable?: boolean;
    allowSearch?: boolean;
    multiple?: boolean; // 是否支持多选
    maxTagCount?: number; // 多选时最多显示的标签数量
  }

  // 定义组件事件
  interface Emits {
    (e: 'update:modelValue', value: string | string[] | null): void;
    (e: 'change', value: string | string[] | null, labels?: string): void;
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    placeholder: '请选择企业',
    width: '100%',
    size: 'medium',
    clearable: true,
    allowSearch: true,
    multiple: false,
    maxTagCount: 3,
  });

  const emit = defineEmits<Emits>();

  // 响应式数据
  const selectedValue = ref<string | string[] | null>(props.modelValue || null);
  const companyOptions = ref<CompanyOption[]>([]);
  const loading = ref(false);

  // 加载企业数据
  const loadCompanyOptions = async () => {
    loading.value = true;
    try {
      const response = await getCompanyPage({
        pageNo: 1,
        pageSize: 1000, // 获取所有企业
      });

      if (response && response.data) {
        companyOptions.value =
          response.data.records || response.data.list || [];
      } else if (response && response.records) {
        companyOptions.value = response.records;
      } else if (Array.isArray(response)) {
        companyOptions.value = response;
      }
    } catch (error: any) {
      Message.error(error?.message || '加载企业列表失败');
      companyOptions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 查找企业名称
  const findCompanyNames = (value: string | string[] | null): string => {
    if (!value) return '';

    const values = Array.isArray(value) ? value : [value];
    const names = values
      .map((id) => {
        const company = companyOptions.value.find(
          (c) => String(c.id) === String(id)
        );
        return company ? company.enterpriseName : '';
      })
      .filter((name) => name);

    return names.join(',');
  };

  // 处理选择变化
  const handleChange = (value: string | string[] | null) => {
    selectedValue.value = value;
    emit('update:modelValue', value);

    // 查找对应的企业名称
    const companyNames = findCompanyNames(value);
    emit('change', value, companyNames);
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
    loadCompanyOptions();
  });
</script>

<style scoped lang="less"></style>
