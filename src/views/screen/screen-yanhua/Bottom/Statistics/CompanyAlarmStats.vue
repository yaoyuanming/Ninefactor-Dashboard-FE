<template>
  <div class="content-section">
    <div class="section-header">
      <h3 class="section-title">企业报警统计</h3>
      <div class="section-filters">
        <a-input
          v-model="companyForm.enterpriseName"
          placeholder="请输入企业名称"
          allow-clear
          style="width: 200px"
        />
        <a-radio-group
          v-model="companyForm.type"
          type="button"
          size="small"
          style="margin-left: 12px"
        >
          <a-radio value="month">月份</a-radio>
          <a-radio value="year">年份</a-radio>
        </a-radio-group>
        <a-month-picker
          v-if="companyForm.type === 'month'"
          v-model="companyForm.date"
          style="width: 150px; margin-left: 12px"
        />
        <a-select
          v-else
          v-model="companyForm.year"
          placeholder="选择年份"
          style="width: 150px; margin-left: 12px"
        >
          <a-option value="2023">2023</a-option>
          <a-option value="2024">2024</a-option>
          <a-option value="2025">2025</a-option>
        </a-select>
        <a-button type="primary" size="small" style="margin-left: 12px"
          >查询</a-button
        >
        <a-button size="small" style="margin-left: 12px">重置</a-button>
        <a-button type="primary" size="small" style="margin-left: 12px"
          >导出</a-button
        >
      </div>
    </div>

    <!-- 企业报警表格 -->
    <div class="table-wrapper">
      <a-table
        :columns="companyColumns"
        :data="companyData"
        :pagination="false"
        :stripe="false"
        :bordered="false"
      >
        <!-- 表格内容占位 -->
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';

  // 企业报警筛选表单
  const companyForm = reactive({
    enterpriseName: '',
    type: 'month',
    date: '',
    year: '',
  });

  // 企业报警表格列配置
  const companyColumns = [
    { title: '企业名称', dataIndex: 'enterpriseName', width: 200 },
    { title: '报警次数', dataIndex: 'alarmCount', width: 120 },
    { title: '处理率', dataIndex: 'handleRate', width: 120 },
  ];

  // 企业报警表格数据
  const companyData = reactive([]);
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

      .section-filters {
        display: flex;
        align-items: center;

        :deep(.arco-input-wrapper) {
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          &.arco-input-focus {
            border-color: #1796fa;
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent;

            &::placeholder {
              color: rgb(255 255 255 / 35%);
            }
          }
        }

        :deep(.arco-radio-group) {
          .arco-radio-button {
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }
          }

          .arco-radio-checked {
            color: #fff;
            background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
            border-color: #1796fa;
          }
        }

        :deep(.arco-picker),
        :deep(.arco-select-view) {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%) !important;
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            border-color: rgb(23 150 250 / 50%);
          }

          input {
            color: rgb(255 255 255 / 85%);
            background: transparent !important;
          }
        }

        :deep(.arco-btn-primary) {
          background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
          border: none;
          box-shadow: 0 2px 8px rgb(23 150 250 / 30%);

          &:hover {
            background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            box-shadow: 0 4px 12px rgb(23 150 250 / 50%);
          }
        }

        :deep(.arco-btn:not(.arco-btn-primary)) {
          color: rgb(255 255 255 / 85%);
          background: rgb(0 0 0 / 30%);
          border-color: rgb(255 255 255 / 15%);

          &:hover {
            background: rgb(23 150 250 / 10%);
            border-color: rgb(23 150 250 / 50%);
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
      }
    }
  }
</style>
