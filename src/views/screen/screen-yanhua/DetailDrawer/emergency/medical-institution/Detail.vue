<template>
  <div class="medical-institution-detail">
    <div class="detail-header">
      <a-button @click="emit('back')"> <icon-arrow-left />返回列表 </a-button>
      <div class="header-title">医疗机构详情</div>
    </div>
    <a-spin :loading="loading" style="width: 100%">
      <div class="detail-content">
        <!-- 左侧：基本信息 -->
        <div class="left-section">
          <a-card title="基本信息" :bordered="false" class="info-card">
            <a-descriptions :column="2" bordered>
              <a-descriptions-item label="机构名称">
                {{ detailData.institutionName || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="机构等级">
                {{ getLevelText(detailData.institutionLevel) }}
              </a-descriptions-item>
              <a-descriptions-item label="机构类型">
                {{ getTypeText(detailData.institutionType) }}
              </a-descriptions-item>
              <a-descriptions-item label="所在区域">
                {{ detailData.areaNames || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="急诊床位数">
                {{
                  detailData.emergencyBeds
                    ? `${detailData.emergencyBeds} 张`
                    : '-'
                }}
              </a-descriptions-item>
              <a-descriptions-item label="急诊电话">
                {{ detailData.emergencyPhone || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="经度">
                {{ detailData.longitude || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="纬度">
                {{ detailData.latitude || '-' }}
              </a-descriptions-item>
              <a-descriptions-item label="详细地址">
                {{ detailData.detailedAddress || '-' }}
              </a-descriptions-item>
              <a-descriptions-item v-if="detailData.remark" label="备注">
                {{ detailData.remark }}
              </a-descriptions-item>
            </a-descriptions>
          </a-card>
        </div>

        <!-- 右侧：机构图片 -->
        <div class="right-section">
          <a-card title="机构图片" :bordered="false" class="info-card">
            <div class="image-container">
              <a-image
                v-if="detailData.images"
                :src="detailData.images"
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
    getMedicalInstitution,
    type MedicalInstitutionVO,
  } from '@/api/emergency';

  const props = defineProps<{ data: MedicalInstitutionVO }>();
  const emit = defineEmits<{ (e: 'back'): void }>();

  const detailData = ref<MedicalInstitutionVO>({} as MedicalInstitutionVO);
  const loading = ref(false);

  // 获取等级文本
  const getLevelText = (level?: number) => {
    const levelMap: Record<number, string> = {
      1: '一级',
      2: '二级',
      3: '三级',
    };
    return level ? levelMap[level] || '-' : '-';
  };

  // 获取类型文本
  const getTypeText = (type?: number) => {
    const typeMap: Record<number, string> = {
      1: '综合医院',
      2: '专科医院',
    };
    return type ? typeMap[type] || '-' : '-';
  };

  // 加载详情数据
  const loadDetail = async () => {
    if (!props.data?.id) return;

    loading.value = true;
    try {
      const res = await getMedicalInstitution(props.data.id);
      if (res.data) {
        detailData.value = res.data;
      }
    } catch (error) {
      console.error('获取医疗机构详情失败:', error);
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
  .medical-institution-detail {
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

      .remark-content {
        color: rgb(255 255 255 / 90%);
        font-size: 14px;
        line-height: 1.8;
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
