<template>
  <div class="emergency-committee-detail">
    <div class="detail-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">应急委员会成员详情</div>
    </div>

    <div class="detail-content">
      <a-descriptions :column="2" bordered>
        <a-descriptions-item label="姓名">{{
          data?.name || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="单位">{{
          data?.unit || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="职务">{{
          data?.position || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="联系电话">{{
          data?.phone || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2">{{
          data?.createTime || '-'
        }}</a-descriptions-item>
        <a-descriptions-item label="备注" :span="2">{{
          data?.remark || '无'
        }}</a-descriptions-item>
      </a-descriptions>
    </div>
  </div>
</template>

<script lang="ts" setup>
  defineProps<{
    data: any;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
  }>();

  const handleBack = () => {
    emit('back');
  };
</script>

<style scoped lang="less">
  .emergency-committee-detail {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

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

    .detail-content {
      flex: 1;
      overflow-y: auto;

      :deep(.arco-descriptions) {
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
  }
</style>
