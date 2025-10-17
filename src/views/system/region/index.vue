<template>
  <div class="region-management">
    <a-card title="区域管理">
      <!-- 操作按钮区域 -->
      <div class="action-area">
        <a-button type="primary" @click="handleAdd">
          <template #icon>
            <icon-plus />
          </template>
          新增
        </a-button>
      </div>

      <!-- 表格区域 -->
      <a-table
        :columns="columns"
        :data="regionData"
        :loading="loading"
        :pagination="false"
        :scroll="{ y: 600 }"
        row-key="regionCode"
        :default-expand-all-rows="false"
      >
        <template #status="{ record }">
          <a-tag v-if="record.status === 1" color="green">启用</a-tag>
          <a-tag v-else-if="record.status === 0" color="red">停用</a-tag>
          <span v-else>{{ record.status || '' }}</span>
        </template>
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleEdit(record)">
            编辑
          </a-button>
          <a-popconfirm content="确定删除该区域吗？" @ok="handleDelete(record)">
            <a-button type="text" size="small" status="danger">删除</a-button>
          </a-popconfirm>
        </template>
      </a-table>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <RegionForm ref="formRef" @success="loadRegionTreeData" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import * as RegionApi from '@/api/region';
  import RegionForm from './components/RegionForm.vue';

  const formRef = ref<any>();
  const loading = ref(false);
  const regionData = ref<any[]>([]);

  const columns = [
    {
      title: '区域名称',
      dataIndex: 'regionName',
      width: 200,
    },
    {
      title: '区域编码',
      dataIndex: 'regionCode',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 100,
    },
    {
      title: '排序',
      dataIndex: 'orderNum',
      width: 80,
      align: 'center',
    },
    {
      title: '操作',
      slotName: 'operations',
      width: 150,
      align: 'center',
    },
  ];

  // 加载区域树数据
  const loadRegionTreeData = async () => {
    loading.value = true;
    try {
      const response = await RegionApi.getRegionTreeList();
      if (response.data) {
        regionData.value = response.data;
      } else {
        regionData.value = [];
      }
    } catch (error) {
      console.error('加载区域数据失败:', error);
      Message.error('加载区域数据失败');
      regionData.value = [];
    } finally {
      loading.value = false;
    }
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
      await RegionApi.deleteRegion(record.id);
      Message.success('删除成功');
      await loadRegionTreeData();
    } catch (error) {
      console.error('删除失败:', error);
      Message.error('删除失败');
    }
  };

  // 初始化
  onMounted(() => {
    loadRegionTreeData();
  });
</script>

<style scoped lang="less">
  .region-management {
    .action-area {
      margin-bottom: 16px;
    }
  }
</style>
