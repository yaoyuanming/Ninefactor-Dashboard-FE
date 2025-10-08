<template>
  <div class="supplies-list">
    <div class="list-header">
      <div class="header-title">应急物资列表</div>
      <a-button type="primary" @click="emit('create')"
        ><icon-plus />新增物资</a-button
      >
    </div>
    <div class="list-search">
      <a-space>
        <a-input
          v-model="keyword"
          placeholder="请输入物资名称"
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
          <a-table-column title="物资名称" data-index="name" />
          <a-table-column title="物资类型" data-index="type" />
          <a-table-column title="数量" data-index="quantity" />
          <a-table-column title="单位" data-index="unit" />
          <a-table-column title="存放位置" data-index="location" />
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
      name: '防护服',
      type: '防护用品',
      quantity: 100,
      unit: '套',
      location: '1号仓库',
    },
  ]);
</script>

<style scoped lang="less">
  .supplies-list {
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
