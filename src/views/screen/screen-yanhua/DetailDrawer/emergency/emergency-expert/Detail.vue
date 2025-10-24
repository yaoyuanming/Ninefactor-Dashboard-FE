<template>
  <div class="expert-detail">
    <div class="detail-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">应急专家详情</div>
    </div>

    <a-spin :loading="loading" style="flex: 1; width: 100%">
      <div class="detail-content">
        <!-- 左侧：基本信息 -->
        <div class="left-section">
          <a-card title="基本信息" :bordered="false" class="info-card">
            <a-descriptions :column="2">
              <a-descriptions-item label="专家姓名">
                {{ data.expertName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="专业领域">
                {{ getSpecialtyFieldText(data.specialtyField) }}
              </a-descriptions-item>
              <a-descriptions-item label="技术职称">
                {{ data.technicalTitle || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="工作单位">
                {{ deptName }}
              </a-descriptions-item>
              <a-descriptions-item label="联系电话">
                {{ data.contactPhone || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="可用状态">
                <a-tag
                  v-if="data.availabilityStatus === 1"
                  color="green"
                  size="small"
                >
                  可用
                </a-tag>
                <a-tag v-else color="gray" size="small">不可用</a-tag>
              </a-descriptions-item>
              <a-descriptions-item v-if="data.remark" label="备注" :span="2">
                {{ data.remark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <!-- 右侧：专家照片 -->
        <div class="right-section">
          <a-card title="专家照片" :bordered="false" class="info-card">
            <div class="image-container">
              <a-image
                v-if="data.tempPhotoUrls"
                :src="getFirstImage(data.tempPhotoUrls)"
                fit="cover"
                :preview="true"
              />
              <a-empty v-else description="暂无照片" />
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
    getEmergencyExpert,
    type EmergencyExpertVO,
  } from '@/api/emergency/expert';
  import { getDeptNameById } from '@/utils/deptUtils';

  const props = defineProps<{
    data?: EmergencyExpertVO;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
  }>();

  const loading = ref(false);
  const data = ref<EmergencyExpertVO>({} as EmergencyExpertVO);
  const deptName = ref<string>('-');

  // 专业领域选项
  const specialtyFieldOptions = [
    { value: 1, label: '烟花爆竹工艺' },
    { value: 2, label: '安全管理' },
    { value: 3, label: '消防救援' },
    { value: 4, label: '化工' },
    { value: 5, label: '环境监测' },
    { value: 6, label: '其他' },
  ];

  // 获取专业领域文本
  const getSpecialtyFieldText = (field?: number) => {
    if (!field) return '—';
    const option = specialtyFieldOptions.find((item) => item.value === field);
    return option ? option.label : '—';
  };

  // 获取第一张图片
  const getFirstImage = (imageUrls: string | string[]) => {
    if (!imageUrls) return '';
    if (typeof imageUrls === 'string') return imageUrls;
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return '';
  };

  const handleBack = () => {
    emit('back');
  };

  // 加载专家详情
  const loadDetail = async () => {
    if (props.data?.id) {
      loading.value = true;
      try {
        const response: any = await getEmergencyExpert(props.data.id);
        data.value = response.data;
        // 获取部门名称
        if (response.data.workUnit) {
          deptName.value = await getDeptNameById(response.data.workUnit);
        }
      } catch (error: any) {
        Message.error(error?.message || '加载专家详情失败');
      } finally {
        loading.value = false;
      }
    } else if (props.data) {
      data.value = props.data;
      // 获取部门名称
      if (props.data.workUnit) {
        getDeptNameById(props.data.workUnit).then((name) => {
          deptName.value = name;
        });
      }
    }
  };

  // 组件挂载时加载详情
  onMounted(() => {
    loadDetail();
  });
</script>

<style scoped lang="less">
  .expert-detail {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .detail-header {
      display: flex;
      flex-shrink: 0;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;

      .header-title {
        flex: 1;
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 18px;
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
      flex: 1;
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
