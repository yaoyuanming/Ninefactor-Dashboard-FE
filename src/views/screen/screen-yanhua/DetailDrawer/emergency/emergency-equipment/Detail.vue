<template>
  <div class="equipment-detail">
    <div class="detail-header">
      <a-button @click="emit('back')"><icon-arrow-left />返回列表</a-button>
      <div class="header-title">应急装备详情</div>
    </div>
    <div class="detail-content">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="装备名称">{{
          data?.name || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="装备类型">{{
          data?.type || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="数量">{{
          data?.quantity || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="状态">{{
          data?.status || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="存放位置">{{
          data?.location || '-'
        }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{ data: any }>();
  const emit = defineEmits<{ (e: 'back'): void }>();
</script>

<style scoped lang="less">
  .equipment-detail {
    .detail-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;

      .header-title {
        color: #fff;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .detail-content :deep(.arco-descriptions) {
      background: transparent;

      .arco-descriptions-item-label {
        color: rgb(255 255 255 / 85%);
        background: rgb(23 150 250 / 10%);
      }

      .arco-descriptions-item-value {
        color: rgb(255 255 255 / 70%);
        background: rgb(10 30 60 / 20%);
      }
    }
  }
</style>
