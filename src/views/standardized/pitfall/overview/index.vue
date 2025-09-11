<template>
  <div class="hidden-danger-governance">
        <!-- Tab切换 -->
    <div class="tab-container">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="概览" name="overview">
          <!-- 页面标题和时间戳 -->
          <div class="page-header">
                      <div class="header-content">
            <h2>概览</h2>
            <div class="data-timestamp">截止到{{ filterForm.dateRange?.[1] ? formatDate(filterForm.dateRange[1], 'YYYY-MM-DD') : currentDate }}的最新数据</div>
            
          </div>
          </div>
          
          <div class="overview-content">
            <!-- 筛选条件 -->
            <div class="filter-section">
              <el-form :model="filterForm" inline>
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
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                  <el-button @click="handleReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 概览标题 -->
            <div class="overview-title">已排查隐患概况</div>

            <!-- KPI卡片 -->
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-title">已排查隐患总数</div>
                <div class="kpi-value">{{ overviewData.totalInspected || 0 }}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">已排查重大隐患总数</div>
                <div class="kpi-value">{{ overviewData.totalMajorInspected || 0 }}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">已排查一般隐患总数</div>
                <div class="kpi-value">{{ overviewData.totalGeneralInspected || 0 }}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">整改中隐患数</div>
                <div class="kpi-value">{{ overviewData.totalUnrectified || 0 }}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">整改中重大隐患数</div>
                <div class="kpi-value">{{ overviewData.majorUnrectified || 0 }}</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-title">整改中一般隐患数</div>
                <div class="kpi-value">{{ overviewData.generalUnrectified || 0 }}</div>
              </div>
              <div class="kpi-card success">
                <div class="kpi-title">隐患整改率</div>
                <div class="kpi-value success">{{ overviewData.rectificationRate || '0%' }}</div>
              </div>
              <div class="kpi-card danger">
                <div class="kpi-title">逾期未整改隐患数</div>
                <div class="kpi-value danger">{{ overviewData.overdueUnrectified || 0 }}</div>
              </div>
            </div>

            <!-- 图表区域 -->
            <div class="charts-container">
              <div class="chart-row">
                <!-- <div class="chart-item">
                  <div class="chart-title">区域隐患治理情况</div>
                  <div class="chart-content" ref="regionalChart"></div>
                </div> -->
                <div class="chart-item">
                  <div class="chart-title">已排查隐患总数</div>
                  <div class="chart-content" ref="totalInspectedChart"></div>
                </div>
                <div class="chart-item">
                  <div class="chart-title">隐患整改率</div>
                  <div class="chart-content" ref="rectificationRateChart"></div>
              </div>
              </div>
              <!-- <div class="chart-row">
                <div class="chart-item">
                  <div class="chart-title">隐患整改率</div>
                  <div class="chart-content" ref="rectificationRateChart"></div>
                </div>
                <div class="chart-item">
                  <div class="chart-title">每月新增隐患</div>
                  <div class="chart-content" ref="monthlyAddChart"></div>
                </div>
              </div> -->
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="隐患治理详情" name="details">
          <!-- 页面标题和时间戳 -->
          <div class="page-header">
            <div class="header-content">
              <h2>隐患治理详情</h2>
              <div class="data-timestamp">截止到{{ currentDate }}的最新数据</div>
            </div>
          </div>
          
          <div class="details-content">
            <!-- 筛选条件 -->
            <div class="filter-section">
              <el-form :model="detailsFilterForm" inline>
                <el-form-item label="区域">
                  <RegionTreeSelect
                    v-model="detailsFilterForm.regionId"
                    placeholder="请选择区域"
                    clearable
                    filterable
                    style="width: 200px"
                  />
                </el-form-item>
                <el-form-item label="整体风险等级">
                  <el-select v-model="detailsFilterForm.riskLevel" placeholder="请选择" clearable style="width: 200px">
                    <el-option
                      v-for="(opt, idx) in dangerLevelOptions"
                      :key="idx"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="企业名称">
                  <el-input v-model="detailsFilterForm.enterpriseName" placeholder="请输入企业名称" />
                </el-form-item>
                <!-- 在筛选区内，企业名称后追加两个筛选项：国民经济类型与所涉高危环境类型 -->
                <el-form-item label="国民经济类型">
                  <el-cascader
                    v-model="detailsFilterForm.industryType"
                    :options="categoryData"
                    :props="{
                      checkStrictly: true
                    }"
                    placeholder="请选择国民经济类型"
                    clearable
                    style="width: 200px"
                    @change="handleIndustryChange"
                  />
                </el-form-item>
                <el-form-item label="所涉高危环境类型">
                  <el-select v-model="detailsFilterForm.riskEnvTypes" placeholder="请选择" clearable multiple collapse-tags style="width: 200px">
                    <el-option
                      v-for="(opt, idx) in riskEnvOptions"
                      :key="idx"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleDetailsSearch">搜索</el-button>
                  <el-button @click="handleDetailsReset">重置</el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 数据表格 -->
            <div class="table-container">
              <el-table :data="detailsData" v-loading="tableLoading" stripe>
                <el-table-column prop="enterpriseName" label="企业名称">
                  <template #default="scope">
                    <el-link 
                      type="primary" 
                      :underline="false" 
                      @click="goToEnterpriseDetail(scope.row.id, 'danger')"
                    >
                      {{ scope.row.enterpriseName }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column prop="regionName" label="区域" />
                <el-table-column prop="totalHazards" label="已排查隐患总数" />
                <el-table-column prop="totalMajorHazards" label="已排查重大隐患总数" />
                <el-table-column prop="totalGeneralHazards" label="已排查一般隐患总数" />
                <el-table-column prop="rectificationRate" label="隐患整改率">
                  <template #default="scope">
                    {{ scope.row.rectificationRate ? scope.row.rectificationRate  : '0%' }}
                  </template>
                </el-table-column>
                <el-table-column prop="unRectifiedHazardsCount" label="整改中隐患数" />
                <el-table-column prop="unRectifiedMajorHazardsCount" label="整改中重大隐患数" />
                <el-table-column prop="unRectifiedGeneralHazardsCount" label="整改中一般隐患数" />
                <el-table-column prop="overdueUnRectifiedHazardsCount" label="逾期未整改隐患数" />
              </el-table>

              <!-- 分页 -->
              <div class="pagination-container">
                <el-pagination
                  v-model:current-page="pagination.currentPage"
                  v-model:page-size="pagination.pageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :total="pagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleSizeChange"
                  @current-change="handleCurrentChange"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
  getDangerStatisticsDetails,
  getInspectedDangerOverview,
  getMonthlyAddDanger,
  getRegionalManagement,
  getTotalInspected
} from '@/api/standardization/overview'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'
import { formatDate } from '@/utils/formatTime'
import RegionTreeSelect from '@/components/common/RegionTreeSelect.vue'
import { categoryData } from 'element-china-category-data'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

// 路由实例
const router = useRouter()

// 响应式数据
const activeTab = ref('overview')
const loading = ref(false)
const tableLoading = ref(false)

// 区域数据
const regionTree = ref([])
const currentDate = ref(formatDate(new Date(), 'YYYY-MM-DD'))

// 筛选表单
const filterForm = reactive({
  region: '',
  dateRange: [
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7天前
    new Date() // 今天
  ]
})

// 转换区域数据格式
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

const riskEnvOptions = ref(getIntDictOptions(DICT_TYPE.RISK_ENV_TYPE) || [])
const dangerLevelOptions = ref(getIntDictOptions(DICT_TYPE.RISKLEVEL) || [])
// 详情筛选表单新增两个字段
const detailsFilterForm = reactive({
  regionId: '',
  riskLevel: '',
  enterpriseName: '',
  industryType: [] as string[],
  riskEnvTypes: [] as string[]
})

// 概览数据
const overviewData = reactive({
  totalInspected: 0,
  totalMajorInspected: 0,
  totalGeneralInspected: 0,
  totalUnrectified: 0,
  majorUnrectified: 0,
  generalUnrectified: 0,
  rectificationRate: '0%',
  overdueUnrectified: 0
})

// 详情数据
const detailsData = ref([])
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 图表引用
const regionalChart = ref()
const totalInspectedChart = ref()
const rectificationRateChart = ref()
const monthlyAddChart = ref()

// Tab切换处理
const handleTabClick = (tab: any) => {
  if (tab.props.name === 'overview') {
    loadOverviewData()
  } else if (tab.props.name === 'details') {
    loadDetailsData()
  }
}

// 搜索处理
const handleSearch = () => {
  loadOverviewData()
}

// 重置处理
const handleReset = () => {
  const findFirstRegion = (nodes: any[]): any => {
    if (!nodes || !Array.isArray(nodes)) return null
    for (const n of nodes) {
      if (n.primaryId) return n
      if (n.children && n.children.length) {
        const r = findFirstRegion(n.children)
        if (r) return r
      }
    }
    return null
  }
  const firstRegion = findFirstRegion(regionTree.value)
  filterForm.region = firstRegion ? firstRegion.primaryId : ''
  // 重置时间范围为默认值（7天前到今天）
  filterForm.dateRange = [
    new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000), // 7天前
    new Date() // 今天
  ]
  loadOverviewData()
}

// 详情搜索处理
const handleDetailsSearch = () => {
  pagination.currentPage = 1
  loadDetailsData()
}

// 详情重置处理
const handleDetailsReset = () => {
  detailsFilterForm.regionId = ''
  detailsFilterForm.riskLevel = ''
  detailsFilterForm.enterpriseName = ''
  detailsFilterForm.industryType = []
  detailsFilterForm.riskEnvTypes = []
  pagination.currentPage = 1
  loadDetailsData()
}

// 导出处理
const handleExport = () => {
  // 实现导出功能
  console.log('导出数据')
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadDetailsData()
}

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadDetailsData()
}

// 加载概览数据
const loadOverviewData = async () => {
  try {
    loading.value = true
    
    // 获取已排查隐患概况
    const overviewResponse = await getInspectedDangerOverview()
    if (overviewResponse) {
      // 映射接口返回的字段到页面显示的字段
      overviewData.totalInspected = overviewResponse.totalHazards || 0
      overviewData.totalMajorInspected = overviewResponse.totalMajorHazards || 0
      overviewData.totalGeneralInspected = overviewResponse.totalGeneralHazards || 0
      overviewData.totalUnrectified = overviewResponse.unRectifiedHazards || 0
      overviewData.majorUnrectified = overviewResponse.unRectifiedMajorHazards || 0
      overviewData.generalUnrectified = overviewResponse.unRectifiedGeneralHazards || 0
      overviewData.overdueUnrectified = overviewResponse.overdueUnRectifiedHazards || 0
      
      // 使用后端返回的整改率字段
      overviewData.rectificationRate = overviewResponse.rectificationRate ?? '0%'
    }
    
    // 获取区域隐患治理情况
    const regionalResponse = await getRegionalManagement({
      regionId: filterForm.region
    })
    
    console.log('区域隐患治理数据:', regionalResponse)
    
    // 获取已排查隐患总数趋势
    const totalInspectedResponse = await getTotalInspected({
      endDate: filterForm.dateRange?.[1] ? formatDate(filterForm.dateRange[1], 'YYYY-MM-DD') : currentDate.value
    })
    
    console.log('已排查隐患总数趋势数据:', totalInspectedResponse)
    
    // 获取每月新增隐患数据
    const monthlyAddResponse = await getMonthlyAddDanger({
      year: new Date().getFullYear()
    })
    
    console.log('每月新增隐患数据:', monthlyAddResponse)
    
    // 渲染图表
    nextTick(() => {
      // renderRegionalChart(regionalResponse)
      renderTotalInspectedChart(totalInspectedResponse)
      renderRectificationRateChart(totalInspectedResponse)
      // renderMonthlyAddChart(monthlyAddResponse)
    })
    
  } catch (error) {
    console.error('加载概览数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载详情数据
const loadDetailsData = async () => {
  try {
    tableLoading.value = true
    
    const params = {
      regionId: detailsFilterForm.regionId,
      riskLevel: detailsFilterForm.riskLevel,
      enterpriseName: detailsFilterForm.enterpriseName,
      industryId: detailsFilterForm.industryType.length > 0 ? detailsFilterForm.industryType.join(',') : undefined,
      riskEnvTypes: Array.isArray(detailsFilterForm.riskEnvTypes) && detailsFilterForm.riskEnvTypes.length > 0 
        ? detailsFilterForm.riskEnvTypes.join(',') 
        : undefined,
      page: pagination.currentPage,
      size: pagination.pageSize
    }
    
    const response = await getDangerStatisticsDetails(params)
    if (response) {
      detailsData.value = response.list || []
      pagination.total = response.total || 0
    }
    
  } catch (error) {
    console.error('加载详情数据失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 渲染区域隐患治理情况图表
const renderRegionalChart = (data: any) => {
  if (!regionalChart.value) return
  
  const chart = echarts.init(regionalChart.value)
  
  // 处理返回的数据
  const regions = data || []
  const regionNames = regions.map((item: any) => item.regionName)
  const totalHazards = regions.map((item: any) => item.totalHazards)
  const totalUnRectifiedHazards = regions.map((item: any) => item.totalUnRectifiedHazards)
  
  // 计算整改率
  const rectificationRates = regions.map((item: any) => {
    if (item.totalHazards === 0) return 0
    const rate = ((item.totalHazards - item.totalUnRectifiedHazards) / item.totalHazards * 100).toFixed(2)
    return parseFloat(rate)
  })
  
  const option = {
    title: {
      text: '区域隐患治理情况',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['已排查隐患总数', '未整改隐患总数', '隐患整改率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: regionNames
    },
    yAxis: [
      {
        type: 'value',
        name: '数量',
        position: 'left'
      },
      {
        type: 'value',
        name: '整改率(%)',
        position: 'right',
        max: 100
      }
    ],
    series: [
      {
        name: '已排查隐患总数',
        type: 'bar',
        data: totalHazards,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '未整改隐患总数',
        type: 'bar',
        data: totalUnRectifiedHazards,
        itemStyle: {
          color: '#ee6666'
        }
      },
      {
        name: '隐患整改率',
        type: 'line',
        yAxisIndex: 1,
        data: rectificationRates,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 渲染已排查隐患总数图表
const renderTotalInspectedChart = (data: any) => {
  if (!totalInspectedChart.value) return
  
  const chart = echarts.init(totalInspectedChart.value)
  
  // 处理返回的数据
  const chartData = data || []
  const dates = chartData.map((item: any) => {
    // 格式化日期显示，只显示月-日
    const date = new Date(item.statisticsDate)
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  })
  const majorHazards = chartData.map((item: any) => item.majorHazardsCount || 0)
  const generalHazards = chartData.map((item: any) => item.generalHazardsCount || 0)
  
  const option = {
    title: {
      text: '已排查隐患总数趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['重大隐患', '一般隐患'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['01-07', '01-08', '01-09', '01-10', '01-11', '01-12', '01-13']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '重大隐患',
        type: 'line',
        data: majorHazards.length > 0 ? majorHazards : [820, 932, 901, 934, 1290, 1330, 1320],
        itemStyle: {
          color: '#ee6666'
        }
      },
      {
        name: '一般隐患',
        type: 'line',
        data: generalHazards.length > 0 ? generalHazards : [320, 332, 301, 334, 390, 330, 320],
        itemStyle: {
          color: '#5470c6'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 渲染隐患整改率图表
const renderRectificationRateChart = (data: any) => {
  if (!rectificationRateChart.value) return
  
  const chart = echarts.init(rectificationRateChart.value)
  
  // 处理返回的数据
  const chartData = data || []
  const dates = chartData.map((item: any) => {
    // 格式化日期显示，只显示月-日
    const date = new Date(item.statisticsDate)
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
  })
  
  // 使用后端返回的整改率字段（数值，范围0-100）
  const rectificationRates = chartData.map((item: any) => {
    const rate = item.rectificationRate
    return typeof rate === 'number' ? rate : parseFloat(String(rate)) || 0
  })
  
  const option = {
    title: {
      text: '隐患整改率趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['整改率'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates.length > 0 ? dates : ['01-07', '01-08', '01-09', '01-10', '01-11', '01-12', '01-13']
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '整改率',
        type: 'line',
        data: rectificationRates.length > 0 ? rectificationRates : [95, 92, 88, 96, 89, 93, 98],
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
  
  chart.setOption(option)
}

// 渲染每月新增隐患图表
const renderMonthlyAddChart = (data: any) => {
  if (!monthlyAddChart.value) return

  const chart = echarts.init(monthlyAddChart.value)

  // 处理返回的数据
  const chartData = data || []
  const months = chartData.map((item: any) => {
    // 从日期中提取月份，如 "2025-01-01" -> "1月"
    if (item.date) {
      const month = new Date(item.date).getMonth() + 1
      return `${month}月`
    }
    return item.month ? `${item.month}月` : ''
  })
  const totalNewHazards = chartData.map((item: any) => item.totalNewHazards || 0)
  const totalNewRectHazards = chartData.map((item: any) => item.totalNewRectHazards || 0)

  const option = {
    title: {
      text: '每月新增隐患趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['新增隐患', '新增整改隐患'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months.length > 0 ? months : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增隐患',
        type: 'line',
        data: totalNewHazards.length > 0 ? totalNewHazards : [0, 0, 0, 18, 30, 16, 0, 0, 0, 0, 0, 0],
        itemStyle: {
          color: '#67c23a'
        }
      },
      {
        name: '新增整改隐患',
        type: 'line',
        data: totalNewRectHazards.length > 0 ? totalNewRectHazards : [0, 0, 0, 14, 7, 43, 0, 0, 0, 0, 0, 0],
        itemStyle: {
          color: '#409eff'
        }
      }
    ]
  }

  chart.setOption(option)
}

// 加载区域数据
const loadRegionData = async () => {
  try {
    const response = await getRegionTree()
    if (response) {
      // 转换数据格式以适配 el-tree-select
      regionTree.value = transformRegionData(response)
      
      // 默认选择第一个区域
      if (regionTree.value.length > 0) {
        const firstRegion = findFirstRegion(regionTree.value)
        if (firstRegion) {
          filterForm.region = firstRegion.primaryId
          // detailsFilterForm.region = firstRegion.primaryId // 新增这一行
        }
      }
      
      console.log('区域树加载完成:', regionTree.value)
    }
  } catch (error) {
    console.error('加载区域数据失败:', error)
  }
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

// 处理国民经济类型选择变化
const handleIndustryChange = (value: string[]) => {
  detailsFilterForm.industryType = value
}

// 跳转到企业详情页面
const goToEnterpriseDetail = (id: string, tab?: string) => {
  if (tab && ['danger', 'map'].includes(tab)) {
    router.push('/enterpriseArchives/basic/' + id + '?tab=' + tab)
  } else {
    // 默认跳转到企业风险一张图tab
    router.push('/enterpriseArchives/basic/' + id)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadRegionData()
  loadOverviewData()
})
</script>

<style lang="scss" scoped>
.hidden-danger-governance {

  background: #f5f5f5;
  min-height: 100vh;
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
    
    .filter-placeholder {
      color: #999;
      font-size: 14px;
      font-style: italic;
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

.overview-title {
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
  color: #333;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
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
  
  &.success {
    border-left: 4px solid #67c23a;
  }
  
  &.danger {
    border-left: 4px solid #f56c6c;
  }
  
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
    
    &.success {
      color: #67c23a;
    }
    
    &.danger {
      color: #f56c6c;
    }
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

.table-container {
  .pagination-container {
    margin-top: 20px;
    text-align: right;
  }
}
</style>