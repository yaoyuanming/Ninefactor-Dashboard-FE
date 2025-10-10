<template>
  <div class="rescue-force-list">
    <div class="list-header">
      <div class="header-title">救援力量列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />新增队伍
      </a-button>
    </div>
    <div class="list-search">
      <a-space>
        <a-input
          v-model="searchForm.teamName"
          placeholder="请输入队伍名称"
          style="width: 200px"
          @press-enter="handleSearch"
        />
        <RegionSelect
          v-model="searchForm.areaCodes"
          placeholder="请选择区域"
          width="200px"
          :clearable="true"
        />
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

          <a-table-column title="队伍名称" data-index="teamName" :width="180" />

          <a-table-column
            title="主管单位"
            data-index="supervisingUnit"
            :width="200"
          />

          <a-table-column
            title="人员数量"
            data-index="teamSize"
            :width="100"
            align="center"
          />

          <a-table-column title="负责人" data-index="teamLeader" :width="120" />

          <a-table-column
            title="联系电话"
            data-index="contactPhone"
            :width="140"
          />

          <a-table-column
            title="所在区域"
            data-index="areaNames"
            :width="160"
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
  import RegionSelect from '@/views/screen/screen-yanhua/components/RegionSelect/index.vue';
  import {
    getRescueTeamList,
    deleteRescueTeam,
    type RescueTeamVO,
    type RescueTeamListReqVO,
  } from '@/api/emergency';

  const emit = defineEmits<{
    (e: 'view', data: RescueTeamVO): void;
    (e: 'create', data?: RescueTeamVO): void;
  }>();

  // 搜索表单
  const searchForm = reactive<RescueTeamListReqVO>({
    teamName: '',
    areaCodes: '',
  });

  // 表格数据
  const tableData = ref<RescueTeamVO[]>([]);
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

  // 获取列表数据
  const fetchList = async () => {
    loading.value = true;
    try {
      const params: RescueTeamListReqVO = {
        ...searchForm,
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      };
      const res = await getRescueTeamList(params);
      if (res.data) {
        tableData.value = res.data.records || [];
        pagination.total = res.data.total || 0;
      }
    } catch (error) {
      // console.error('获取救援力量列表失败:', error);
      Message.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  // 查询
  const handleSearch = () => {
    pagination.current = 1;
    fetchList();
  };

  // 重置
  const handleReset = () => {
    searchForm.teamName = '';
    searchForm.areaCodes = '';
    handleSearch();
  };

  // 新增
  const handleCreate = () => {
    emit('create');
  };

  // 查看
  const handleView = (record: RescueTeamVO) => {
    emit('view', record);
  };

  // 编辑
  const handleEdit = (record: RescueTeamVO) => {
    emit('create', record);
  };

  // 删除
  const handleDelete = (record: RescueTeamVO) => {
    Modal.confirm({
      title: '删除确认',
      content: `确认删除救援力量「${record.teamName}」吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        if (!record.id) return;
        try {
          await deleteRescueTeam([record.id]);
          Message.success('删除成功');
          fetchList();
        } catch (error: any) {
          Message.error(error?.message || '删除失败');
        }
      },
    });
  };

  // 页码变化
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchList();
  };

  // 每页数量变化
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchList();
  };

  // 初始化
  onMounted(() => {
    fetchList();
  });
</script>

<style scoped lang="less">
  .rescue-force-list {
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

    .list-search {
      margin-bottom: 20px;
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
