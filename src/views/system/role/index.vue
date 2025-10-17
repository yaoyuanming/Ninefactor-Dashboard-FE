<template>
  <div class="role-management">
    <a-card title="角色管理">
      <!-- 搜索区域 -->
      <a-form :model="searchForm" layout="inline" class="search-form">
        <a-form-item label="角色名称">
          <a-input
            v-model="searchForm.roleName"
            placeholder="请输入角色名称"
            allow-clear
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="角色标识">
          <a-input
            v-model="searchForm.roleKey"
            placeholder="请输入角色标识"
            allow-clear
            @press-enter="handleSearch"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            allow-clear
            style="width: 160px"
          >
            <a-option value="0">正常</a-option>
            <a-option value="1">停用</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="创建时间">
          <a-range-picker
            v-model="searchForm.createTime"
            style="width: 240px"
            format="YYYY-MM-DD"
            @change="handleDateRangeChange"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <icon-search />
              </template>
              搜索
            </a-button>
            <a-button @click="handleReset">
              <template #icon>
                <icon-refresh />
              </template>
              重置
            </a-button>
            <a-button type="primary" @click="handleAdd">
              <template #icon>
                <icon-plus />
              </template>
              新增
            </a-button>
            <!-- <a-button type="outline" @click="handleExport">
              <template #icon>
                <icon-upload />
              </template>
              导出
            </a-button> -->
          </a-space>
        </a-form-item>
      </a-form>

      <!-- 表格区域 -->
      <a-table
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
      >
        <template #roleSort="{ record }">
          <span>{{ record.roleSort }}</span>
        </template>
        <template #status="{ record }">
          <a-switch
            v-model="record.status"
            :checked-value="'0'"
            :unchecked-value="'1'"
            @change="handleStatusChange(record)"
          >
            <template #checked>正常</template>
            <template #unchecked>停用</template>
          </a-switch>
        </template>
        <template #createTime="{ record }">
          <span>{{ formatDate(record.createTime) }}</span>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="handleView(record)">
              查看
            </a-button>
            <a-button type="text" size="small" @click="handleEdit(record)">
              编辑
            </a-button>
            <!-- <a-button
              type="text"
              size="small"
              @click="handlePermission(record)"
            >
              菜单权限
            </a-button> -->
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
    <!-- <RolePermission
      v-model:visible="permissionVisible"
      :data="currentData"
      @success="handlePermissionSuccess"
    /> -->
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import dayjs from 'dayjs';
  import {
    getRoleList,
    deleteRole,
    changeRoleStatus,
    type RoleListReqVO,
    type RoleReqDTO,
    type RoleVO,
  } from '@/api/system/role';
  import RoleForm from './components/RoleForm.vue';
  import RoleDetail from './components/RoleDetail.vue';
  // import RolePermission from './components/RolePermission.vue';

  // 搜索表单
  const searchForm = reactive<RoleListReqVO>({
    roleName: '',
    roleKey: '',
    status: undefined,
    params_beginTime: undefined,
    params_endTime: undefined,
    pageNum: 1,
    pageSize: 10,
  });

  // 表格相关
  const loading = ref(false);
  const tableData = ref<RoleVO[]>([]);
  const total = ref(0);

  const columns = [
    { title: '角色编号', dataIndex: 'id', width: 100 },
    { title: '角色名称', dataIndex: 'roleName', width: 150 },
    { title: '角色标识', dataIndex: 'roleKey', width: 150 },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      slotName: 'roleSort',
      width: 100,
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true, width: 200 },
    { title: '状态', dataIndex: 'status', slotName: 'status', width: 100 },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      slotName: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      slotName: 'action',
      width: 180,
      align: 'center',
      fixed: 'right',
    },
  ];

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
    pageSizeOptions: [10, 20, 30, 50],
  });

  // 弹窗相关
  const formVisible = ref(false);
  const formMode = ref<'add' | 'edit'>('add');
  const detailVisible = ref(false);
  // const permissionVisible = ref(false);
  const currentData = ref<any>({});
  // const exportLoading = ref(false);

  // 格式化日期
  const formatDate = (date: any) => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  // 处理日期范围变化
  const handleDateRangeChange = (value: any) => {
    if (value && value.length === 2) {
      searchForm.params_beginTime = `${dayjs(value[0]).format(
        'YYYY-MM-DD'
      )} 00:00:00`;
      searchForm.params_endTime = `${dayjs(value[1]).format(
        'YYYY-MM-DD'
      )} 23:59:59`;
    } else {
      searchForm.params_beginTime = undefined;
      searchForm.params_endTime = undefined;
    }
  };

  // 获取角色列表
  const getList = async () => {
    loading.value = true;
    try {
      const params = {
        ...searchForm,
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
      };
      const res = await getRoleList(params);
      tableData.value = res.data.records || [];
      total.value = res.data.total || 0;
      pagination.total = total.value;
    } catch (error) {
      // console.error(error);
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    getList();
  };

  // 重置
  const handleReset = () => {
    searchForm.roleName = '';
    searchForm.roleKey = '';
    searchForm.status = undefined;
    searchForm.params_beginTime = undefined;
    searchForm.params_endTime = undefined;
    // searchForm.createTime = undefined;
    pagination.current = 1;
    getList();
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
  // const handlePermission = (record: any) => {
  //   currentData.value = record;
  //   permissionVisible.value = true;
  // };

  // 删除
  const handleDelete = async (record: any) => {
    try {
      await deleteRole([record.id]);
      Message.success('删除成功');
      getList();
    } catch (error) {
      // console.error(error);
    }
  };

  // 状态变更
  const handleStatusChange = async (record: any) => {
    try {
      const data: RoleReqDTO = {
        id: record.id,
        roleName: record.roleName,
        roleKey: record.roleKey,
        status: record.status,
      };
      await changeRoleStatus(data);
      Message.success('状态修改成功');
    } catch (error) {
      // 恢复原状态
      record.status = record.status === '0' ? '1' : '0';
      // console.error(error);
    }
  };

  // 分页
  const handlePageChange = (page: number) => {
    pagination.current = page;
    getList();
  };

  // 分页大小变化
  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    getList();
  };

  // 导出
  // const handleExport = async () => {
  //   Message.info('导出功能待实现');
  // };

  // 表单成功
  const handleFormSuccess = () => {
    formVisible.value = false;
    getList();
  };

  // 权限配置成功
  // const handlePermissionSuccess = () => {
  //   permissionVisible.value = false;
  // };

  // 初始化
  onMounted(() => {
    getList();
  });
</script>

<style scoped lang="less">
  .role-management {
    .search-form {
      margin-bottom: 16px;
    }
  }
</style>
