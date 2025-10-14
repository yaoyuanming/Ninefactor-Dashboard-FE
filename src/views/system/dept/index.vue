<template>
  <div class="dept-management">
    <a-card title="部门机构管理">
      <!-- 搜索区域 -->
      <div class="search-area">
        <a-form :model="queryParams" layout="inline">
          <a-form-item label="部门名称">
            <a-input
              v-model="queryParams.deptName"
              placeholder="请输入部门名称"
              allow-clear
              style="width: 240px"
              @press-enter="handleQuery"
            />
          </a-form-item>
          <a-form-item>
            <a-space>
              <a-button type="primary" @click="handleQuery">
                <template #icon>
                  <icon-search />
                </template>
                搜索
              </a-button>
              <a-button @click="resetQuery">
                <template #icon>
                  <icon-refresh />
                </template>
                重置
              </a-button>
              <a-button
                type="primary"
                status="success"
                @click="openForm('create')"
              >
                <template #icon>
                  <icon-plus />
                </template>
                新增
              </a-button>
              <a-button @click="toggleExpandAll">
                <template #icon>
                  <icon-menu-fold v-if="isExpandAll" />
                  <icon-menu-unfold v-else />
                </template>
                {{ isExpandAll ? '折叠' : '展开' }}
              </a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </div>

      <!-- 表格区域 -->
      <a-table
        v-if="refreshTable"
        v-loading="loading"
        :columns="columns"
        :data="list"
        :pagination="false"
        row-key="deptId"
        :default-expand-all-rows="isExpandAll"
      >
        <template #action="{ record }">
          <a-space>
            <a-button
              type="text"
              size="small"
              @click="openForm('update', record.deptId)"
            >
              修改
            </a-button>
            <a-popconfirm
              content="确定删除该部门吗？"
              @ok="handleDelete(record.deptId)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <DeptForm ref="formRef" @success="getList" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import * as DeptApi from '@/api/system/dept';
  import DeptForm from './components/DeptForm.vue';

  const loading = ref(false);
  const list = ref<any[]>([]);
  const queryParams = reactive({
    deptName: undefined,
    status: undefined,
  });
  const isExpandAll = ref(true);
  const refreshTable = ref(true);

  // 表格列配置
  const columns = [
    { title: '部门名称', dataIndex: 'deptName', width: 300 },
    { title: '部门编号', dataIndex: 'deptId', width: 150, align: 'center' },
    { title: '操作', slotName: 'action', width: 150, align: 'center' },
  ];

  // 查询部门列表
  const getList = async () => {
    loading.value = true;
    try {
      const response = await DeptApi.getDeptTreeList(queryParams);
      // 处理API响应数据
      if (response.data) {
        list.value = response.data;
      } else {
        list.value = [];
      }
    } catch (error) {
      // 获取部门列表失败
      list.value = [];
    } finally {
      loading.value = false;
    }
  };

  // 展开/折叠操作
  const toggleExpandAll = () => {
    refreshTable.value = false;
    isExpandAll.value = !isExpandAll.value;
    nextTick(() => {
      refreshTable.value = true;
    });
  };

  // 搜索按钮操作
  const handleQuery = () => {
    getList();
  };

  // 重置按钮操作
  const resetQuery = () => {
    queryParams.pageNo = 1;
    queryParams.deptName = undefined;
    queryParams.status = undefined;
    handleQuery();
  };

  // 添加/修改操作
  const formRef = ref();
  const openForm = (type: string, id?: number) => {
    formRef.value.open(type, id);
  };

  // 删除按钮操作
  const handleDelete = async (id: number) => {
    try {
      await Message.warning('确定要删除该部门吗？');
      await DeptApi.deleteDept(id);
      Message.success('删除成功');
      await getList();
    } catch {
      // 用户取消或删除失败
    }
  };

  // 初始化
  onMounted(async () => {
    await getList();
  });
</script>

<style scoped lang="less">
  .dept-management {
    .search-area {
      margin-bottom: 16px;
    }
  }
</style>
