<template>
  <div class="supplies-detail">
    <div class="detail-header">
      <a-button @click="emit('back')"> <icon-arrow-left />返回列表 </a-button>
      <div class="header-title">应急物资详情</div>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="detail-content">
        <!-- 左侧：基本信息 -->
        <div class="left-section">
          <a-card title="基本信息" :bordered="false" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="物资名称">
                {{ detailData.suppliesName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="仓库名称">
                {{ detailData.warehouseName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="物资类型">
                {{ getSuppliesTypeText(detailData.suppliesType) }}
              </a-descriptions-item>
              <a-descriptions-item label="数量">
                {{ detailData.quantity || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="所在区域">
                {{ detailData.areaNames || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="存放位置">
                {{ detailData.storageLocation || '-' }}
              </a-descriptions-item>
              <a-descriptions-item v-if="detailData.remark" label="备注">
                {{ detailData.remark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <!-- 右侧：物资图片 -->
        <div class="right-section">
          <a-card title="物资图片" :bordered="false" class="info-card">
            <div class="image-container">
              <a-image
                v-if="detailData.imageUrls"
                :src="detailData.imageUrls"
                fit="cover"
                :preview="true"
              />
              <a-empty v-else description="暂无图片" />
            </div>
          </a-card>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import {
    getEmergencySupplies,
    type EmergencySuppliesVO,
  } from '@/api/emergency';

  const props = defineProps<{ data: EmergencySuppliesVO }>();
  const emit = defineEmits<{ (e: 'back'): void }>();

  const detailData = ref<EmergencySuppliesVO>({} as EmergencySuppliesVO);
  const loading = ref(false);

  // 物资类型选项
  const suppliesTypeOptions = [
    { value: 1, label: '防护用品' },
    { value: 2, label: '生命救助' },
    { value: 3, label: '生命支持' },
    { value: 4, label: '救援运载' },
    { value: 5, label: '临时食宿' },
    { value: 6, label: '其他' },
  ];

  // 获取物资类型文本
  const getSuppliesTypeText = (type?: number) => {
    const option = suppliesTypeOptions.find((item) => item.value === type);
    return option ? option.label : '-';
  };

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.data?.id) return;

    loading.value = true;
    try {
      const res = await getEmergencySupplies(props.data.id);
      if (res.data) {
        detailData.value = res.data;
      }
    } catch (error) {
      console.error('获取物资详情失败:', error);
      Message.error('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (props.data) {
      detailData.value = props.data;
      loadDetail();
    }
  });
</script>

<style scoped lang="less">
  .supplies-detail {
    .detail-header {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;

      .header-title {
        color: #fff;
        font-weight: 600;
        font-size: 20px;
      }
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 16px;
      min-height: 0;

      .left-section {
        overflow-y: auto;
      }

      .right-section {
        overflow-y: auto;
      }

      .info-card {
        background: transparent;

        :deep(.arco-card-header) {
          color: #fff;
          font-weight: 600;
          font-size: 16px;
          background: linear-gradient(
            90deg,
            rgb(23 150 250 / 25%),
            rgb(23 150 250 / 10%)
          );
          border-bottom: 1px solid rgb(23 150 250 / 40%);
        }

        :deep(.arco-card-body) {
          background: rgb(10 30 60 / 35%);
          border: 1px solid rgb(23 150 250 / 15%);
          border-top: none;
        }
      }

      :deep(.arco-descriptions) {
        background: transparent;

        .arco-descriptions-item-label {
          min-width: 120px;
          padding: 12px 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          background: rgb(23 150 250 / 20%);
          border-color: rgb(23 150 250 / 25%);
        }

        .arco-descriptions-item-value {
          padding: 12px 16px;
          color: rgb(255 255 255 / 90%);
          font-size: 14px;
          background: rgb(10 30 60 / 30%);
          border-color: rgb(23 150 250 / 15%);
        }
      }

      .image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 300px;

        :deep(.arco-image) {
          width: 100%;
          max-width: 100%;

          img {
            width: 100%;
            border-radius: 4px;
          }
        }

        :deep(.arco-empty) {
          color: rgb(255 255 255 / 50%);
        }
      }
    }
  }
</style>
