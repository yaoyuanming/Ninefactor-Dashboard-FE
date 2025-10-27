<template>
  <div class="supplies-list">
    <!-- 顶部操作栏 -->
    <div class="list-header">
      <div class="header-title">应急物资列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />
        新增物资
      </a-button>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-filter">
      <a-space size="medium">
        <a-input
          v-model="searchForm.suppliesName"
          placeholder="请输入物资名称"
          allow-clear
          style="width: 200px"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>

        <a-input
          v-model="searchForm.warehouseName"
          placeholder="请输入仓库名称"
          allow-clear
          style="width: 180px"
        />

        <a-select
          v-model="searchForm.suppliesType"
          placeholder="请选择物资类型"
          allow-clear
          style="width: 180px"
        >
          <a-option
            v-for="opt in suppliesTypeOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          />
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

    <!-- 表格区域 -->
    <div class="table-container">
      <a-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #columns>
          <a-table-column title="序号" :width="80" align="center">
            <template #cell="{ rowIndex }">
              {{
                (pagination.current - 1) * pagination.pageSize + rowIndex + 1
              }}
            </template>
          </a-table-column>

          <a-table-column
            title="物资名称"
            data-index="suppliesName"
            :width="180"
          />

          <a-table-column
            title="仓库名称"
            data-index="warehouseName"
            :width="160"
          />

          <a-table-column title="物资类型" :width="120" align="center">
            <template #cell="{ record }">
              {{ getSuppliesTypeText(record.suppliesType) }}
            </template>
          </a-table-column>

          <a-table-column
            title="所在区域"
            data-index="areaNames"
            :width="160"
          />

          <a-table-column title="数量" :width="100" align="center">
            <template #cell="{ record }">
              {{ record.quantity || '-' }}
            </template>
          </a-table-column>

          <a-table-column
            title="存放位置"
            data-index="storageLocation"
            :width="160"
          />

          <a-table-column title="图片" :width="120" align="center">
            <template #cell="{ record }">
              <div v-if="record.tempImageUrls" class="photo-cell">
                <a-image
                  :src="getFirstImage(record.tempImageUrls)"
                  width="64"
                  height="40"
                  fit="cover"
                  :preview="true"
                />
              </div>
              <span v-else class="no-photo">暂无图片</span>
            </template>
          </a-table-column>

          <a-table-column
            title="操作"
            :width="200"
            align="center"
            fixed="right"
          >
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="handleView(record)">
                  查看
                </a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button
                  type="text"
                  size="small"
                  status="danger"
                  @click="handleDelete(record)"
                >
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
  import { ref, reactive, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import {
    getEmergencySuppliesList,
    deleteEmergencySupplies,
    type EmergencySuppliesVO,
    type EmergencySuppliesListReqVO,
  } from '@/api/emergency';

  const emit = defineEmits<{
    (e: 'view', data: EmergencySuppliesVO): void;
    (e: 'create', data?: EmergencySuppliesVO): void;
  }>();

  const loading = ref(false);
  const tableData = ref<EmergencySuppliesVO[]>([]);

  // 搜索表单
  const searchForm = reactive<EmergencySuppliesListReqVO>({
    suppliesName: '',
    warehouseName: '',
    suppliesType: undefined,
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

  // 物资类型选项
  const suppliesTypeOptions = [
    { value: 1, label: '防护用品' },
    { value: 2, label: '生命救助' },
    { value: 3, label: '生命支持' },
    { value: 4, label: '救援运载' },
    { value: 5, label: '临时食宿' },
    { value: 6, label: '其他' },
  ];

  // 获取物资类型文本
  const getSuppliesTypeText = (type?: number) => {
    const option = suppliesTypeOptions.find((item) => item.value === type);
    return option ? option.label : '—';
  };

  // 获取第一张图片
  const getFirstImage = (imageUrls?: string) => {
    if (!imageUrls) return '';
    try {
      const imageList = JSON.parse(imageUrls);
      return Array.isArray(imageList) && imageList.length > 0
        ? imageList[0]
        : '';
    } catch {
      const imageList = imageUrls.split(',').filter(Boolean);
      return imageList.length > 0 ? imageList[0] : '';
    }
  };

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const response: any = await getEmergencySuppliesList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        suppliesName: searchForm.suppliesName || undefined,
        warehouseName: searchForm.warehouseName || undefined,
        suppliesType: searchForm.suppliesType,
      });

      if (response.data) {
        tableData.value = response.data.records || [];
        pagination.total = response.data.total || 0;
      }
    } catch (error: any) {
      Message.error(error?.message || '获取物资列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 查询
  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  // 重置
  const handleReset = () => {
    searchForm.suppliesName = '';
    searchForm.warehouseName = '';
    searchForm.suppliesType = undefined;
    pagination.current = 1;
    fetchData();
  };

  // 分页改变
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchData();
  };

  // 每页条数改变
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchData();
  };

  // 新增物资
  const handleCreate = () => {
    emit('create');
  };

  // 查看详情
  const handleView = (record: EmergencySuppliesVO) => {
    emit('view', record);
  };

  // 编辑物资
  const handleEdit = (record: EmergencySuppliesVO) => {
    emit('create', record);
  };

  // 删除物资
  const handleDelete = (record: EmergencySuppliesVO) => {
    Modal.confirm({
      title: '删除确认',
      content: `确认删除物资「${record.suppliesName}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        if (!record.id) return;
        try {
          await deleteEmergencySupplies([record.id]);
          Message.success('删除成功');
          fetchData();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        }
      },
    });
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .supplies-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .list-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;

      .header-title {
        color: #fff;
        font-weight: 600;
        font-size: 18px;
      }
    }

    .search-filter {
      flex-shrink: 0;
      margin-bottom: 16px;
      padding: 16px;
      background: rgb(10 30 60 / 30%);
      border: 1px solid rgb(23 150 250 / 20%);
      border-radius: 4px;

      :deep(.arco-input-wrapper),
      :deep(.arco-select-view-single) {
        color: rgb(255 255 255 / 85%);
        background: rgb(10 30 60 / 50%);
        border-color: rgb(23 150 250 / 30%);

        &:hover {
          border-color: rgb(23 150 250 / 50%);
        }

        &:focus-within {
          border-color: rgb(23 150 250 / 70%);
        }

        input,
        .arco-select-view-value {
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

    .table-container {
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

        // 照片单元格
        .photo-cell {
          display: flex;
          align-items: center;
          justify-content: center;

          :deep(.arco-image) {
            overflow: hidden;
            border-radius: 4px;
          }
        }

        .no-photo {
          color: rgb(255 255 255 / 40%);
          font-size: 12px;
        }

        // 操作按钮
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
