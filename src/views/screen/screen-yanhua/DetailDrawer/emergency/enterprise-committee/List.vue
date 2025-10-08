<template>
  <div class="enterprise-committee-list">
    <div class="list-header">
      <div class="header-title">企业委员会列表</div>
      <a-button type="primary" @click="handleCreate">
        <icon-plus />
        新增企业
      </a-button>
    </div>

    <div class="list-search">
      <a-space>
        <a-input
          v-model="searchForm.keyword"
          placeholder="请输入企业名称"
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
          <a-table-column title="企业名称" data-index="name" />
          <a-table-column title="负责人" data-index="principal" />
          <a-table-column title="联系电话" data-index="phone" />
          <a-table-column title="地址" data-index="address" />
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

  const searchForm = reactive({
    keyword: '',
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const tableData = ref<any[]>([]);
  const loading = ref(false);

  const fetchData = async () => {
    loading.value = true;
    try {
      // 模拟数据
      tableData.value = [
        {
          id: 1,
          name: '某某化工有限公司',
          principal: '王五',
          phone: '13900139000',
          address: '某某工业园区',
          createTime: '2025-10-01 10:00:00',
        },
      ];
      pagination.total = 1;
    } catch (error) {
      Message.error('获取数据失败');
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.current = 1;
    fetchData();
  };

  const handleReset = () => {
    searchForm.keyword = '';
    pagination.current = 1;
    fetchData();
  };

  const handlePageChange = (page: number) => {
    pagination.current = page;
    fetchData();
  };

  const handleView = (record: any) => {
    emit('view', record);
  };

  const handleCreate = () => {
    emit('create');
  };

  const handleEdit = (record: any) => {
    emit('create', record);
  };

  const handleDelete = (record: any) => {
    Message.success(`删除企业：${record.name}`);
    fetchData();
  };

  fetchData();
</script>

<style scoped lang="less">
  .enterprise-committee-list {
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
