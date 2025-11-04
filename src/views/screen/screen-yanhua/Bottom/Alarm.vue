<template>
  <div class="alarm-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">报警监控</h2>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item label="企业名称">
          <a-input
            v-model="filterForm.enterpriseName"
            placeholder="请输入企业名称"
            style="width: 200px"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="报警类型">
          <a-select
            v-model="filterForm.alarmType"
            placeholder="请选择报警类型"
            style="width: 200px"
            allow-clear
          >
            <a-option :value="1">超员作业</a-option>
            <a-option :value="2">堵塞通道</a-option>
            <a-option :value="3">超高超量</a-option>
            <a-option :value="4">非法入侵</a-option>
            <a-option :value="5">摄像头遮挡偏移</a-option>
            <a-option :value="6">证书过期</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="报警状态">
          <a-select
            v-model="filterForm.alarmStatus"
            placeholder="请选择报警状态"
            style="width: 150px"
            allow-clear
          >
            <a-option :value="0">未消警</a-option>
            <a-option :value="2">已消警</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="时间">
          <a-range-picker v-model="filterForm.timeRange" style="width: 300px" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 10px" @click="handleReset">
            重置
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ y: '100%' }"
        row-key="id"
        :stripe="false"
        :bordered="false"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #alarmType="{ record }">
          {{
            record.alarmType === 1
              ? '超员作业'
              : record.alarmType === 2
              ? '堵塞通道'
              : record.alarmType === 3
              ? '超高超量'
              : record.alarmType === 4
              ? '非法入侵'
              : record.alarmType === 5
              ? '摄像头遮挡偏移'
              : record.alarmType === 6
              ? '证书过期'
              : '未知'
          }}
        </template>

        <template #alarmFile="{ record }">
          <a-image
            v-if="record.alarmFile"
            :src="record.alarmFile"
            alt="报警图片"
            width="60"
            height="40"
            class="alarm-image"
            fit="cover"
            show-loader
            preview
          />
          <span v-else style="color: rgb(255 255 255 / 40%)">-</span>
        </template>

        <template #alarmLevel="{ record }">
          <a-tag
            :color="
              record.alarmGrade === 1
                ? 'red'
                : record.alarmGrade === 2
                ? 'orange'
                : record.alarmGrade === 3
                ? 'blue'
                : 'default'
            "
          >
            {{
              record.alarmGrade === 1
                ? '严重'
                : record.alarmGrade === 2
                ? '一般'
                : record.alarmGrade === 3
                ? '轻微'
                : '未知'
            }}
          </a-tag>
        </template>

        <template #status="{ record }">
          <a-tag :color="record.alarmStatus === 2 ? 'green' : 'red'">
            {{ record.alarmStatus === 2 ? '已消警' : '未消警' }}
          </a-tag>
        </template>

        <template #warningDate="{ record }">
          {{ formatDateTime(record.warningDate) }}
        </template>

        <template #handlePictures="{ record }">
          <a-image
            v-if="record.handlePictures"
            :src="record.handlePictures"
            alt="消警图片"
            width="60"
            height="40"
            class="alarm-image"
            fit="cover"
            show-loader
            preview
          />
          <span v-else style="color: rgb(255 255 255 / 40%)">-</span>
        </template>

        <template #clearDate="{ record }">
          {{ record.clearDate ? formatDateTime(record.clearDate) : '-' }}
        </template>

        <template #action="{ record }">
          <a-button type="text" size="small" @click="handleView(record)">
            详情
          </a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, inject } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getAlarmPage, type AlarmPageParams } from '@/api/alarm';
  import { formatDateTime } from '@/utils/date';
  import { DrawerType } from '../DetailDrawer/types';

  // 注入打开抽屉的方法
  const openDrawer =
    inject<(type: string, title: string, data?: any) => void>('openDrawer');

  // 筛选表单
  const filterForm = reactive({
    enterpriseName: '',
    alarmType: undefined as number | undefined,
    alarmStatus: undefined as number | undefined,
    timeRange: [] as any[],
  });

  // 表格列配置
  const columns = [
    { title: '企业名称', dataIndex: 'enterpriseName', width: 200 },
    { title: '仓库编号', dataIndex: 'storeNum', width: 120 },
    { title: '库房编号', dataIndex: 'storeroomNum', width: 120 },
    {
      title: '报警类型',
      slotName: 'alarmType',
      width: 150,
    },
    {
      title: '报警等级',
      slotName: 'alarmLevel',
      width: 120,
      align: 'center',
    },
    {
      title: '报警图片',
      slotName: 'alarmFile',
      width: 120,
      align: 'center',
    },
    {
      title: '状态',
      slotName: 'status',
      width: 100,
      align: 'center',
    },
    { title: '报警时间', slotName: 'warningDate', width: 180 },
    {
      title: '消警图片',
      slotName: 'handlePictures',
      width: 120,
      align: 'center',
    },
    { title: '处理时间', slotName: 'clearDate', width: 180 },
    {
      title: '操作',
      slotName: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
    },
  ];

  // 表格数据
  const tableData = ref<any[]>([]);
  const loading = ref(false);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // 获取报警列表数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const params: AlarmPageParams = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        enterpriseName: filterForm.enterpriseName || undefined,
        alarmType: filterForm.alarmType,
        alarmStatus: filterForm.alarmStatus,
      };

      // 处理时间范围
      if (filterForm.timeRange && filterForm.timeRange.length === 2) {
        const [beginTime, endTime] = filterForm.timeRange;
        // 格式化时间为字符串格式 YYYY-MM-DD HH:mm:ss（本地时间）
        if (beginTime) {
          const date = new Date(beginTime);
          params.beginTime = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}-${String(date.getDate()).padStart(
            2,
            '0'
          )} ${String(date.getHours()).padStart(2, '0')}:${String(
            date.getMinutes()
          ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
        if (endTime) {
          const date = new Date(endTime);
          params.endTime = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, '0')}-${String(date.getDate()).padStart(
            2,
            '0'
          )} ${String(date.getHours()).padStart(2, '0')}:${String(
            date.getMinutes()
          ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
        }
      }

      const response = await getAlarmPage(params);
      const { data } = response;

      if (data) {
        tableData.value = data.records || data.list || [];
        pagination.total = data.total || 0;
      }
    } catch (error: any) {
      // 获取报警列表失败
      Message.error(error?.message || '获取报警列表失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  // 重置
  const handleReset = () => {
    filterForm.enterpriseName = '';
    filterForm.alarmType = undefined;
    filterForm.alarmStatus = undefined;
    filterForm.timeRange = [];
    pagination.current = 1;
    fetchData();
  };

  // 分页切换
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchData();
  };

  // 每页条数切换
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
  };

  // 查看详情
  const handleView = (record: any) => {
    if (openDrawer) {
      openDrawer(DrawerType.ALARM_DETAIL, '报警详情', record);
    }
  };

  // 组件挂载时获取数据
  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .alarm-management {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    overflow: hidden;
    background: transparent;

    .page-header {
      display: none;
    }

    .filter-section {
      flex-shrink: 0;
      margin-bottom: 18px;
      padding: 16px 20px;
      background: rgb(10 30 60 / 40%);
      border: 1px solid rgb(23 150 250 / 15%);
      border-radius: 4px;

      .filter-form {
        :deep(.arco-form-item) {
          margin-right: 24px;
          margin-bottom: 0;
        }

        :deep(.arco-form-item-label) {
          color: rgb(255 255 255 / 90%);
          font-weight: 400;
          font-size: 14px;
        }

        :deep(.arco-select),
        :deep(.arco-select-view),
        :deep(.arco-select-view-single) {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%) !important;
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          .arco-select-view-value {
            color: rgb(255 255 255 / 85%);
          }

          .arco-select-view-input input {
            color: rgb(255 255 255 / 85%);
            background: transparent !important;
          }

          .arco-icon {
            color: rgb(255 255 255 / 60%);
          }
        }

        :deep(.arco-picker) {
          background: rgb(0 0 0 / 30%) !important;
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent !important;
          }

          .arco-picker-input {
            color: rgb(255 255 255 / 85%);
          }

          .arco-picker-prefix,
          .arco-picker-suffix {
            color: rgb(255 255 255 / 60%);
          }
        }

        :deep(.arco-input-wrapper) {
          background: rgb(0 0 0 / 30%) !important;
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent !important;
          }
        }

        :deep(.arco-btn-primary) {
          height: 32px;
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }

        :deep(.arco-btn:not(.arco-btn-primary)) {
          height: 32px;
          color: rgb(255 255 255 / 85%);
          background: rgb(255 255 255 / 8%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            background: rgb(255 255 255 / 12%);
            border-color: rgb(255 255 255 / 25%);
          }
        }
      }
    }

    .table-section {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
      border-radius: 0;

      :deep(.arco-table-container) {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: rgb(10 30 60 / 30%) !important;
        border: 1px solid rgb(23 150 250 / 10%);
        border-radius: 4px;
      }

      :deep(.arco-table) {
        flex: 1;
        height: 100%;
        color: #fff;
        font-size: 14px;
        background: transparent !important;

        .arco-table-element,
        .arco-table-content,
        .arco-table-content-inner,
        .arco-table-wrapper,
        .arco-table-header,
        table,
        thead,
        tbody,
        tr {
          background: transparent !important;
        }

        .arco-table-th {
          height: 48px;
          padding: 14px 16px;
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          background: rgb(10 30 60 / 80%) !important;
          border-right: none;
          border-bottom: 2px solid rgb(23 150 250 / 30%);
          border-left: none;
        }

        .arco-table-td {
          height: 56px;
          padding: 14px 16px;
          color: rgb(255 255 255 / 85%);
          font-size: 14px;
          background: transparent !important;
          border-right: none;
          border-bottom: 1px solid rgb(255 255 255 / 8%);
          border-left: none;
        }

        .arco-table-tr:hover {
          .arco-table-td {
            background: rgb(23 150 250 / 12%) !important;
          }
        }

        // 固定列样式（操作列）
        .arco-table-col-fixed-left,
        .arco-table-col-fixed-right,
        .arco-table-td-fixed-left,
        .arco-table-td-fixed-right {
          background: transparent !important;

          &::before,
          &::after {
            display: none !important;
            box-shadow: none !important;
          }
        }

        .arco-table-th-fixed-left,
        .arco-table-th-fixed-right {
          background: rgb(10 30 60 / 80%) !important;

          &::before,
          &::after {
            display: none !important;
            box-shadow: none !important;
          }
        }

        // 移除固定列阴影和边框效果
        .arco-table-cell-fixed-left,
        .arco-table-cell-fixed-right,
        .arco-table-cell-fixed-left-last,
        .arco-table-cell-fixed-right-first {
          background: transparent !important;

          &::before,
          &::after {
            display: none !important;
            box-shadow: none !important;
          }
        }

        // 确保悬停时固定列也是透明的
        .arco-table-tr:hover {
          .arco-table-td-fixed-left,
          .arco-table-td-fixed-right,
          .arco-table-cell-fixed-left,
          .arco-table-cell-fixed-right {
            background: rgb(23 150 250 / 12%) !important;
          }
        }

        .arco-table-body {
          flex: 1;
          background: transparent !important;

          // 自定义滚动条样式
          :deep(.arco-scrollbar) {
            .arco-scrollbar-thumb-bar {
              background: rgb(23 150 250 / 40%) !important;
              border-radius: 4px;

              &:hover {
                background: rgb(23 150 250 / 60%) !important;
              }
            }

            .arco-scrollbar-track {
              background: rgb(255 255 255 / 5%) !important;
            }
          }
        }

        // 移除所有边框
        .arco-table-border-cell,
        .arco-table-border-wrapper {
          border: none !important;
        }

        // 空状态和加载状态
        .arco-empty,
        .arco-spin {
          background: transparent !important;
        }

        .arco-empty {
          color: rgb(255 255 255 / 60%);
        }

        // 标签样式优化
        .arco-tag {
          padding: 4px 12px;
          font-weight: 500;
          font-size: 13px;
          border: none;
          border-radius: 3px;
        }

        // 操作按钮样式优化
        .arco-btn-text {
          color: #1796fa;
          font-weight: 500;

          &:hover {
            color: #2ea3ff;
            background: rgb(23 150 250 / 10%);
          }
        }

        // 报警图片和消警图片样式
        .alarm-image {
          overflow: hidden;
          border-radius: 4px;

          :deep(.arco-image-img) {
            border: 1px solid rgb(23 150 250 / 30%);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: rgb(23 150 250 / 60%);
              box-shadow: 0 2px 8px rgb(23 150 250 / 40%);
              transform: scale(1.05);
            }
          }

          :deep(.arco-image-footer) {
            display: none;
          }
        }
      }

      :deep(.arco-pagination) {
        flex-shrink: 0;
        justify-content: flex-end;
        padding: 16px 20px;
        background: transparent;

        .arco-pagination-item,
        .arco-pagination-item-previous,
        .arco-pagination-item-next {
          color: rgb(255 255 255 / 85%);
          background: rgb(255 255 255 / 8%);
          border: 1px solid rgb(255 255 255 / 15%);
          border-radius: 3px;

          &:hover:not(.arco-pagination-item-disabled) {
            color: #fff;
            background: rgb(23 150 250 / 20%);
            border-color: rgb(23 150 250 / 50%);
          }
        }

        .arco-pagination-item-active {
          color: #fff;
          font-weight: 500;
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border-color: #1796fa;
        }

        .arco-pagination-options-size-changer {
          .arco-select-view {
            color: rgb(255 255 255 / 85%);
            background: rgb(255 255 255 / 8%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              background: rgb(255 255 255 / 12%);
              border-color: rgb(23 150 250 / 50%);
            }
          }
        }

        .arco-pagination-total,
        .arco-pagination-jumper-input-wrapper {
          color: rgb(255 255 255 / 70%);
        }
      }
    }
  }

  // 图片预览遮罩层样式
  :deep(.arco-image-preview-wrapper) {
    .arco-image-preview-toolbar {
      background: rgb(0 0 0 / 80%);
    }

    .arco-image-preview-img-container {
      background: rgb(0 0 0 / 90%);
    }

    .arco-icon {
      color: #fff;

      &:hover {
        color: #1796fa;
      }
    }
  }
</style>
