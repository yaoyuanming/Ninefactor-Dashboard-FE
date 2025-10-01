<template>
  <div class="content-section">
    <div class="section-header">
      <h3 class="section-title">巡查统计</h3>
      <div class="section-actions">
        <a-button type="primary" size="small">
          <template #icon>
            <icon-plus />
          </template>
          新建巡查任务
        </a-button>
      </div>
    </div>

    <!-- 巡查统计表格 -->
    <div class="table-wrapper">
      <a-table
        :columns="patrolColumns"
        :data="patrolData"
        :pagination="false"
        :stripe="false"
        :bordered="false"
      >
        <template #action>
          <a-button type="text" size="small">查看</a-button>
          <a-button type="text" size="small">删除</a-button>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { IconPlus } from '@arco-design/web-vue/es/icon';

  // 巡查统计表格列配置
  const patrolColumns = [
    { title: '任务名称', dataIndex: 'taskName', width: 200 },
    { title: '巡查人员', dataIndex: 'patrolUser', width: 120 },
    { title: '巡查时间', dataIndex: 'patrolTime', width: 180 },
    {
      title: '操作',
      slotName: 'action',
      width: 150,
      align: 'center',
    },
  ];

  // 巡查统计表格数据
  const patrolData = reactive([]);
</script>

<style scoped lang="less">
  .content-section {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 20px;
    overflow: auto;

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid rgb(23 150 250 / 20%);

      .section-title {
        margin: 0;
        color: rgb(255 255 255 / 95%);
        font-weight: 600;
        font-size: 18px;
      }

      .section-actions {
        :deep(.arco-btn-primary) {
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }
      }
    }

    .table-wrapper {
      flex: 1;
      padding: 16px;
      background: rgb(0 0 0 / 20%);
      border: 1px solid rgb(23 150 250 / 15%);
      border-radius: 4px;

      :deep(.arco-table) {
        color: rgb(255 255 255 / 85%);
        background: transparent;

        .arco-table-th {
          color: rgb(255 255 255 / 95%);
          background: rgb(23 150 250 / 10%);
          border-bottom-color: rgb(23 150 250 / 30%);
        }

        .arco-table-td {
          background: transparent;
          border-bottom-color: rgb(255 255 255 / 5%);
        }

        .arco-table-tr:hover .arco-table-td {
          background: rgb(23 150 250 / 10%);
        }

        .arco-btn-text {
          color: #1796fa;

          &:hover {
            background: rgb(23 150 250 / 10%);
          }
        }
      }
    }
  }
</style>
