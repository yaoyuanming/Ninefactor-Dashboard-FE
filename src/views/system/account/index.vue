<template>
  <div class="account-management">
    <a-row :gutter="16" style="height: 100%">
      <!-- 左侧部门树 -->
      <a-col v-show="showDeptTree" :span="5">
        <a-card :bordered="false" style="height: 100%" title="部门列表">
          <template #extra>
            <a-button type="text" size="small" @click="showDeptTree = false">
              <icon-close />
            </a-button>
          </template>
          <DeptTree @nodeClick="handleDeptNodeClick" />
        </a-card>
      </a-col>

      <!-- 右侧内容区 -->
      <a-col :span="showDeptTree ? 19 : 24">
        <a-card>
          <template #title>
            <div style="display: flex; align-items: center">
              <a-button
                v-if="!showDeptTree"
                type="text"
                size="small"
                style="margin-right: 8px"
                @click="showDeptTree = true"
              >
                <icon-menu-unfold />
              </a-button>
              <span>账号管理</span>
              <span
                v-if="deptName !== '全部'"
                style="
                  margin-left: 12px;
                  color: #165dff;
                  font-weight: 600;
                  font-size: 18px;
                "
              >
                - {{ deptName }}
              </span>
            </div>
          </template>
          <!-- 搜索区域 -->
          <div class="search-area">
            <a-form :model="searchForm" layout="inline">
              <a-form-item field="userName" label="用户名">
                <a-input
                  v-model="searchForm.userName"
                  placeholder="请输入用户名"
                  allow-clear
                  @press-enter="handleSearch"
                />
              </a-form-item>
              <a-form-item field="phoneNumber" label="手机号">
                <a-input
                  v-model="searchForm.phoneNumber"
                  placeholder="请输入手机号"
                  allow-clear
                  @press-enter="handleSearch"
                />
              </a-form-item>
              <a-form-item field="status" label="状态">
                <a-select
                  v-model="searchForm.status"
                  placeholder="全部"
                  allow-clear
                  style="width: 120px"
                >
                  <a-option value="0">正常</a-option>
                  <a-option value="1">停用</a-option>
                </a-select>
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
                </a-space>
              </a-form-item>
            </a-form>
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
              <a-switch
                v-model="record.status"
                :checked-value="'0'"
                :unchecked-value="'1'"
                @change="handleStatusChange(record)"
              />
            </template>
            <template #operations="{ record }">
              <a-button type="text" size="small" @click="handleEdit(record)">
                编辑
              </a-button>
              <a-popconfirm
                content="确定删除该用户吗？"
                @ok="handleDelete(record)"
              >
                <a-button type="text" size="small" status="danger"
                  >删除</a-button
                >
              </a-popconfirm>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 新增/编辑弹窗 -->
    <AccountForm ref="formRef" @success="getList" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import * as AccountApi from '@/api/account';
  import AccountForm from './components/AccountForm.vue';
  import DeptTree from './components/DeptTree.vue';

  const formRef = ref<any>();
  const loading = ref(false);
  const tableData = ref<any[]>([]);
  const showDeptTree = ref(true);
  const deptName = ref('全部');

  // 搜索表单
  const searchForm = reactive({
    userName: '',
    phoneNumber: '',
    status: undefined,
    deptId: undefined as number | undefined,
  });

  // 分页参数
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  const columns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      width: 120,
    },
    {
      title: '登录账号',
      dataIndex: 'userName',
      width: 120,
    },
    {
      title: '手机号码',
      dataIndex: 'phoneNumber',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 100,
      align: 'center',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '操作',
      slotName: 'operations',
      width: 150,
      align: 'center',
    },
  ];

  // 获取列表数据
  const getList = async () => {
    loading.value = true;
    try {
      const params = {
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
        ...searchForm,
      };
      const response = await AccountApi.getUserPage(params);
      // 检查响应格式
      if (response && response.success && response.data) {
        tableData.value = response.data.list || response.data.records || [];
        pagination.total = response.data.total || 0;
      } else if (response && response.data) {
        // 兼容直接返回数据的情况
        tableData.value = response.data.list || [];
        pagination.total = response.data.total || 0;
      }
    } catch (error) {
      // console.error('获取用户列表失败:', error);
      Message.error('获取用户列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.current = 1;
    getList();
  };

  // 处理部门节点点击
  const handleDeptNodeClick = (node: any) => {
    searchForm.deptId = node.deptId;
    deptName.value = node.deptName || '全部';
    handleSearch();
  };

  // 重置
  const handleReset = () => {
    searchForm.userName = '';
    searchForm.phoneNumber = '';
    searchForm.status = undefined;
    searchForm.deptId = undefined;
    deptName.value = '全部';
    handleSearch();
  };

  // 新增
  const handleAdd = () => {
    formRef.value?.open('create');
  };

  // 编辑
  const handleEdit = (record: any) => {
    formRef.value?.open('update', record.id);
  };

  // 删除
  const handleDelete = async (record: any) => {
    try {
      await AccountApi.deleteUser(record.id);
      Message.success('删除成功');
      await getList();
    } catch (error) {
      // console.error('删除失败:', error);
      Message.error('删除失败');
    }
  };

  // 状态切换
  const handleStatusChange = async (record: any) => {
    try {
      const status = record.status === '0' ? 0 : 1;
      await AccountApi.updateUserStatus(record.id, status);
      Message.success('状态更新成功');
    } catch (error) {
      // console.error('状态更新失败:', error);
      Message.error('状态更新失败');
      // 恢复原状态
      record.status = record.status === '0' ? '1' : '0';
    }
  };

  // 分页变化
  const handlePageChange = (page: number) => {
    pagination.current = page;
    getList();
  };

  // 初始化
  onMounted(() => {
    getList();
  });
</script>

<style scoped lang="less">
  .account-management {
    height: 100%;

    .search-area {
      margin-bottom: 16px;
    }

    :deep(.arco-card) {
      display: flex;
      flex-direction: column;
      height: 100%;

      .arco-card-body {
        flex: 1;
        overflow: auto;
      }
    }
  }
</style>
