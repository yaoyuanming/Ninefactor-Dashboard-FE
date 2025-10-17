<template>
  <a-drawer
    v-model:visible="drawerVisible"
    :title="`角色详情 - ${formData.roleName || ''}`"
    width="500px"
  >
    <a-descriptions :column="1">
      <a-descriptions-item label="角色编号">
        {{ formData.id || '-' }}
      </a-descriptions-item>
      <a-descriptions-item label="角色名称">
        {{ formData.roleName || '-' }}
      </a-descriptions-item>
      <a-descriptions-item label="角色标识">
        <a-tag>{{ formData.roleKey || '-' }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="显示顺序">
        {{ formData.roleSort || 0 }}
      </a-descriptions-item>
      <a-descriptions-item label="数据范围">
        <a-tag v-if="formData.dataScope === '1'" color="blue"
          >全部数据权限</a-tag
        >
        <a-tag v-else-if="formData.dataScope === '2'" color="green"
          >自定义数据权限</a-tag
        >
        <a-tag v-else-if="formData.dataScope === '3'" color="orange"
          >本部门数据权限</a-tag
        >
        <a-tag v-else-if="formData.dataScope === '4'" color="red"
          >本部门及以下数据权限</a-tag
        >
        <span v-else>-</span>
      </a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag v-if="formData.status === '0'" color="green">正常</a-tag>
        <a-tag v-else color="red">停用</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间">
        {{ formatDate(formData.createTime) }}
      </a-descriptions-item>
      <a-descriptions-item label="更新时间">
        {{ formatDate(formData.updateTime) }}
      </a-descriptions-item>
      <a-descriptions-item label="备注">
        {{ formData.remark || '-' }}
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import dayjs from 'dayjs';
  import { getRoleDetail } from '@/api/system/role';

  interface Props {
    visible: boolean;
    data?: any;
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:visible']);

  const loading = ref(false);
  const formData = ref<any>({});

  const drawerVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  // 格式化日期
  const formatDate = (date: any) => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  // 监听显示状态
  watch(
    () => props.visible,
    async (val) => {
      if (val && props.data?.id) {
        loading.value = true;
        try {
          const res = await getRoleDetail(props.data.id);
          formData.value = res.data || res || {};
        } catch (error) {
          // console.error(error);
        } finally {
          loading.value = false;
        }
      }
    }
  );
</script>

<style scoped lang="less"></style>
