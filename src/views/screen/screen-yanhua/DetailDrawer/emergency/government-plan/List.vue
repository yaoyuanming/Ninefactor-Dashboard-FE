<template>
  <div class="government-plan-list">
    <div class="list-header">
      <div class="header-title">政府应急预案列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />
        新增预案
      </a-button>
    </div>

    <div class="list-search">
      <a-space>
        <a-input
          v-model="searchForm.keyword"
          placeholder="请输入姓名"
          style="width: 200px"
        />
        <a-input
          v-model="searchForm.unit"
          placeholder="请输入单位"
          style="width: 200px"
        />
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
        :data="tableData"
        :pagination="pagination"
        :loading="loading"
        @page-change="handlePageChange"
      >
        <template #columns>
          <a-table-column title="序号" :width="80">
            <template #cell="{ rowIndex }">
              {{
                rowIndex + 1 + (pagination.current - 1) * pagination.pageSize
              }}
            </template>
          </a-table-column>
          <a-table-column title="姓名" data-index="name" />
          <a-table-column title="单位" data-index="unit" />
          <a-table-column title="职务" data-index="position" />
          <a-table-column title="联系电话" data-index="phone" />
          <a-table-column title="创建时间" data-index="createTime" />
          <a-table-column title="操作" :width="200">
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
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';

  const emit = defineEmits<{
    (e: 'view', data: any): void;
    (e: 'create', data?: any): void;
  }>();

  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    unit: '',
  });

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 表格数据
  const tableData = ref<any[]>([]);
  const loading = ref(false);

  // 获取数据
  const fetchData = async () => {
    loading.value = true;
    try {
      // TODO: 调用接口获取数据
      // const res = await getEmergencyCommitteeList({
      //   ...searchForm,
      //   page: pagination.current,
      //   pageSize: pagination.pageSize,
      // });
      // tableData.value = res.data.list;
      // pagination.total = res.data.total;

      // 模拟数据
      tableData.value = [
        {
          id: 1,
          name: '张三',
          unit: '应急管理局',
          position: '局长',
          phone: '13800138000',
          createTime: '2025-10-01 10:00:00',
        },
        {
          id: 2,
          name: '李四',
          unit: '消防大队',
          position: '队长',
          phone: '13800138001',
          createTime: '2025-10-02 11:00:00',
        },
      ];
      pagination.total = 2;
    } catch (error) {
      Message.error('获取数据失败');
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
    searchForm.keyword = '';
    searchForm.unit = '';
    pagination.current = 1;
    fetchData();
  };

  // 分页切换
  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchData();
  };

  // 查看详情
  const handleView = (record: any) => {
    emit('view', record);
  };

  // 新增
  const handleCreate = () => {
    emit('create');
  };

  // 编辑
  const handleEdit = (record: any) => {
    emit('create', record);
  };

  // 删除
  const handleDelete = (record: any) => {
    // TODO: 调用删除接口
    Message.success(`删除预案：${record.name}`);
    fetchData();
  };

  // 初始化数据
  fetchData();
</script>

<style scoped lang="less">
  .government-plan-list {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .list-header {
      display: flex;
      align-items: center;
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

    .list-table {
      flex: 1;
      min-height: 0;
      overflow: hidden;

      :deep(.arco-table) {
        height: 100%;
        background: transparent;

        .arco-table-container {
          height: 100%;
        }

        .arco-table-th {
          color: rgb(255 255 255 / 85%);
          background: rgb(23 150 250 / 10%);
        }

        .arco-table-td {
          color: rgb(255 255 255 / 70%);
          background: transparent;
          border-color: rgb(23 150 250 / 10%);
        }

        .arco-table-tr:hover .arco-table-td {
          background: rgb(23 150 250 / 5%);
        }
      }
    }
  }
</style>
