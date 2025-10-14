<template>
  <a-modal
    :visible="visible"
    title="角色详情"
    :width="600"
    :footer="false"
    @cancel="() => $emit('update:visible', false)"
  >
    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="角色名称">{{
        data.name
      }}</a-descriptions-item>
      <a-descriptions-item label="角色编码">{{
        data.code
      }}</a-descriptions-item>
      <a-descriptions-item label="描述">{{
        data.description
      }}</a-descriptions-item>
      <a-descriptions-item label="用户数">{{
        data.userCount
      }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag v-if="data.status === 1" color="green">启用</a-tag>
        <a-tag v-else color="red">禁用</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间">{{
        data.createTime
      }}</a-descriptions-item>
    </a-descriptions>
  </a-modal>
</template>

<script lang="ts" setup>
  defineProps<{
    visible: boolean;
    data: any;
  }>();

  defineEmits<{
    'update:visible': [value: boolean];
  }>();
</script>
