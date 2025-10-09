<template>
  <div class="government-plan-detail">
    <div class="detail-header">
      <a-button @click="handleBack">
        <icon-arrow-left />
        返回列表
      </a-button>
      <div class="header-title">政府应急预案详情</div>
    </div>

    <a-spin :loading="loading" style="flex: 1; width: 100%">
      <div class="detail-content">
        <!-- 左侧：基本信息 -->
        <div class="info-section">
          <a-descriptions :column="1" bordered size="large">
            <a-descriptions-item label="预案名称">
              {{ data.planName || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="预案类型">
              {{ data.planType === 1 ? '政府预案' : '企业预案' }}
            </a-descriptions-item>
            <a-descriptions-item label="机构类型">
              {{ data.orgType === 1 ? '部门' : '企业' }}
            </a-descriptions-item>
            <a-descriptions-item label="所属单位">
              {{ data.orgName || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag v-if="data.status === 0" color="orange">未发布</a-tag>
              <a-tag v-else-if="data.status === 1" color="green">已发布</a-tag>
              <a-tag v-else-if="data.status === 2" color="red">已失效</a-tag>
              <a-tag v-else color="gray">未知</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="失效时间">
              {{ data.expireTime || '—' }}
            </a-descriptions-item>
            <a-descriptions-item label="备注">
              {{ data.remark || '—' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>

        <!-- 右侧：预案内容 -->
        <div class="content-section">
          <div class="section-title">预案内容</div>
          <div
            class="content-view"
            v-html="
              data.planContent || '<span class=placeholder>暂无内容</span>'
            "
          ></div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getEmergencyPlan, type EmergencyPlanVO } from '@/api/emergency/plan';

  const props = defineProps<{
    data?: EmergencyPlanVO;
  }>();

  const emit = defineEmits<{
    (e: 'back'): void;
  }>();

  const loading = ref(false);
  const data = ref<EmergencyPlanVO>({} as EmergencyPlanVO);

  const handleBack = () => {
    emit('back');
  };

  // 加载预案详情
  const loadDetail = async () => {
    if (props.data?.id) {
      loading.value = true;
      try {
        const response: any = await getEmergencyPlan(props.data.id);
        data.value = response.data;
      } catch (error: any) {
        Message.error(error?.message || '加载预案详情失败');
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
  .government-plan-detail {
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
      grid-template-columns: 380px 1fr;
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

      .content-section {
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .section-title {
          flex-shrink: 0;
          margin-bottom: 12px;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 16px;
        }

        .content-view {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          color: rgb(255 255 255 / 85%);
          font-size: 14px;
          line-height: 1.8;
          white-space: pre-wrap;
          word-wrap: break-word;
          background: rgb(10 30 60 / 20%);
          border: 1px solid rgb(23 150 250 / 15%);
          border-radius: 4px;

          :deep(p) {
            margin: 0 0 12px;
            color: rgb(255 255 255 / 85%);
            line-height: 1.8;
          }

          :deep(h1),
          :deep(h2),
          :deep(h3),
          :deep(h4),
          :deep(h5),
          :deep(h6) {
            margin: 16px 0 12px;
            color: rgb(255 255 255 / 90%);
          }

          :deep(ul),
          :deep(ol) {
            margin: 0 0 12px;
            padding-left: 24px;
            color: rgb(255 255 255 / 85%);
          }

          :deep(.placeholder) {
            color: rgb(255 255 255 / 50%);
            font-style: italic;
          }
        }
      }
    }
  }
</style>
