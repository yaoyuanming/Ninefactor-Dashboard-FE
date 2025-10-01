<template>
  <div class="statistics-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">统计分析</h2>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <a-form :model="filterForm" layout="inline" class="filter-form">
        <a-form-item>
          <a-radio-group v-model="filterForm.type" type="button">
            <a-radio value="day">按日</a-radio>
            <a-radio value="month">按月</a-radio>
            <a-radio value="year">按年</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item>
          <a-range-picker v-model="filterForm.timeRange" style="width: 300px" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="handleSearch">查询</a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-label">企业总数</div>
        <div class="stat-value">1,234</div>
        <div class="stat-trend up">+12% 环比上月</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">风险预警</div>
        <div class="stat-value">56</div>
        <div class="stat-trend down">-8% 环比上月</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">已处理事件</div>
        <div class="stat-value">432</div>
        <div class="stat-trend up">+15% 环比上月</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">待处理事件</div>
        <div class="stat-value">23</div>
        <div class="stat-trend down">-5% 环比上月</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 第一行图表 -->
      <div class="chart-row">
        <div class="chart-item">
          <div class="chart-title">风险等级分布趋势</div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <!-- 折线图占位 -->
              <div class="placeholder-text">风险等级趋势图表</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行图表 -->
      <div class="chart-row">
        <div class="chart-item half">
          <div class="chart-title">各企业风险状况</div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="placeholder-text">柱状图表</div>
            </div>
          </div>
        </div>
        <div class="chart-item half">
          <div class="chart-title">风险类型分布</div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="placeholder-text">饼图表</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';

  const filterForm = reactive({
    type: 'day',
    timeRange: [],
  });

  const handleSearch = () => {
    console.log('查询统计数据:', filterForm);
    // TODO: 调用API接口，加载图表数据
  };
</script>

<style scoped lang="less">
  .statistics-page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    overflow: hidden;

    .page-header {
      display: none;
    }

    .filter-section {
      flex-shrink: 0;
      margin-bottom: 15px;
      padding: 12px 15px;
      background: rgb(255 255 255 / 2%);
      border-radius: 2px;

      .filter-form {
        :deep(.arco-form-item) {
          margin-bottom: 0;
        }

        :deep(.arco-radio-button) {
          color: #fff;
          background: rgb(255 255 255 / 10%);
          border-color: rgb(255 255 255 / 20%);

          &:hover {
            background: rgb(255 255 255 / 15%);
          }
        }

        :deep(.arco-radio-button-checked) {
          background: #1796fa;
          border-color: #1796fa;
        }
      }
    }

    .stats-cards {
      display: flex;
      flex-shrink: 0;
      gap: 15px;
      margin-bottom: 15px;

      .stat-card {
        flex: 1;
        padding: 15px 20px;
        background: linear-gradient(
          135deg,
          rgb(23 150 250 / 15%),
          rgb(23 150 250 / 3%)
        );
        border: 1px solid rgb(23 150 250 / 20%);
        border-radius: 4px;

        .stat-label {
          margin-bottom: 10px;
          color: rgb(255 255 255 / 70%);
          font-size: 14px;
        }

        .stat-value {
          margin-bottom: 8px;
          color: #fff;
          font-weight: 600;
          font-size: 32px;
        }

        .stat-trend {
          font-size: 12px;

          &.up {
            color: #00d68f;
          }

          &.down {
            color: #ff6b6b;
          }
        }
      }
    }

    .charts-section {
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 15px;
      overflow: hidden;

      .chart-row {
        display: flex;
        flex: 1;
        gap: 15px;
        min-height: 0;

        .chart-item {
          display: flex;
          flex: 1;
          flex-direction: column;
          padding: 15px;
          background: rgb(255 255 255 / 2%);
          border-radius: 4px;

          &.half {
            flex: 1;
          }

          .chart-title {
            margin-bottom: 15px;
            padding-bottom: 10px;
            color: #fff;
            font-weight: 600;
            font-size: 16px;
            border-bottom: 1px solid rgb(255 255 255 / 10%);
          }

          .chart-container {
            flex: 1;
            min-height: 300px;

            .chart-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: rgb(0 0 0 / 20%);
              border: 2px dashed rgb(255 255 255 / 20%);
              border-radius: 4px;

              .placeholder-text {
                color: rgb(255 255 255 / 50%);
                font-size: 16px;
              }
            }
          }
        }
      }
    }
  }
</style>
