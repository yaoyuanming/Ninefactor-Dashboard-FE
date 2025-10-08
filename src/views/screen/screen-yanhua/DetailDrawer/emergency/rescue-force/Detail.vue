<template>
  <div class="rescue-force-detail">
    <div class="detail-header">
      <a-button @click="emit('back')"><icon-arrow-left />返回列表</a-button>
      <div class="header-title">救援力量详情</div>
    </div>
    <div class="detail-content">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="队伍名称">{{
          data?.name || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="队伍类型">{{
          data?.type || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="人数">{{
          data?.count || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="联系人">{{
          data?.contact || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{
          data?.phone || '-'
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
  .rescue-force-detail {
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
