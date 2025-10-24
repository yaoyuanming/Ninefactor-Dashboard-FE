<template>
  <div class="expert-list">
    <!-- 顶部操作栏 -->
    <div class="list-header">
      <div class="header-title">应急专家列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />
        新增专家
      </a-button>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-filter">
      <a-space size="medium">
        <a-input
          v-model="searchForm.expertName"
          placeholder="请输入专家姓名"
          allow-clear
          style="width: 200px"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>

        <a-select
          v-model="searchForm.specialtyField"
          placeholder="请选择专业领域"
          allow-clear
          style="width: 180px"
        >
          <a-option
            v-for="opt in specialtyFieldOptions"
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
        :scroll="{ y: 'calc(70vh - 340px)' }"
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
            title="专家姓名"
            data-index="expertName"
            :width="120"
          />

          <a-table-column title="专业领域" :width="140">
            <template #cell="{ record }">
              {{ getSpecialtyFieldText(record.specialtyField) }}
            </template>
          </a-table-column>

          <a-table-column
            title="技术职称"
            data-index="technicalTitle"
            :width="120"
          />

          <a-table-column title="工作单位" :width="160">
            <template #cell="{ record }">
              {{ deptNameMap[record.workUnit] || record.workUnit || '-' }}
            </template>
          </a-table-column>

          <a-table-column title="照片" :width="120" align="center">
            <template #cell="{ record }">
              <div v-if="record.tempPhotoUrls" class="photo-cell">
                <a-image
                  :src="getFirstImage(record.tempPhotoUrls)"
                  width="64"
                  height="40"
                  fit="cover"
                  :preview="true"
                  :preview-props="{ actionsLayout: ['zoomIn', 'zoomOut'] }"
                />
              </div>
              <span v-else class="no-photo">暂无照片</span>
            </template>
          </a-table-column>

          <a-table-column
            title="联系电话"
            data-index="contactPhone"
            :width="140"
          />

          <a-table-column title="可用状态" :width="100" align="center">
            <template #cell="{ record }">
              <a-tag
                v-if="record.availabilityStatus === 1"
                color="green"
                size="small"
              >
                可用
              </a-tag>
              <a-tag v-else color="gray" size="small">不可用</a-tag>
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
    getEmergencyExpertList,
    deleteEmergencyExpert,
    type EmergencyExpertVO,
  } from '@/api/emergency/expert';
  import { getDeptNamesByIds } from '@/utils/deptUtils';

  const emit = defineEmits<{
    (e: 'view', data: EmergencyExpertVO): void;
    (e: 'create', data?: EmergencyExpertVO): void;
  }>();

  const loading = ref(false);
  const tableData = ref<EmergencyExpertVO[]>([]);
  // 部门名称映射
  const deptNameMap = ref<Record<string | number, string>>({});

  // 搜索表单
  const searchForm = reactive({
    expertName: '',
    specialtyField: undefined as number | undefined,
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

  // 专业领域选项
  const specialtyFieldOptions = [
    { value: 1, label: '烟花爆竹工艺' },
    { value: 2, label: '安全管理' },
    { value: 3, label: '消防救援' },
    { value: 4, label: '化工' },
    { value: 5, label: '环境监测' },
    { value: 6, label: '其他' },
  ];

  // 获取专业领域文本
  const getSpecialtyFieldText = (field: number) => {
    const option = specialtyFieldOptions.find((item) => item.value === field);
    return option ? option.label : '—';
  };

  // 获取第一张图片
  const getFirstImage = (imageUrls: string | string[]) => {
    if (!imageUrls) return '';
    if (typeof imageUrls === 'string') return imageUrls;
    if (Array.isArray(imageUrls) && imageUrls.length > 0) {
      return imageUrls[0];
    }
    return '';
  };

  // 获取列表数据
  const fetchData = async () => {
    loading.value = true;
    try {
      const response: any = await getEmergencyExpertList({
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        expertName: searchForm.expertName || undefined,
        specialtyField: searchForm.specialtyField,
      });

      if (response.data) {
        tableData.value = response.data.records || [];
        pagination.total = response.data.total || 0;

        // 批量获取部门名称
        const deptIds = tableData.value
          .map((item) => item.workUnit)
          .filter((id) => id) as (string | number)[];
        if (deptIds.length > 0) {
          deptNameMap.value = await getDeptNamesByIds(deptIds);
        }
      }
    } catch (error: any) {
      Message.error(error?.message || '获取专家列表失败');
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
    searchForm.expertName = '';
    searchForm.specialtyField = undefined;
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

  // 新增专家
  const handleCreate = () => {
    emit('create');
  };

  // 查看详情
  const handleView = (record: EmergencyExpertVO) => {
    emit('view', record);
  };

  // 编辑专家
  const handleEdit = (record: EmergencyExpertVO) => {
    emit('create', record);
  };

  // 删除专家
  const handleDelete = (record: EmergencyExpertVO) => {
    Modal.confirm({
      title: '删除确认',
      content: `确认删除专家「${record.expertName}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        if (!record.id) return;
        try {
          await deleteEmergencyExpert([record.id]);
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
  .expert-list {
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

      :deep(.arco-table-container) {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
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
          background: transparent !important;

          // 自定义滚动条样式
          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-track {
            background: rgb(23 150 250 / 5%);
            border-radius: 3px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgb(23 150 250 / 30%);
            border-radius: 3px;
            transition: all 0.3s;

            &:hover {
              background: rgb(23 150 250 / 50%);
            }
          }
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
        min-height: 40px;
        margin-top: 12px;
        padding: 8px 20px;
        background: transparent;

        .arco-pagination-item,
        .arco-pagination-item-previous,
        .arco-pagination-item-next {
          margin: 0 4px;
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
