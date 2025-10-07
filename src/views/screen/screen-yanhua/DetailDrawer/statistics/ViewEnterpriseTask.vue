<template>
  <div v-loading="loading" class="enterprise-task-view">
    <div class="view-content">
      <!-- 任务详情 -->
      <div class="detail-section">
        <div class="section-title">任务详情</div>

        <div class="detail-list">
          <div class="detail-item">
            <div class="detail-label">任务名称</div>
            <div class="detail-value">{{ taskDetail.taskName || '-' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">任务类型</div>
            <div class="detail-value">企业抽查</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">抽查企业</div>
            <div class="detail-value">{{
              taskDetail.targetCompanyNames || '-'
            }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">任务状态</div>
            <div class="detail-value">
              <a-tag :color="getStatusColor(taskDetail.status)">
                {{ getStatusText(taskDetail.status) }}
              </a-tag>
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">创建时间</div>
            <div class="detail-value">{{ taskDetail.createTime || '-' }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">执行次数</div>
            <div class="detail-value"
              >{{ taskDetail.executionCount || 0 }} 次</div
            >
          </div>

          <div class="detail-item">
            <div class="detail-label">立即执行</div>
            <div class="detail-value">{{
              taskDetail.executeImmediately ? '是' : '否'
            }}</div>
          </div>

          <div class="detail-item">
            <div class="detail-label">任务描述</div>
            <div class="detail-value">{{ taskDetail.description || '无' }}</div>
          </div>
        </div>
      </div>

      <!-- 巡查记录 -->
      <div class="record-section">
        <div class="section-title">
          巡查记录
          <span class="record-count">({{ recordData.length }}条)</span>
        </div>

        <a-table
          :columns="columns"
          :data="recordData"
          :pagination="false"
          :bordered="false"
          :stripe="false"
        >
          <template #empty>
            <a-empty description="暂无巡查记录" />
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getInspectionTask, type InspectionTaskVO } from '@/api/statistics';

  interface Props {
    taskId: number | string;
  }

  const props = defineProps<Props>();

  const loading = ref(false);
  const taskDetail = reactive<InspectionTaskVO>({
    taskName: '',
    taskType: 2,
    targetCompanyIds: '',
    targetCompanyNames: '',
    executeImmediately: 0,
    description: '',
    status: 0,
    createTime: '',
  });
  const recordData = ref<any[]>([]);

  // 表格列配置
  const columns = [
    { title: '巡查时间', dataIndex: 'patrolTime', width: 180 },
    { title: '巡查企业', dataIndex: 'patrolEnterprise', width: 200 },
    {
      title: '企业情况',
      dataIndex: 'regionalSituation',
      ellipsis: true,
      tooltip: true,
    },
  ];

  // 获取状态文本
  const getStatusText = (status?: number) => {
    const statusMap: Record<number, string> = {
      1: '待执行',
      2: '执行中',
      3: '已完成',
      4: '已暂停',
    };
    return statusMap[status || 0] || '未知';
  };

  // 获取状态颜色
  const getStatusColor = (status?: number) => {
    const colorMap: Record<number, string> = {
      1: 'blue',
      2: 'green',
      3: 'gray',
      4: 'orange',
    };
    return colorMap[status || 0] || 'gray';
  };

  // 获取任务详情
  const fetchTaskDetail = async () => {
    if (!props.taskId) {
      Message.error('任务ID不存在');
      return;
    }

    loading.value = true;
    try {
      const response: any = await getInspectionTask(props.taskId);

      if (response && response.data) {
        Object.assign(taskDetail, response.data);
        recordData.value = response.data.inspectionRecords || [];
      } else if (response) {
        Object.assign(taskDetail, response);
        recordData.value = response.inspectionRecords || [];
      }
    } catch (error: any) {
      Message.error(error?.message || '获取任务详情失败');
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchTaskDetail();
  });
</script>

<style scoped lang="less">
  .enterprise-task-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px 0;

    .view-content {
      display: grid;
      flex: 1;
      grid-template-columns: 400px 1fr;
      gap: 24px;
      min-height: 0;
      overflow: hidden;
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .record-section {
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }

    .section-title {
      display: flex;
      flex-shrink: 0;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 8px;
      color: rgb(255 255 255 / 95%);
      font-weight: 600;
      font-size: 16px;
      border-bottom: 1px solid rgb(255 255 255 / 10%);

      .record-count {
        color: rgb(255 255 255 / 60%);
        font-weight: 400;
        font-size: 14px;
      }
    }

    .detail-list {
      flex: 1;
      padding-right: 10px;
      overflow-y: auto;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(23 150 250 / 30%);
        border-radius: 3px;

        &:hover {
          background: rgb(23 150 250 / 50%);
        }
      }
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      min-height: 32px;
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .detail-label {
      flex-shrink: 0;
      width: 100px;
      color: rgb(255 255 255 / 75%);
      font-weight: 500;
      font-size: 14px;
      line-height: 32px;
    }

    .detail-value {
      flex: 1;
      min-height: 32px;
      color: rgb(255 255 255 / 90%);
      font-size: 14px;
      line-height: 32px;
      word-break: break-all;
    }

    :deep(.arco-tag) {
      font-size: 12px;
    }

    :deep(.arco-table-container) {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }

    :deep(.arco-table) {
      color: rgb(255 255 255 / 85%);
      font-size: 14px;
      background: rgb(10 30 60 / 20%);
      border: 1px solid rgb(255 255 255 / 8%);
      border-radius: 4px;

      .arco-table-th {
        color: rgb(255 255 255 / 90%);
        font-weight: 500;
        background: rgb(10 30 60 / 40%) !important;
        border-bottom: 1px solid rgb(255 255 255 / 10%);
      }

      .arco-table-td {
        color: rgb(255 255 255 / 85%);
        background: transparent !important;
        border-bottom: 1px solid rgb(255 255 255 / 5%);
      }

      .arco-table-tr:hover {
        .arco-table-td {
          background: rgb(23 150 250 / 10%) !important;
        }
      }

      .arco-empty {
        color: rgb(255 255 255 / 60%);
        background: transparent;
      }
    }
  }
</style>
