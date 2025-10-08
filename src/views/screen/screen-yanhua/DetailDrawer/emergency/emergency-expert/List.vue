<template>
  <div class="expert-list">
    <div class="list-header">
      <div class="header-title">应急专家列表</div>
      <a-button type="primary" @click="emit('create')">
        <icon-plus />
        新增专家
      </a-button>
    </div>
    <div class="list-search">
      <a-space>
        <a-input
          v-model="keyword"
          placeholder="请输入专家姓名"
          style="width: 200px"
        />
        <a-button type="primary"><icon-search />查询</a-button>
        <a-button><icon-refresh />重置</a-button>
      </a-space>
    </div>
    <div class="list-table">
      <a-table :data="data" :pagination="{ pageSize: 10 }">
        <template #columns>
          <a-table-column title="序号" :width="80">
            <template #cell="{ rowIndex }">{{ rowIndex + 1 }}</template>
          </a-table-column>
          <a-table-column title="姓名" data-index="name" />
          <a-table-column title="专业领域" data-index="field" />
          <a-table-column title="职称" data-index="title" />
          <a-table-column title="联系电话" data-index="phone" />
          <a-table-column title="操作" :width="200">
            <template #cell="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="emit('view', record)"
                  >查看</a-button
                >
                <a-button
                  type="text"
                  size="small"
                  @click="emit('create', record)"
                  >编辑</a-button
                >
                <a-button type="text" status="danger" size="small"
                  >删除</a-button
                >
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  const emit = defineEmits<{
    (e: 'view', data: any): void;
    (e: 'create', data?: any): void;
  }>();

  const keyword = ref('');
  const data = ref([
    {
      id: 1,
      name: '赵专家',
      field: '化工安全',
      title: '高级工程师',
      phone: '13800138000',
    },
  ]);
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
      }
    }
  }
</style>
