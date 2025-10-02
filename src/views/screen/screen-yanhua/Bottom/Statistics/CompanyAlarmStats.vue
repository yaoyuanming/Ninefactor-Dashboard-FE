<template>
  <div v-loading="loading" class="content-section">
    <div class="section-header">
      <div class="header-left">
        <h3 class="section-title">企业报警统计</h3>
      </div>
      <div class="section-filters">
        <a-input
          v-model="filterForm.enterpriseName"
          placeholder="请输入企业名称"
          allow-clear
          size="small"
          style="width: 180px"
        />
        <a-radio-group
          v-model="filterForm.type"
          type="button"
          size="small"
          style="margin-left: 12px"
        >
          <a-radio value="month">月份</a-radio>
          <a-radio value="year">年份</a-radio>
        </a-radio-group>
        <a-month-picker
          v-if="filterForm.type === 'month'"
          v-model="filterForm.date"
          size="small"
          style="width: 150px; margin-left: 12px"
        />
        <a-date-picker
          v-else
          v-model="filterForm.date"
          mode="year"
          format="YYYY"
          size="small"
          style="width: 150px; margin-left: 12px"
        />
        <a-button
          type="primary"
          size="small"
          style="margin-left: 12px"
          @click="handleSearch"
        >
          查询
        </a-button>
        <a-button size="small" style="margin-left: 12px" @click="handleReset">
          重置
        </a-button>
        <!-- <a-button
          type="primary"
          size="small"
          style="margin-left: 12px"
          @click="handleExport"
        >
          导出
        </a-button> -->
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <a-table
        :columns="tableColumns"
        :data="tableData"
        :pagination="paginationConfig"
        :bordered="false"
        :stripe="false"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
        @sorter-change="handleSorterChange"
      >
        <template #enterpriseName="{ record }">
          <span class="cell-text">{{ record.enterpriseName || '-' }}</span>
        </template>
        <template #total="{ record }">
          <span class="cell-number">{{ record.total || 0 }}</span>
        </template>
        <template #unhandled="{ record }">
          <span class="cell-number">{{ record.unhandled || 0 }}</span>
        </template>
        <template #handled="{ record }">
          <span class="cell-number">{{ record.handled || 0 }}</span>
        </template>
        <template #handlingRate="{ record }">
          <span class="cell-rate">{{ record.handlingRate || '0%' }}</span>
        </template>
        <template #overstaffing="{ record }">
          <span class="cell-number">{{ record.overstaffing || 0 }}</span>
        </template>
        <template #blockedPassage="{ record }">
          <span class="cell-number">{{ record.blockedPassage || 0 }}</span>
        </template>
        <template #overHeightWeight="{ record }">
          <span class="cell-number">{{ record.overHeightWeight || 0 }}</span>
        </template>
        <template #illegalIntrusion="{ record }">
          <span class="cell-number">{{ record.illegalIntrusion || 0 }}</span>
        </template>
        <template #cameraObstruction="{ record }">
          <span class="cell-number">{{ record.cameraObstruction || 0 }}</span>
        </template>
        <template #certificateExpired="{ record }">
          <span class="cell-number">{{ record.certificateExpired || 0 }}</span>
        </template>
        <template #temperatureAlarm="{ record }">
          <span class="cell-number">{{ record.temperatureAlarm || 0 }}</span>
        </template>
        <template #humidityAlarm="{ record }">
          <span class="cell-number">{{ record.humidityAlarm || 0 }}</span>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getAlarmStatisticsByCompany } from '@/api/statistics';
  import type { AlarmStatisticsByCompanyParams } from '@/api/statistics';

  // 获取当前月份 (YYYY-MM 格式)
  const getCurrentMonth = () => {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${m}`;
  };

  // 获取当前年份
  const getCurrentYear = () => String(new Date().getFullYear());

  // 筛选表单
  const filterForm = reactive({
    enterpriseName: '',
    type: 'month' as 'month' | 'year',
    date: getCurrentMonth(),
  });

  // 加载状态
  const loading = ref(false);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 排序配置
  const sorter = reactive({
    dismissRateSort: undefined as boolean | undefined,
    totalSort: undefined as boolean | undefined,
  });

  // 表格数据
  const tableData = ref<any[]>([]);

  // 表格列配置
  const tableColumns = [
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      slotName: 'enterpriseName',
      width: 220,
      fixed: 'left' as const,
      align: 'left' as const,
    },
    {
      title: '总数',
      dataIndex: 'total',
      slotName: 'total',
      width: 90,
      align: 'center' as const,
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
    },
    {
      title: '未消警',
      dataIndex: 'unhandled',
      slotName: 'unhandled',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '已消警',
      dataIndex: 'handled',
      slotName: 'handled',
      width: 90,
      align: 'center' as const,
    },
    {
      title: '消警率',
      dataIndex: 'handlingRate',
      slotName: 'handlingRate',
      width: 100,
      align: 'center' as const,
      sortable: {
        sortDirections: ['ascend', 'descend'],
      },
    },
    {
      title: '超员作业',
      dataIndex: 'overstaffing',
      slotName: 'overstaffing',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '堵塞通道',
      dataIndex: 'blockedPassage',
      slotName: 'blockedPassage',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '超高质量',
      dataIndex: 'overHeightWeight',
      slotName: 'overHeightWeight',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '非法入侵',
      dataIndex: 'illegalIntrusion',
      slotName: 'illegalIntrusion',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '摄像头遮挡偏移',
      dataIndex: 'cameraObstruction',
      slotName: 'cameraObstruction',
      width: 150,
      align: 'center' as const,
    },
    {
      title: '证书过期',
      dataIndex: 'certificateExpired',
      slotName: 'certificateExpired',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '温度报警',
      dataIndex: 'temperatureAlarm',
      slotName: 'temperatureAlarm',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '湿度报警',
      dataIndex: 'humidityAlarm',
      slotName: 'humidityAlarm',
      width: 100,
      align: 'center' as const,
    },
  ];

  // 分页配置对象
  const paginationConfig = computed(() => ({
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: pagination.total,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 30, 50],
  }));

  // 获取统计数据
  const fetchStatistics = async () => {
    loading.value = true;
    try {
      // 解析日期
      let year: number | undefined;
      let month: number | undefined;

      if (filterForm.type === 'month' && filterForm.date) {
        const [y, m] = filterForm.date.split('-');
        year = parseInt(y, 10);
        month = parseInt(m, 10);
      } else if (filterForm.type === 'year' && filterForm.date) {
        year = parseInt(filterForm.date, 10);
      }

      const params: AlarmStatisticsByCompanyParams = {
        year,
        month,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        enterpriseName: filterForm.enterpriseName || undefined,
        dismissRateSort: sorter.dismissRateSort,
        totalSort: sorter.totalSort,
      };

      const response: any = await getAlarmStatisticsByCompany(params);

      // 处理响应数据
      const data = response?.data || response;
      const list = data?.list || data?.records || data || [];
      tableData.value = Array.isArray(list) ? list : [];
      pagination.total = data?.total || list?.length || 0;
    } catch (error) {
      Message.error('获取企业报警统计失败');
      tableData.value = [];
      pagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 查询
  const handleSearch = () => {
    pagination.current = 1;
    fetchStatistics();
  };

  // 重置
  const handleReset = () => {
    filterForm.enterpriseName = '';
    filterForm.type = 'month';
    filterForm.date = getCurrentMonth();
    pagination.current = 1;
    pagination.pageSize = 10;
    sorter.dismissRateSort = undefined;
    sorter.totalSort = undefined;
    fetchStatistics();
    Message.success('重置成功');
  };

  // 导出
  const handleExport = () => {
    Message.info('导出功能开发中...');
  };

  // 分页变化
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchStatistics();
  };

  // 每页条数变化
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchStatistics();
  };

  // 排序变化
  const handleSorterChange = (dataIndex: string, direction: string) => {
    // 重置排序
    sorter.dismissRateSort = undefined;
    sorter.totalSort = undefined;

    if (direction) {
      const isDescend = direction === 'descend';
      if (dataIndex === 'total') {
        sorter.totalSort = isDescend;
      } else if (dataIndex === 'handlingRate') {
        sorter.dismissRateSort = isDescend;
      }
    }

    fetchStatistics();
  };

  // 组件挂载时获取数据
  onMounted(() => {
    fetchStatistics();
  });
</script>

<style scoped lang="less">
  .content-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 20px;
    overflow: hidden;

    .section-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgb(23 150 250 / 20%);

      .header-left {
        display: flex;
        align-items: center;

        .section-title {
          margin: 0;
          color: rgb(255 255 255 / 95%);
          font-weight: 600;
          font-size: 18px;
        }
      }

      .section-filters {
        display: flex;
        align-items: center;

        :deep(.arco-input-wrapper) {
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          &.arco-input-focus {
            border-color: #1796fa;
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent;

            &::placeholder {
              color: rgb(255 255 255 / 35%);
            }
          }
        }

        :deep(.arco-radio-group) {
          .arco-radio-button {
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }
          }

          .arco-radio-checked {
            color: #fff;
            background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
            border-color: #1796fa;
          }
        }

        :deep(.arco-picker) {
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          &.arco-picker-focused {
            border-color: #1796fa;
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent;

            &::placeholder {
              color: rgb(255 255 255 / 35%);
            }
          }
        }

        :deep(.arco-btn-primary) {
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }

        :deep(.arco-btn:not(.arco-btn-primary)) {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            background: rgb(23 150 250 / 10%);
            border-color: rgb(23 150 250 / 50%);
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
          padding: 12px 8px;
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          line-height: 1.4;
          white-space: nowrap;
          text-align: center;
          background: rgb(10 30 60 / 80%) !important;
          border-right: none;
          border-bottom: 2px solid rgb(23 150 250 / 30%);
          border-left: none;

          &:first-child {
            padding-left: 16px;
            text-align: left;
          }

          .arco-table-th-title {
            overflow: visible;
            white-space: nowrap;
            text-overflow: clip;
          }
        }

        .arco-table-td {
          height: 56px;
          padding: 12px 8px;
          color: rgb(255 255 255 / 85%);
          font-size: 14px;
          text-align: center;
          background: transparent !important;
          border-right: none;
          border-bottom: 1px solid rgb(255 255 255 / 8%);
          border-left: none;

          &:first-child {
            padding-left: 16px;
            text-align: left;
          }
        }

        .arco-table-tr:hover {
          .arco-table-td {
            background: rgb(23 150 250 / 12%) !important;
          }
        }

        // 固定列样式
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
          overflow: hidden !important;
          background: transparent !important;
        }

        // 移除所有边框
        .arco-table-border-cell,
        .arco-table-border-wrapper {
          border: none !important;
        }

        // 空状态和加载状态
        .arco-empty,
        .arco-spin,
        .arco-scrollbar {
          background: transparent !important;
        }

        .arco-empty {
          color: rgb(255 255 255 / 60%);
        }

        // 自定义单元格样式
        .cell-text {
          color: rgb(255 255 255 / 85%);
        }

        .cell-number {
          color: #1796fa;
          font-weight: 500;
        }

        .cell-rate {
          color: #52c41a;
          font-weight: 500;
        }
      }

      // 分页样式
      :deep(.arco-pagination) {
        flex-shrink: 0;
        padding: 16px;
        color: rgb(255 255 255 / 85%);
        background: transparent;

        .arco-pagination-item {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover:not(.arco-pagination-item-active) {
            background: rgb(23 150 250 / 15%);
            border-color: rgb(23 150 250 / 50%);
          }

          &.arco-pagination-item-active {
            color: #fff;
            background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
            border-color: #1796fa;
          }
        }

        .arco-pagination-item-previous,
        .arco-pagination-item-next {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover:not(.arco-pagination-item-disabled) {
            background: rgb(23 150 250 / 15%);
            border-color: rgb(23 150 250 / 50%);
          }
        }

        .arco-select-view-single {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          .arco-select-view-value {
            color: rgb(255 255 255 / 85%);
          }

          .arco-icon {
            color: rgb(255 255 255 / 85%);
          }
        }

        .arco-pagination-total {
          color: rgb(255 255 255 / 65%);
        }

        .arco-pagination-jumper-input {
          .arco-input-wrapper {
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }

            input {
              color: rgb(255 255 255 / 85%);
              background: transparent;
            }
          }
        }
      }
    }
  }
</style>
