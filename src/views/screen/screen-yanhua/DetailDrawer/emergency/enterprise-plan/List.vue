<template>
  <div class="enterprise-plan-list">
    <div class="list-header">
      <div class="header-title">企业应急预案列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />
        新增预案
      </a-button>
    </div>

    <div class="list-search">
      <a-space wrap>
        <a-input
          v-model="searchForm.planName"
          placeholder="请输入预案名称"
          style="width: 200px"
          allow-clear
        />
        <CompanySelect
          v-model="searchForm.orgId"
          placeholder="请选择所属企业"
          width="200px"
        />
        <a-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          style="width: 140px"
          allow-clear
        >
          <a-option :value="0">未发布</a-option>
          <a-option :value="1">已发布</a-option>
          <a-option :value="2">已失效</a-option>
        </a-select>
        <a-button type="primary" @click="handleSearch">
          <icon-search />
          查询
        </a-button>
        <a-button @click="handleReset">
          <icon-refresh />
          重置
        </a-button>
      </a-space>
    </div>

    <div class="list-table">
      <a-table
        :data="processedTableData"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="序号" :width="80">
            <template #cell="{ rowIndex }">
              {{
                rowIndex + 1 + (pagination.current - 1) * pagination.pageSize
              }}
            </template>
          </a-table-column>
          <a-table-column title="预案名称" data-index="planName" />
          <a-table-column title="所属企业" data-index="orgName" />
          <a-table-column title="状态" data-index="statusText" :width="100" />
          <a-table-column
            title="失效时间"
            data-index="expireTime"
            :width="180"
          />
          <a-table-column title="操作" :width="200" fixed="right">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">
                  <icon-eye />
                  查看
                </a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <icon-edit />
                  编辑
                </a-button>
                <a-button
                  type="text"
                  status="danger"
                  size="small"
                  @click="handleDelete(record)"
                >
                  <icon-delete />
                  删除
                </a-button>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    getEmergencyPlanList,
    deleteEmergencyPlan,
    type EmergencyPlanListReqVO,
    type EmergencyPlanVO,
  } from '@/api/emergency/plan';
  import { getCompanyNamesByIds } from '@/utils/companyUtils';
  import CompanySelect from '../../../components/CompanySelect/index.vue';

  const emit = defineEmits<{
    (e: 'view', data: any): void;
    (e: 'create', data?: any): void;
  }>();

  // 搜索表单
  const searchForm = reactive<EmergencyPlanListReqVO>({
    planName: '',
    orgId: undefined,
    status: undefined,
    planType: 2, // 企业预案
    orgType: 2, // 企业
    pageNo: 1,
    pageSize: 10,
  });

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // 表格数据
  const tableData = ref<EmergencyPlanVO[]>([]);
  const loading = ref(false);
  // 企业名称映射
  const companyNameMap = ref<Map<number | string, string>>(new Map());

  // 状态转换
  const getStatusText = (status?: number) => {
    switch (status) {
      case 0:
        return '未发布';
      case 1:
        return '已发布';
      case 2:
        return '已失效';
      default:
        return '未知';
    }
  };

  // 处理表格数据 - 添加状态文本和企业名称
  const processedTableData = computed(() =>
    tableData.value.map((item) => ({
      ...item,
      statusText: getStatusText(item.status),
      orgName:
        item.orgName ||
        (item.orgId ? companyNameMap.value.get(item.orgId) : undefined) ||
        '-',
    }))
  );

  // 获取数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      };

      const response = await getEmergencyPlanList(params);

      if (response && response.data) {
        tableData.value = response.data.records || response.data.list || [];
        pagination.total = response.data.total || 0;

        // 获取所有需要查询的企业ID
        const orgIds = tableData.value
          .filter((item) => item.orgId && !item.orgName)
          .map((item) => item.orgId as number | string);

        // 批量获取企业名称
        if (orgIds.length > 0) {
          const nameMap = await getCompanyNamesByIds(orgIds);
          companyNameMap.value = nameMap;
        }
      }
    } catch (error: any) {
      Message.error(error?.message || '获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 查询
  const handleSearch = () => {
    pagination.current = 1;
    searchForm.pageNo = 1;
    fetchData();
  };

  // 重置
  const handleReset = () => {
    searchForm.planName = '';
    searchForm.orgId = undefined;
    searchForm.status = undefined;
    pagination.current = 1;
    searchForm.pageNo = 1;
    fetchData();
  };

  // 分页切换
  const handlePageChange = (page: number) => {
    pagination.current = page;
    searchForm.pageNo = page;
    fetchData();
  };

  // 分页大小改变
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    searchForm.pageSize = pageSize;
    searchForm.pageNo = 1;
    fetchData();
  };

  // 查看详情
  const handleView = (record: EmergencyPlanVO) => {
    emit('view', record);
  };

  // 新增
  const handleCreate = () => {
    emit('create');
  };

  // 编辑
  const handleEdit = (record: EmergencyPlanVO) => {
    emit('create', record);
  };

  // 删除
  const handleDelete = (record: EmergencyPlanVO) => {
    Modal.confirm({
      title: '删除确认',
      content: `确认删除预案「${record.planName}」吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (!record.id) return;
          await deleteEmergencyPlan([record.id]);
          Message.success('删除成功');
          // 如果当前页只有一条数据且不是第一页，则返回上一页
          if (tableData.value.length === 1 && pagination.current > 1) {
            pagination.current -= 1;
            searchForm.pageNo = pagination.current;
          }
          fetchData();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        }
      },
    });
  };

  // 初始化数据
  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .enterprise-plan-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 0;
    overflow: hidden;

    .list-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;

      .header-title {
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 18px;
      }

      :deep(.arco-btn-primary) {
        height: 36px;
        background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
        border: none;
        box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

        &:hover {
          background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
          box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
        }
      }
    }

    .list-search {
      flex-shrink: 0;
      margin-bottom: 18px;
      padding: 16px 20px;
      background: rgb(10 30 60 / 40%);
      border: 1px solid rgb(23 150 250 / 15%);
      border-radius: 4px;

      :deep(.arco-space-item) {
        margin-right: 0;
        margin-bottom: 0;
      }

      :deep(.arco-input-wrapper),
      :deep(.arco-input) {
        color: rgb(255 255 255 / 85%);
        background: rgb(0 0 0 / 30%) !important;
        border-color: rgb(255 255 255 / 15%);

        &:hover {
          border-color: rgb(23 150 250 / 50%);
        }

        &::placeholder {
          color: rgb(255 255 255 / 40%);
        }

        input {
          color: rgb(255 255 255 / 85%);
          background: transparent !important;

          &::placeholder {
            color: rgb(255 255 255 / 40%);
          }
        }
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

    .list-table {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;

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
          color: rgb(255 255 255 / 95%);
          font-weight: 500;
          font-size: 14px;
          text-align: center;
          background: rgb(10 30 60 / 80%) !important;
          border-right: none;
          border-bottom: 2px solid rgb(23 150 250 / 30%);
          border-left: none;
        }

        .arco-table-td {
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

        .arco-table-tr:hover {
          .arco-table-td-fixed-left,
          .arco-table-td-fixed-right {
            background: rgb(23 150 250 / 12%) !important;
          }
        }

        .arco-table-body {
          flex: 1;
          overflow: hidden !important;
          background: transparent !important;
        }

        .arco-empty {
          color: rgb(255 255 255 / 60%);
          background: transparent !important;
        }

        .arco-btn-text {
          color: #1796fa;
          font-weight: 500;

          &:hover {
            color: #2ea3ff;
            background: rgb(23 150 250 / 10%);
          }
        }

        // 删除按钮红色样式
        .arco-btn-text[class*='delete'],
        .arco-btn-status-danger {
          color: #f53f3f !important;

          &:hover {
            color: #ff6b6b !important;
            background: rgb(245 63 63 / 10%) !important;
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

        .arco-pagination-total {
          color: rgb(255 255 255 / 70%);
        }
      }
    }
  }
</style>
