<template>
  <div class="medical-institution-list">
    <div class="list-header">
      <div class="header-title">医疗机构列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />新增机构
      </a-button>
    </div>
    <div class="search-filter">
      <a-space size="medium">
        <a-input
          v-model="searchForm.institutionName"
          placeholder="请输入机构名称"
          style="width: 200px"
          @press-enter="handleSearch"
        />
        <a-select
          v-model="searchForm.institutionType"
          placeholder="请选择机构类型"
          style="width: 200px"
          :allow-clear="true"
        >
          <a-option :value="1">综合医院</a-option>
          <a-option :value="2">专科医院</a-option>
        </a-select>
        <a-button type="primary" @click="handleSearch">
          <icon-search />查询
        </a-button>
        <a-button @click="handleReset"> <icon-refresh />重置</a-button>
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
            title="机构名称"
            data-index="institutionName"
            :width="200"
          />

          <a-table-column title="机构等级" :width="100" align="center">
            <template #cell="{ record }">
              {{ getLevelText(record.institutionLevel) }}
            </template>
          </a-table-column>

          <a-table-column title="机构类型" :width="120" align="center">
            <template #cell="{ record }">
              {{ getTypeText(record.institutionType) }}
            </template>
          </a-table-column>

          <a-table-column
            title="所在区域"
            data-index="areaNames"
            :width="160"
          />

          <a-table-column
            title="详细地址"
            data-index="detailedAddress"
            :width="200"
          />

          <a-table-column
            title="急诊床位数"
            data-index="emergencyBeds"
            :width="120"
            align="center"
          >
            <template #cell="{ record }">
              {{ record.emergencyBeds ? `${record.emergencyBeds} 张` : '-' }}
            </template>
          </a-table-column>

          <a-table-column
            title="急诊电话"
            data-index="emergencyPhone"
            :width="140"
          />

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
    getMedicalInstitutionList,
    deleteMedicalInstitution,
    type MedicalInstitutionVO,
    type MedicalInstitutionListReqVO,
  } from '@/api/emergency';

  const emit = defineEmits<{
    (e: 'view', data: MedicalInstitutionVO): void;
    (e: 'create', data?: MedicalInstitutionVO): void;
  }>();

  // 搜索表单
  const searchForm = reactive<MedicalInstitutionListReqVO>({
    institutionName: '',
    institutionType: undefined,
  });

  // 表格数据
  const tableData = ref<MedicalInstitutionVO[]>([]);
  const loading = ref(false);

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showPageSize: true,
    showTotal: true,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // 获取等级文本
  const getLevelText = (level?: number) => {
    const levelMap: Record<number, string> = {
      1: '一级',
      2: '二级',
      3: '三级',
    };
    return level ? levelMap[level] || '-' : '-';
  };

  // 获取类型文本
  const getTypeText = (type?: number) => {
    const typeMap: Record<number, string> = {
      1: '综合医院',
      2: '专科医院',
    };
    return type ? typeMap[type] || '-' : '-';
  };

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true;
    try {
      const params: MedicalInstitutionListReqVO = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        ...searchForm,
      };

      const res: any = await getMedicalInstitutionList(params);
      if (res.data) {
        tableData.value = res.data.records || res.data.list || [];
        pagination.total = res.data.total || 0;
      }
    } catch (error: any) {
      console.error('获取医疗机构列表失败:', error);
      Message.error(error?.message || '获取列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    fetchList();
  };

  // 重置
  const handleReset = () => {
    searchForm.institutionName = '';
    searchForm.institutionType = undefined;
    pagination.current = 1;
    fetchList();
  };

  // 新增
  const handleCreate = () => {
    emit('create');
  };

  // 查看
  const handleView = (record: MedicalInstitutionVO) => {
    emit('view', record);
  };

  // 编辑
  const handleEdit = (record: MedicalInstitutionVO) => {
    emit('create', record);
  };

  // 删除
  const handleDelete = (record: MedicalInstitutionVO) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除「${record.institutionName}」吗？`,
      onOk: async () => {
        try {
          await deleteMedicalInstitution([record.id!]);
          Message.success('删除成功');
          fetchList();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        }
      },
    });
  };

  // 分页改变
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchList();
  };

  // 每页条数改变
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchList();
  };

  onMounted(() => {
    fetchList();
  });
</script>

<style scoped lang="less">
  .medical-institution-list {
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
