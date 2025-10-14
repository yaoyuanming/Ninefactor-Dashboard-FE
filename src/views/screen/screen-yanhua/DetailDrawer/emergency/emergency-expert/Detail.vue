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
        <div class="info-section">
          <a-descriptions :column="1" bordered size="large">
            <a-descriptions-item label="专家姓名">
              {{ data.expertName || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="专业领域">
              {{ getSpecialtyFieldText(data.specialtyField) }}
            </a-descriptions-item>
            <a-descriptions-item label="技术职称">
              {{ data.technicalTitle || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="工作单位">
              {{ data.workUnit || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="联系电话">
              {{ data.contactPhone || '—' }}
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
            <a-descriptions-item label="备注">
              {{ data.remark || '—' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 右侧：专家照片 -->
        <div class="photo-section">
          <div class="section-title">专家照片</div>
          <div v-if="data.photoUrl" class="photo-container">
            <a-image
              :src="data.photoUrl"
              width="200"
              height="200"
              fit="cover"
              :preview="true"
              :preview-props="{
                actionsLayout: ['zoomIn', 'zoomOut', 'rotateRight'],
              }"
            />
          </div>
          <div v-else class="no-photo">
            <icon-image :size="64" />
            <span>暂无照片</span>
          </div>
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

  const props = defineProps<{
    data?: EmergencyExpertVO;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
  }>();

  const loading = ref(false);
  const data = ref<EmergencyExpertVO>({} as EmergencyExpertVO);

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
      } catch (error: any) {
        Message.error(error?.message || '加载专家详情失败');
      } finally {
        loading.value = false;
      }
    } else if (props.data) {
      data.value = props.data;
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
      grid-template-columns: 1fr 320px;
      gap: 16px;
      min-height: 0;
      overflow: hidden;

      .info-section {
        padding-right: 8px;
        overflow-y: auto;

        :deep(.arco-descriptions) {
          background: rgb(10 30 60 / 30%);
          border: 1px solid rgb(23 150 250 / 15%);
          border-radius: 4px;

          .arco-descriptions-item {
            border-color: rgb(23 150 250 / 10%);
          }

          .arco-descriptions-item-label {
            color: rgb(255 255 255 / 85%);
            font-weight: 500;
            background: rgb(10 30 60 / 50%);
          }

          .arco-descriptions-item-value {
            color: rgb(255 255 255 / 75%);
            background: rgb(10 30 60 / 20%);
          }
        }
      }

      .photo-section {
        padding: 20px;
        overflow-y: auto;
        background: rgb(10 30 60 / 30%);
        border: 1px solid rgb(23 150 250 / 15%);
        border-radius: 4px;

        .section-title {
          margin-bottom: 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 16px;
        }

        .photo-container {
          display: flex;
          justify-content: center;

          :deep(.arco-image) {
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgb(0 0 0 / 30%);
          }
        }

        .no-photo {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: rgb(255 255 255 / 40%);
          background: rgb(10 30 60 / 20%);
          border: 1px dashed rgb(23 150 250 / 20%);
          border-radius: 8px;

          .arco-icon {
            margin-bottom: 12px;
          }

          span {
            font-size: 14px;
          }
        }
      }
    }
  }
</style>
