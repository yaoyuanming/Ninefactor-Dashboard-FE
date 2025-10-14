<template>
  <div class="role-management">
    <a-card title="角色管理">
      <!-- 搜索区域 -->
      <div class="search-area">
        <a-space>
          <a-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            allow-clear
          />
          <a-button type="primary" @click="handleSearch">
            <template #icon>
              <icon-search />
            </template>
            搜索
          </a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleAdd">
            <template #icon>
              <icon-plus />
            </template>
            新增角色
          </a-button>
        </a-space>
      </div>

      <!-- 表格区域 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
      >
        <template #status="{ record }">
          <a-tag v-if="record.status === 1" color="green">启用</a-tag>
          <a-tag v-else color="red">禁用</a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleView(record)"
              >查看</a-button
            >
            <a-button type="text" size="small" @click="handleEdit(record)"
              >编辑</a-button
            >
            <a-button type="text" size="small" @click="handlePermission(record)"
              >权限配置</a-button
            >
            <a-popconfirm
              content="确定删除该角色吗？"
              @ok="handleDelete(record)"
            >
              <a-button type="text" size="small" status="danger">删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <RoleForm
      v-model:visible="formVisible"
      :mode="formMode"
      :data="currentData"
      @success="handleFormSuccess"
    />

    <!-- 详情弹窗 -->
    <RoleDetail v-model:visible="detailVisible" :data="currentData" />

    <!-- 权限配置弹窗 -->
    <RolePermission
      v-model:visible="permissionVisible"
      :data="currentData"
      @success="handlePermissionSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import RoleForm from './components/RoleForm.vue';
  import RoleDetail from './components/RoleDetail.vue';
  import RolePermission from './components/RolePermission.vue';

  // 搜索表单
  const searchForm = reactive({
    name: '',
  });

  // 表格相关
  const loading = ref(false);
  const tableData = ref([
    {
      id: 1,
      name: '超级管理员',
      code: 'admin',
      description: '系统超级管理员，拥有所有权限',
      userCount: 1,
      status: 1,
      createTime: '2024-01-01',
    },
    {
      id: 2,
      name: '开发人员',
      code: 'developer',
      description: '系统开发人员角色',
      userCount: 5,
      status: 1,
      createTime: '2024-01-02',
    },
    {
      id: 3,
      name: '市场专员',
      code: 'marketing',
      description: '市场部门专员角色',
      userCount: 3,
      status: 1,
      createTime: '2024-01-03',
    },
    {
      id: 4,
      name: '财务主管',
      code: 'finance',
      description: '财务部门主管角色',
      userCount: 2,
      status: 0,
      createTime: '2024-01-04',
    },
  ]);

  const columns = [
    { title: '角色名称', dataIndex: 'name' },
    { title: '角色编码', dataIndex: 'code' },
    { title: '描述', dataIndex: 'description' },
    { title: '用户数', dataIndex: 'userCount' },
    { title: '状态', dataIndex: 'status', slotName: 'status' },
    { title: '创建时间', dataIndex: 'createTime' },
    { title: '操作', slotName: 'action', width: 280, align: 'center' },
  ];

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 4,
  });

  // 弹窗相关
  const formVisible = ref(false);
  const formMode = ref<'add' | 'edit'>('add');
  const detailVisible = ref(false);
  const permissionVisible = ref(false);
  const currentData = ref({});

  // 搜索
  const handleSearch = () => {
    Message.info('搜索功能待实现');
  };

  // 重置
  const handleReset = () => {
    searchForm.name = '';
  };

  // 新增
  const handleAdd = () => {
    formMode.value = 'add';
    currentData.value = {};
    formVisible.value = true;
  };

  // 查看
  const handleView = (record: any) => {
    currentData.value = record;
    detailVisible.value = true;
  };

  // 编辑
  const handleEdit = (record: any) => {
    formMode.value = 'edit';
    currentData.value = record;
    formVisible.value = true;
  };

  // 权限配置
  const handlePermission = (record: any) => {
    currentData.value = record;
    permissionVisible.value = true;
  };

  // 删除
  const handleDelete = (record: any) => {
    Message.success('删除成功');
  };

  // 分页
  const handlePageChange = (page: number) => {
    pagination.current = page;
  };

  // 表单成功
  const handleFormSuccess = () => {
    Message.success('操作成功');
    formVisible.value = false;
  };

  // 权限配置成功
  const handlePermissionSuccess = () => {
    Message.success('权限配置成功');
    permissionVisible.value = false;
  };
</script>

<style scoped lang="less">
  .role-management {
    .search-area {
      margin-bottom: 16px;
    }
  }
</style>
