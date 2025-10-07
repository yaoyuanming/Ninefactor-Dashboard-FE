<template>
  <div class="content-section">
    <div class="section-header">
      <div class="header-left">
        <h3 class="section-title">巡查统计</h3>
      </div>
      <div class="section-actions">
        <a-button type="primary" size="small" @click="handleCreateTask">
          <template #icon>
            <icon-plus />
          </template>
          新建巡查任务
        </a-button>
      </div>
    </div>

    <!-- 标签页 -->
    <div class="tabs-section">
      <a-tabs v-model:active-key="activeTab" @change="handleTabChange">
        <!-- 地区巡查 -->
        <a-tab-pane key="regional" title="地区巡查">
          <div class="table-wrapper">
            <a-table
              :columns="regionalColumns"
              :data="regionalData"
              :pagination="regionalPaginationConfig"
              :loading="loading"
              :bordered="false"
              :stripe="false"
              @page-change="handleRegionalPageChange"
              @page-size-change="handleRegionalPageSizeChange"
            >
              <template #action="{ record }">
                <a-button type="text" size="small" @click="handleView(record)">
                  查看
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </template>
            </a-table>
          </div>
        </a-tab-pane>

        <!-- 企业抽查 -->
        <a-tab-pane key="enterprise" title="企业抽查">
          <div class="table-wrapper">
            <a-table
              :columns="enterpriseColumns"
              :data="enterpriseData"
              :pagination="enterprisePaginationConfig"
              :loading="loading"
              :bordered="false"
              :stripe="false"
              @page-change="handleEnterprisePageChange"
              @page-size-change="handleEnterprisePageSizeChange"
            >
              <template #action="{ record }">
                <a-button type="text" size="small" @click="handleView(record)">
                  查看
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed, onMounted, inject } from 'vue';
  import { IconPlus } from '@arco-design/web-vue/es/icon';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    getCompanyInspectionTaskList,
    getAreaInspectionTaskList,
    deleteInspectionTask,
  } from '@/api/statistics';
  import type { InspectionTaskListParams } from '@/api/statistics';
  import { DrawerType, type DrawerTypeValue } from '../../DetailDrawer/types';

  // 注入父组件提供的方法
  const openDrawer =
    inject<(type: DrawerTypeValue, title: string, data?: any) => void>(
      'openDrawer'
    );
  const setDrawerSuccessCallback = inject<(callback: () => void) => void>(
    'setDrawerSuccessCallback'
  );

  // 当前活动标签页
  const activeTab = ref('regional');

  // 加载状态
  const loading = ref(false);

  // 地区巡查数据
  const regionalData = ref<any[]>([]);

  // 企业抽查数据
  const enterpriseData = ref<any[]>([]);

  // 地区巡查分页
  const regionalPagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 企业抽查分页
  const enterprisePagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 表格列配置
  const regionalColumns = [
    { title: '巡查任务名称', dataIndex: 'taskName' },
    {
      title: '巡查区域',
      dataIndex: 'areaNames',
      ellipsis: true,
      tooltip: true,
    },
    { title: '创建时间', dataIndex: 'createTime' },
    { title: '操作', slotName: 'action', align: 'center' as const },
  ];

  const enterpriseColumns = [
    { title: '巡查任务名称', dataIndex: 'taskName' },
    {
      title: '抽查企业',
      dataIndex: 'targetCompanyNames',
      ellipsis: true,
      tooltip: true,
    },
    { title: '创建时间', dataIndex: 'createTime' },
    { title: '操作', slotName: 'action', align: 'center' as const },
  ];

  // 地区巡查分页配置
  const regionalPaginationConfig = computed(() => ({
    current: regionalPagination.current,
    pageSize: regionalPagination.pageSize,
    total: regionalPagination.total,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
  }));

  // 企业抽查分页配置
  const enterprisePaginationConfig = computed(() => ({
    current: enterprisePagination.current,
    pageSize: enterprisePagination.pageSize,
    total: enterprisePagination.total,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 50, 100],
  }));

  // 获取地区巡查数据
  const fetchRegionalData = async () => {
    loading.value = true;
    try {
      const params: InspectionTaskListParams = {
        pageNo: regionalPagination.current,
        pageSize: regionalPagination.pageSize,
      };

      const response: any = await getAreaInspectionTaskList(params);

      regionalData.value = response?.data?.records || [];
      regionalPagination.total = response?.data?.total || 0;
    } catch (error) {
      Message.error('获取地区巡查数据失败');
      regionalData.value = [];
      regionalPagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 获取企业抽查数据
  const fetchEnterpriseData = async () => {
    loading.value = true;
    try {
      const params: InspectionTaskListParams = {
        pageNo: enterprisePagination.current,
        pageSize: enterprisePagination.pageSize,
      };

      const response: any = await getCompanyInspectionTaskList(params);

      enterpriseData.value = response?.data?.records || [];
      enterprisePagination.total = response?.data?.total || 0;
    } catch (error) {
      Message.error('获取企业抽查数据失败');
      enterpriseData.value = [];
      enterprisePagination.total = 0;
    } finally {
      loading.value = false;
    }
  };

  // 标签页切换
  const handleTabChange = () => {
    if (activeTab.value === 'regional') {
      fetchRegionalData();
    } else if (activeTab.value === 'enterprise') {
      fetchEnterpriseData();
    }
  };

  // 新建巡查任务
  const handleCreateTask = () => {
    if (openDrawer) {
      if (activeTab.value === 'regional') {
        openDrawer(DrawerType.REGIONAL_TASK, '新建地区巡查任务');
      } else {
        openDrawer(DrawerType.ENTERPRISE_TASK, '新建企业抽查任务');
      }
    }
  };

  // 查看任务
  const handleView = (record: any) => {
    if (openDrawer) {
      if (activeTab.value === 'regional') {
        // 地区巡查任务
        openDrawer(
          DrawerType.VIEW_REGIONAL_TASK,
          '查看地区巡查任务',
          record.id
        );
      } else {
        // 企业抽查任务
        openDrawer(
          DrawerType.VIEW_ENTERPRISE_TASK,
          '查看企业抽查任务',
          record.id
        );
      }
    }
  };

  // 删除任务
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个巡查任务吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          await deleteInspectionTask(record.id);
          Message.success('删除成功');
          // 刷新当前标签页数据
          if (activeTab.value === 'regional') {
            fetchRegionalData();
          } else {
            fetchEnterpriseData();
          }
        } catch (error) {
          Message.error('删除失败，请重试');
        }
      },
    });
  };

  // 分页变化处理
  const handleRegionalPageChange = (page: number) => {
    regionalPagination.current = page;
    fetchRegionalData();
  };

  const handleRegionalPageSizeChange = (pageSize: number) => {
    regionalPagination.pageSize = pageSize;
    regionalPagination.current = 1;
    fetchRegionalData();
  };

  const handleEnterprisePageChange = (page: number) => {
    enterprisePagination.current = page;
    fetchEnterpriseData();
  };

  const handleEnterprisePageSizeChange = (pageSize: number) => {
    enterprisePagination.pageSize = pageSize;
    enterprisePagination.current = 1;
    fetchEnterpriseData();
  };

  // 组件挂载时加载默认标签页数据
  onMounted(() => {
    fetchRegionalData();

    // 设置抽屉成功回调
    if (setDrawerSuccessCallback) {
      setDrawerSuccessCallback(() => {
        if (activeTab.value === 'regional') {
          fetchRegionalData();
        } else {
          fetchEnterpriseData();
        }
      });
    }
  });
</script>

<style scoped lang="less">
  .content-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
    overflow: hidden;

    .section-header {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
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

      .section-actions {
        :deep(.arco-btn-primary) {
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }
      }
    }

    .tabs-section {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;

      :deep(.arco-tabs) {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;

        .arco-tabs-nav {
          flex-shrink: 0;
          padding: 0;
          background: transparent;
          border-bottom: 1px solid rgb(23 150 250 / 20%);

          &::before {
            display: none;
          }

          .arco-tabs-tab {
            color: rgb(255 255 255 / 65%);
            font-size: 14px;

            &:hover {
              color: rgb(255 255 255 / 85%);
            }

            &.arco-tabs-tab-active {
              color: #1796fa;
              font-weight: 500;
            }
          }

          .arco-tabs-ink-bar {
            height: 2px;
            background: linear-gradient(90deg, #1796fa 0%, #2ea3ff 100%);
          }
        }

        .arco-tabs-content-list {
          display: flex;
          flex: 1;
          min-height: 400px;
          overflow: visible;
        }

        .arco-tabs-content {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 400px;
          overflow: visible;
        }

        .arco-tabs-pane {
          display: flex;
          flex: 1;
          flex-direction: column;
          min-height: 400px;
          overflow: visible;
        }
      }

      .table-wrapper {
        flex: 1;
        min-height: 300px;
        margin-top: 12px;
        overflow: auto;

        :deep(.arco-table-container) {
          background: rgb(10 30 60 / 30%) !important;
          border: 1px solid rgb(23 150 250 / 10%);
          border-radius: 4px;
        }

        :deep(.arco-table) {
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
            height: 36px;
            padding: 6px 12px;
            color: rgb(255 255 255 / 95%);
            font-weight: 500;
            font-size: 13px;
            line-height: 1.4;
            white-space: nowrap;
            background: rgb(10 30 60 / 80%) !important;
            border-right: none;
            border-bottom: 2px solid rgb(23 150 250 / 30%);
            border-left: none;
          }

          .arco-table-td {
            height: 40px;
            padding: 6px 12px;
            color: rgb(255 255 255 / 85%);
            font-size: 13px;
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

          .arco-table-body {
            background: transparent !important;
          }

          .arco-empty,
          .arco-spin,
          .arco-scrollbar {
            background: transparent !important;
          }

          .arco-empty {
            color: rgb(255 255 255 / 60%);
          }

          .cell-text {
            color: rgb(255 255 255 / 85%);
          }

          .arco-btn-text {
            padding: 0 8px;
            color: #1796fa;
            font-weight: 500;
            font-size: 13px;

            &:hover {
              color: #2ea3ff;
              background: rgb(23 150 250 / 10%);
            }

            &.arco-btn-status-danger {
              color: #f53f3f;

              &:hover {
                color: #ff6b6b;
                background: rgb(245 63 63 / 10%);
              }
            }
          }
        }

        :deep(.arco-pagination) {
          flex-shrink: 0;
          padding: 12px 16px;
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
  }
</style>
