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
            <a-descriptions :column="2">
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
              <a-descriptions-item label="经度">
                {{ detailData.longitude || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="纬度">
                {{ detailData.latitude || '-' }}
              </a-descriptions-item>
              <a-descriptions-item
                v-if="detailData.remark"
                label="备注"
                :span="2"
              >
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
                v-if="detailData.tempImageUrls"
                :src="detailData.tempImageUrls"
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
    } catch (error: any) {
      Message.error(error?.message || '获取详情失败');
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
        flex: 1;
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 20px;
      }

      :deep(.arco-btn) {
        color: rgb(255 255 255 / 85%);
        background: rgb(255 255 255 / 8%);
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          background: rgb(255 255 255 / 12%);
          border-color: rgb(23 150 250 / 50%);
        }
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

        .info-card {
          height: fit-content;
        }
      }

      .info-card {
        background: transparent;

        :deep(.arco-card-header) {
          padding: 16px 20px;
          color: #fff !important;
          font-weight: 600;
          font-size: 16px;
          background: linear-gradient(
            90deg,
            rgb(23 150 250 / 30%),
            rgb(23 150 250 / 15%)
          ) !important;
          border: 1px solid rgb(23 150 250 / 40%);
          border-bottom: none;
          border-radius: 4px 4px 0 0;

          .arco-card-header-title {
            color: #fff !important;
          }
        }

        :deep(.arco-card-body) {
          padding: 0;
          background: rgb(10 30 60 / 35%);
          border: 1px solid rgb(23 150 250 / 15%);
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
      }

      :deep(.arco-descriptions) {
        background: transparent;
        border: none !important;

        .arco-descriptions-item-label {
          min-width: 120px;
          padding: 12px 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          background: rgb(23 150 250 / 20%);
          border-right: 1px solid rgb(23 150 250 / 15%);
          border-bottom: 1px solid rgb(23 150 250 / 15%);
        }

        .arco-descriptions-item-value {
          padding: 12px 16px;
          color: rgb(255 255 255 / 90%);
          font-size: 14px;
          background: rgb(10 30 60 / 30%);
          border-right: 1px solid rgb(23 150 250 / 15%);
          border-bottom: 1px solid rgb(23 150 250 / 15%);
        }

        .arco-descriptions-row {
          &:last-child {
            .arco-descriptions-item-label,
            .arco-descriptions-item-value {
              border-bottom: none;
            }
          }
        }

        .arco-descriptions-item {
          &:last-child {
            .arco-descriptions-item-label,
            .arco-descriptions-item-value {
              border-right: none;
            }
          }
        }
      }

      .image-container {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        min-height: 120px;
        max-height: 220px;
        padding: 16px;

        :deep(.arco-image) {
          width: 100%;
          max-width: 100%;
          height: auto;

          img {
            width: 100%;
            height: auto;
            max-height: 188px;
            object-fit: contain;
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
