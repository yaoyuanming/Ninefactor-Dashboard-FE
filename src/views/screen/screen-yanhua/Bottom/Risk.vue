<template>
  <div class="risk-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">风险管理</h2>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item label="企业名称">
          <a-select
            v-model="filterForm.enterpriseName"
            placeholder="请选择企业"
            style="width: 200px"
            allow-clear
          >
            <a-option value="">全部</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="危险等级">
          <a-select
            v-model="filterForm.dangerLevel"
            placeholder="请选择危险等级"
            style="width: 200px"
            allow-clear
          >
            <a-option value="">全部</a-option>
          </a-select>
        </a-form-item>

        <a-form-item label="状态">
          <a-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            style="width: 150px"
            allow-clear
          >
            <a-option value="">全部</a-option>
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
        row-key="id"
        :stripe="false"
        :bordered="false"
        @page-change="handlePageChange"
      >
        <template #status="{ record }">
          <a-tag
            :color="
              record.status === '已解决'
                ? 'green'
                : record.status === '处理中'
                ? 'orange'
                : 'red'
            "
          >
            {{ record.status }}
          </a-tag>
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
  import { ref, reactive } from 'vue';

  // 筛选表单
  const filterForm = reactive({
    enterpriseName: '',
    dangerLevel: '',
    status: '',
    timeRange: [],
  });

  // 表格列配置
  const columns = [
    { title: '序号', dataIndex: 'id', width: 80, align: 'center' },
    { title: '企业名称', dataIndex: 'name', width: 200 },
    { title: '统一社会信用代码', dataIndex: 'code', width: 180 },
    { title: '所属行业', dataIndex: 'industry', width: 120 },
    { title: '风险等级', dataIndex: 'riskLevel', width: 120 },
    {
      title: '状态',
      slotName: 'status',
      width: 100,
      align: 'center',
    },
    { title: '创建时间', dataIndex: 'createTime', width: 180 },
    { title: '更新时间', dataIndex: 'updateTime', width: 180 },
    {
      title: '操作',
      slotName: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
    },
  ];

  // 表格数据（占位）
  const tableData = ref([
    {
      id: 1,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '烟花爆竹',
      riskLevel: '超高风险',
      status: '已解决',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
    {
      id: 2,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '烟花爆竹',
      riskLevel: '高风险',
      status: '处理中',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
    {
      id: 3,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '涉水大区',
      riskLevel: '中风险',
      status: '已解决',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
    {
      id: 4,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '超高风险',
      riskLevel: '超高风险',
      status: '处理中',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
    {
      id: 5,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '超高风险',
      riskLevel: '超高风险',
      status: '已解决',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
    {
      id: 6,
      name: '福州市XXXXX公司',
      code: '102937',
      industry: '超高风险',
      riskLevel: '超高风险',
      status: '处理中',
      createTime: '2025-09-25 13:00:12',
      updateTime: '2025-09-25 13:00:12',
    },
  ]);

  const loading = ref(false);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 100,
    showTotal: true,
    showPageSize: true,
  });

  // 搜索
  const handleSearch = () => {
    console.log('搜索条件:', filterForm);
    // TODO: 调用API接口
  };

  // 重置
  const handleReset = () => {
    filterForm.enterpriseName = '';
    filterForm.dangerLevel = '';
    filterForm.status = '';
    filterForm.timeRange = [];
  };

  // 分页切换
  const handlePageChange = (page: number) => {
    pagination.current = page;
    // TODO: 调用API接口
  };

  // 查看详情
  const handleView = (record: any) => {
    console.log('查看详情:', record);
    // TODO: 打开详情弹窗或跳转
  };
</script>

<style scoped lang="less">
  .risk-management {
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
          overflow: hidden !important;
          background: transparent !important;
        }

        // 移除所有边框
        .arco-table-border-cell,
        .arco-table-border-wrapper {
          border: none !important;
        }

        // 空状态、加载状态和滚动条
        .arco-empty,
        .arco-spin,
        .arco-scrollbar {
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
</style>
