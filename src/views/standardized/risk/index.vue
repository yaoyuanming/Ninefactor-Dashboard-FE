<template>
  <div class="risk-control">
    <div class="tab-container">
      <el-tabs v-model="activeTab" @tab-click="tab => activeTab = tab.paneName">
        <!-- 概览 -->
        <el-tab-pane label="概览" name="overview">
          <!-- 页面标题和时间戳 -->
          <div class="page-header">
            <div class="header-content">
              <h2>概览</h2>
              <div class="data-timestamp">截止到{{ filterForm.dateRange?.[1] ? formatDate(filterForm.dateRange[1], 'YYYY-MM-DD') : '' }}的最新数据</div>
            </div>
          </div>
          <!-- 筛选区 -->
          <div class="filter-section">
            <el-form inline>
              <el-form-item label="区域">
                <el-tree-select
                  v-model="filterForm.region"
                  :data="regionTree"
                  :props="{
                    label: 'regionName',
                    value: 'primaryId',
                    children: 'children'
                  }"
                  check-strictly
                  default-expand-all
                  placeholder="请选择区域"
                  value-key="primaryId"
                  :clearable="false"
                  filterable
                  style="width: 200px"
                />
              </el-form-item>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="filterForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  style="width: 300px"
                  :clearable="false"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="loadOverviewData">搜索</el-button>
                <el-button @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 企业概况 -->
          <div class="overview-title" style="margin-bottom: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <img src="@/assets/imgs/workbenches/iconPark.png" alt="企业图标" style="width: 20px; height: 20px;" />
            已辨识企业概况
          </div>
          <div class="kpi-grid">
            <!-- 5个企业概况卡片 -->
            <div class="kpi-card" v-for="item in overviewKpi" :key="item.label">
              <div class="kpi-title">{{ item.label }}</div>
              <div class="kpi-value">{{ item.value }}</div>
            </div>
          </div>
          <!-- 区域辨识情况图表 -->
          <div class="overview-title" style="margin-top: 16px; margin-bottom: 16px">区域辨识情况</div>
          <div ref="regionChart" style="height: 300px;"></div>
          <!-- 风险点概况 -->
          <div class="overview-title" style="margin-top: 32px; margin-bottom: 16px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
            <img src="@/assets/imgs/workbenches/riLine.png" alt="风险点图标" style="width: 20px; height: 20px;" />
            已辨识风险点概况
          </div>
          <div class="kpi-grid">
            <!-- 5个风险点概况卡片 -->
            <div class="kpi-card" v-for="item in pointKpi" :key="item.label">
              <div class="kpi-title">{{ item.label }}</div>
              <div class="kpi-value">{{ item.value }}</div>
            </div>
          </div>
          <!-- 风险点趋势、风险等级趋势图表 -->
          <div class="chart-row">
            <div class="chart-block">
              <div class="overview-title" style="margin-bottom: 16px">风险点总数趋势</div>
              <div ref="riskTrendChart" style="height: 300px;"></div>
            </div>
            <div class="chart-block">
              <div ref="riskLevelTrendChart" style="height: 300px;"></div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="风险管控详情" name="detail">
          <RiskControlDetail />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import {
  getEnterpriseRiskStatistics,
  getRegionRiskStatistics,
  getRiskPointStatistics,
  getRiskTrend
} from '@/api/standardization/risks'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'
import { formatDate } from '@/utils/formatTime'
import * as echarts from 'echarts';
import RiskControlDetail from './components/RiskControlDetail.vue'

const regionTree = ref<any[]>([])
const filterForm = reactive({
  region: '',
  dateRange: [
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]
})
const activeTab = ref('overview')
const overviewKpi = ref<any[]>([])
const pointKpi = ref<any[]>([])
const regionChart = ref()
const riskTrendChart = ref()
const riskLevelTrendChart = ref()

// 区域树数据转换
const transformRegionData = (data: any[]) => {
  if (!data || !Array.isArray(data)) {
    return []
  }
  return data.map(item => ({
    id: item.id,
    primaryId: item.primaryId || item.id,
    regionName: item.label || item.regionName,
    regionCode: item.id,
    label: item.label || item.regionName,
    value: item.primaryId || item.id,
    children: item.children ? transformRegionData(item.children) : []
  }))
}

// 递归查找第一个区域
const findFirstRegion = (regions: any[]): any => {
  for (const region of regions) {
    if (region.primaryId) {
      return region
    }
    if (region.children && region.children.length > 0) {
      const result = findFirstRegion(region.children)
      if (result) {
        return result
      }
    }
  }
  return null
}

// 加载区域树并默认选中
const loadRegionTree = async () => {
  const response = await getRegionTree()
  if (response) {
    regionTree.value = transformRegionData(response)
    if (regionTree.value.length > 0) {
      const firstRegion = findFirstRegion(regionTree.value)
      if (firstRegion) {
        filterForm.region = firstRegion.primaryId
      }
    }
  }
}

const renderRegionChart = (regions) => {
  if (!regionChart.value) return;
  const chart = echarts.init(regionChart.value);
  const regionNames = regions.map(item => item.regionName);
  const highRisk = regions.map(item => item.highRiskCount || 0);
  const mediumHighRisk = regions.map(item => item.mediumHighRiskCount || 0);
  const mediumRisk = regions.map(item => item.mediumRiskCount || 0);
  const lowRisk = regions.map(item => item.lowRiskCount || 0);

  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: ['低风险', '一般风险', '较大风险', '重大风险'], top: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: regionNames },
    yAxis: { type: 'value' },
    series: [
      { name: '低风险', type: 'bar', stack: 'total', data: lowRisk, itemStyle: { color: '#3b82f6' } },
      { name: '一般风险', type: 'bar', stack: 'total', data: mediumRisk, itemStyle: { color: '#fde047' } },
      { name: '较大风险', type: 'bar', stack: 'total', data: mediumHighRisk, itemStyle: { color: '#fbbf24' } },
      { name: '重大风险', type: 'bar', stack: 'total', data: highRisk, itemStyle: { color: '#ef4444' } }
    ]
  };

  chart.setOption(option);
};

// 在loadOverviewData中调用
const loadOverviewData = async () => {
  // 1. 企业概况
  const enterpriseRes = await getEnterpriseRiskStatistics()
  overviewKpi.value = [
    { label: '企业总数', value: enterpriseRes.totalEnterprises ?? 0 },
    { label: '重大风险', value: enterpriseRes.highRiskCount ?? 0 },
    { label: '较大风险', value: enterpriseRes.mediumHighRiskCount ?? 0 },
    { label: '一般风险', value: enterpriseRes.mediumRiskCount ?? 0 },
    { label: '低风险', value: enterpriseRes.lowRiskCount ?? 0 }
  ]
  // 2. 区域辨识情况
  const regionRes = await getRegionRiskStatistics({ regionId: filterForm.region });
  const regions = regionRes || [];
  nextTick(() => { renderRegionChart(regions); });
  // 3. 风险点概况
  const pointRes = await getRiskPointStatistics()
  pointKpi.value = [
    { label: '风险点总数', value: pointRes.totalCount ?? 0 },
    { label: '重大风险', value: pointRes.highRiskCount ?? 0 },
    { label: '较大风险', value: pointRes.mediumHighRiskCount ?? 0 },
    { label: '一般风险', value: pointRes.mediumRiskCount ?? 0 },
    { label: '低风险', value: pointRes.lowRiskCount ?? 0 }
  ]
  // 4. 风险点趋势
  const trendRes = await getRiskTrend({ endDate: filterForm.dateRange?.[1] ? formatDate(filterForm.dateRange[1], 'YYYY-MM-DD') : '' });
  nextTick(() => { renderRiskTrendChart(trendRes); });
}

const renderRiskTrendChart = (trendRes) => {
  if (!riskTrendChart.value) return;
  const chart = echarts.init(riskTrendChart.value);
  const data = trendRes || [];
  const dates = data.map(item => { const date = new Date(item.date); return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`; }).reverse();
  const totalCounts = data.map(item => item.totalCount ?? 0).reverse();
  const option = {
    title: { text: '风险点总数趋势', left: 'left', textStyle: { fontSize: 16, fontWeight: 'bold' }, show: false },
    tooltip: { trigger: 'axis' },
    legend: { data: ['风险点总数'], top: 30 },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: dates },
    yAxis: { type: 'value' },
    series: [ { name: '风险点总数', type: 'line', data: totalCounts, symbol: 'circle', symbolSize: 10, itemStyle: { color: '#3b82f6' }, lineStyle: { color: '#3b82f6' } } ]
  };
  chart.setOption(option);
};

const handleReset = () => {
  // 重置区域为第一个有 primaryId 的区域
  const firstRegion = findFirstRegion(regionTree.value)
  if (firstRegion) {
    filterForm.region = firstRegion.primaryId
  } else {
    filterForm.region = ''
  }
  // 重置时间范围为最近7天
  filterForm.dateRange = [
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]
  loadOverviewData()
}

const handleTabChange = (tab) => {
  if (tab === 'overview') {
    loadOverviewData();
  }
};

// 监听tab切换
watch(() => activeTab.value, (val) => { handleTabChange(val); });

onMounted(async () => {
  await loadRegionTree();
  await loadOverviewData();
});
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}
.kpi-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
  .kpi-title {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
    text-align: center;
  }
  .kpi-value {
    font-size: 24px;
    font-weight: bold;
    color: #333;
    text-align: center;
  }
}
.page-header {
  margin-bottom: 20px;
  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;
    h2 {
      margin: 0;
      color: #333;
      font-size: 20px;
      font-weight: bold;
      position: relative;
      &::before {
        content: '';
        position: absolute;
        left: -10px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 20px;
        background: #409eff;
        border-radius: 2px;
      }
    }
    .data-timestamp {
      color: #666;
      font-size: 14px;
    }
  }
}
.tab-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 20px;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }
  :deep(.el-tabs__content) {
    padding: 20px;
  }
}
.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  .el-tree-select {
    width: 200px;
  }
}
.charts-container {
  .chart-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    .chart-item {
      flex: 1;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      .chart-title {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #333;
      }
      .chart-content {
        height: 300px;
      }
    }
  }
}
</style>