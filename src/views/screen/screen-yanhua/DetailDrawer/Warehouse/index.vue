<template>
  <div class="warehouse-overview">
    <!-- 标签页 -->
    <a-tabs v-model:active-key="activeKey">
      <a-tab-pane key="warehouse" title="仓库">
        <!-- 搜索区域 -->
        <div class="search-area">
          <a-input
            v-model:value="searchValue"
            placeholder="请输入仓库名称或仓库编号"
            style="width: 200px; margin-right: 8px"
          />
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="handleReset"
            >重置</a-button
          >
        </div>

        <!-- 表格区域 -->
        <a-table
          :loading="loading"
          :columns="currentColumns"
          :data="tableData"
          bordered
          :pagination="false"
          @page-change="handlePageChange"
        >
          <template #empty>
            <div>暂无数据</div>
          </template>
        </a-table>

        <div class="pagination">
          <a-pagination
            v-if="pagination.total != 0"
            :total="pagination.total"
            :current="pagination.current"
            :page-size="pagination.pageSize"
            @change="handlePageChange"
          />
        </div>
      </a-tab-pane>
      <a-tab-pane key="storage-room" title="库房">
        <!-- 搜索区域（与仓库标签页共用搜索值） -->
        <div class="search-area">
          <a-input
            v-model:value="searchValue"
            placeholder="请输入库房名称或库房编号"
            style="width: 200px; margin-right: 8px"
          />
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button style="margin-left: 8px" @click="handleReset"
            >重置</a-button
          >
        </div>

        <!-- 库房表格区域 -->
        <a-table
          :loading="loading"
          :columns="storageRoomColumns"
          :data="tableData"
          bordered
          :pagination="false"
          @page-change="handlePageChange"
        >
          <template #empty>
            <div>暂无数据</div>
          </template>
        </a-table>

        <div class="pagination">
          <a-pagination
            v-if="pagination.total != 0"
            :total="pagination.total"
            :current="pagination.current"
            :page-size="pagination.pageSize"
            @change="handlePageChange"
          />
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { getRepositoryList, getWarehouseList } from '@/api/compmonitoring';

  // 激活的标签页key
  const activeKey = ref('warehouse');
  // 搜索值
  const searchValue = ref('');
  // 表格加载状态
  const loading = ref(false);
  // 表格数据
  const tableData = ref([]);

  // 分页配置
  const pagination = ref({
    total: 0,
    pageSize: 10,
    current: 1,
    showTotal: (total: number) => `共 ${total} 条`,
    showQuickJumper: true,
  });

  // 仓库表格列配置
  const warehouseColumns = [
    {
      title: '仓库名称',
      dataIndex: 'warehouseName',
    },
    {
      title: '仓库编号',
      dataIndex: 'warehouseNum',
    },
    {
      title: '面积(m²)',
      dataIndex: 'acreage',
    },
    {
      title: '危险等级',
      dataIndex: 'dangerLevel',
    },
    {
      title: '剂量(千克)',
      dataIndex: 'dosage',
    },
    {
      title: '位置',
      dataIndex: 'location',
    },
    {
      title: '人员限制',
      dataIndex: 'personLimit',
    },
    {
      title: '创建时间',
      dataIndex: 'createDate',
    },
  ];

  // 库房表格列配置
  const storageRoomColumns = [
    {
      title: '库房名称',
      dataIndex: 'roomName',
    },
    {
      title: '库房编号',
      dataIndex: 'roomNum',
    },
    {
      title: '面积(m²)',
      dataIndex: 'acreage',
    },
    {
      title: '危险等级',
      dataIndex: 'dangerLevel',
    },
    {
      title: '剂量(千克)',
      dataIndex: 'dosage',
    },
    {
      title: '人员限制',
      dataIndex: 'personLimit',
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
    },
  ];

  // 根据激活的标签页，动态选择表格列
  const currentColumns = computed(() => {
    return activeKey.value === 'warehouse'
      ? warehouseColumns
      : storageRoomColumns;
  });

  // 搜索方法
  const handleSearch = () => {
    loading.value = true;
    const requestParams = {
      ...(searchValue.value ? { keyword: searchValue.value } : {}),
      pageNo: pagination.value.current,
      pageSize: pagination.value.pageSize,
    };

    if (activeKey.value === 'warehouse') {
      getRepositoryList(requestParams)
        .then((res) => {
          tableData.value = res.data.records;
          pagination.value.total = res.total;
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      getWarehouseList(requestParams)
        .then((res) => {
          tableData.value = res.data.records;
          pagination.value.total = res.total;
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };

  // 重置方法
  const handleReset = () => {
    searchValue.value = '';
    handleSearch();
  };

  // 分页变更方法
  const handlePageChange = (current: number) => {
    pagination.value.current = current;
    handleSearch();
  };

  onMounted(() => {
    handleSearch();
  });
</script>

<style scoped lang="less">
  .warehouse-overview {
    color: #fff;
    background: transparent;
  }

  // 标签页样式 - 参考企业页面
  ::v-deep(.arco-tabs) {
    background: transparent !important;

    .arco-tabs-nav {
      background: transparent !important;
      border-bottom: none !important;

      &::before {
        background-color: transparent !important;
      }

      .arco-tabs-tab {
        margin-right: 4px;
        padding: 12px 20px;
        color: rgb(255 255 255 / 80%) !important;
        background: transparent !important;
        border: none;
        border-radius: 6px 6px 0 0;

        &:hover {
          color: #1796fa !important;
          background: rgb(23 150 250 / 10%) !important;
        }

        &.arco-tabs-tab-active {
          color: #fff !important;
          font-weight: 500;
          background: rgb(23 150 250 / 20%) !important;
          border-bottom: 2px solid #1796fa;
        }
      }

      .arco-tabs-nav-ink {
        height: 2px;
        background: #1796fa !important;
      }
    }

    .arco-tabs-content {
      padding-top: 16px;
      background: transparent !important;
    }

    .arco-tabs-content-item {
      background: transparent !important;
    }
  }

  // 搜索筛选区样式 - 完全参考企业页面
  .search-area {
    flex-shrink: 0;
    margin-bottom: 16px;
    padding: 16px;
    background: rgb(10 30 60 / 30%);
    border: 1px solid rgb(23 150 250 / 20%);
    border-radius: 8px;

    :deep(.arco-input-wrapper) {
      color: rgb(255 255 255 / 85%);
      background: rgb(10 30 60 / 50%);
      border-color: rgb(23 150 250 / 30%);

      &:hover {
        border-color: rgb(23 150 250 / 50%);
      }

      &:focus-within {
        border-color: rgb(23 150 250 / 70%);
      }

      input {
        color: rgb(255 255 255 / 85%);
        background: transparent;

        &::placeholder {
          color: rgb(255 255 255 / 40%);
        }
      }

      .arco-input {
        background: transparent;
      }
    }

    :deep(.arco-btn-primary) {
      background: linear-gradient(135deg, rgb(23 150 250), rgb(20 120 200));
      border: none;

      &:hover {
        background: linear-gradient(135deg, rgb(40 160 255), rgb(30 130 210));
      }
    }

    :deep(.arco-btn:not(.arco-btn-primary)) {
      color: rgb(255 255 255 / 75%);
      background: rgb(255 255 255 / 8%);
      border-color: rgb(255 255 255 / 15%);

      &:hover {
        background: rgb(255 255 255 / 12%);
        border-color: rgb(23 150 250 / 50%);
      }
    }
  }

  // 表格样式 - 完全参考企业页面
  ::v-deep(.arco-table) {
    color: #fff;
    font-size: 14px;
    background: transparent;

    .arco-table-container {
      overflow: hidden;
      background: rgb(10 30 60 / 30%) !important;
      border: 1px solid rgb(23 150 250 / 10%);
      border-radius: 8px;
    }

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
      padding: 16px 12px;
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
      padding: 14px 12px;
      color: rgb(255 255 255 / 85%);
      font-size: 14px;
      text-align: center;
      background: transparent !important;
      border-right: none;
      border-bottom: 1px solid rgb(255 255 255 / 8%);
      border-left: none;

      // 第一列高亮 - 参考企业页面
      &:first-child {
        color: #1796fa;
        font-weight: 500;
      }
    }

    .arco-table-tr:hover {
      .arco-table-td {
        background: rgb(23 150 250 / 12%) !important;
      }
    }

    // 最后一行去掉底部边框
    .arco-table-tr:last-child {
      .arco-table-td {
        border-bottom: none;
      }
    }

    // 空数据状态
    .arco-empty {
      color: rgb(255 255 255 / 60%);
      background: transparent !important;
    }

    // 加载状态
    .arco-table-loading {
      background: transparent;

      .arco-spin {
        .arco-spin-icon {
          color: #1796fa;
        }
      }
    }
  }

  // 分页样式 - 参考企业页面
  .pagination {
    display: flex;
    justify-content: end;
    padding: 16px 0;
  }

  ::v-deep(.arco-pagination) {
    .arco-pagination-item,
    .arco-pagination-item-previous,
    .arco-pagination-item-next {
      color: rgb(255 255 255 / 85%);
      background: rgb(255 255 255 / 8%);
      border: 1px solid rgb(255 255 255 / 15%);
      border-radius: 4px;

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

    .arco-pagination-item-disabled {
      color: rgb(255 255 255 / 30%);
      background: rgb(255 255 255 / 4%);
      border-color: rgb(255 255 255 / 8%);
    }

    .arco-pagination-total {
      color: rgb(255 255 255 / 70%);
    }
  }
</style>
