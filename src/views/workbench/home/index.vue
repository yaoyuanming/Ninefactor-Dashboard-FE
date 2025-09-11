<template>
  <div class="home-layout">
    <!-- 左侧主内容 -->
    <div class="home-main">
      <!-- 待办事项卡片 -->
      <el-card class="mb-4px" shadow="never">
        <div class="todo-title">待办事项</div>
        <div class="todo-list">
          <div class="todo-item" @click="goToSpecialInspectionRecord">
            <div class="todo-item-content">
              <div class="todo-item-title">待处理专项检查任务</div>
              <div class="todo-item-count">{{ taskStatistics.unfinishedTasks || 0 }}</div>
            </div>
          </div>
          <div class="todo-item" @click="goToPitfallList">
            <div class="todo-item-content">
              <div class="todo-item-title">待处理隐患跟踪任务</div>
              <div class="todo-item-count">{{ dangerStatistics.unRectifiedHazards || 0 }}</div>
            </div>
          </div>
        </div>
      </el-card>
      <!-- 图标导航 -->
      <!-- <el-card class="mb-16px" shadow="never">
        <div class="icon-nav">
          <el-row :gutter="16">
            <el-col :span="6" v-for="item in iconNav" :key="item.name">
              <div class="icon-nav-item" @click="handleIconClick(item.name)">
                <Icon :icon="item.icon" :size="32" />
                <div class="icon-nav-label">{{ item.name }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card> -->
      <!-- 图表区 -->
      <div class="chart-area">
        <el-row :gutter="8">
          <el-col :span="12">
            <el-card shadow="never" class="mb-4px chart-card">
              <div class="chart-title">企业信息采集概况</div>
              <div class="company-stats">
                <div class="stats-row">
                  <div class="stat-item">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <Icon icon="ep:office-building" :size="20" color="#409eff" />
                      </div>
                      <div class="stat-label">企业总数</div>
                    </div>
                    <div class="stat-value">{{ companyStatistics.totalCount }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <Icon icon="ep:document-checked" :size="20" color="#67c23a" />
                      </div>
                      <div class="stat-label">已上报企业数</div>
                    </div>
                    <div class="stat-value">{{ companyStatistics.reportedCount }}</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-header">
                      <div class="stat-icon">
                        <Icon icon="ep:document-delete" :size="20" color="#909399" />
                      </div>
                      <div class="stat-label">未上报企业</div>
                    </div>
                    <div class="stat-value">{{ companyStatistics.notReportedCount }}</div>
                  </div>
                </div>
                <div class="chart-container">
                  <Echart :options="companyPieOptions" :height="250" />
                </div>
                <div class="completion-rate">
                  <span>完成率</span>
                  <span class="rate-value">{{ companyStatistics.totalCount > 0 ? ((companyStatistics.reportedCount / companyStatistics.totalCount) * 100).toFixed(2) : '0.00' }}%</span>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="never" class="mb-4px chart-card">
              <el-tabs v-model="activeTab" style="height: 100%;" @tab-click="handleTabClick">
                <el-tab-pane label="风险管控" name="risk" style="height: 100%;">
                  <!-- 风险统计面板 -->
                  <div class="risk-stats">
                    <div class="risk-stat-item">
                      <div class="risk-stat-title">重大风险</div>
                      <div class="risk-stat-value">{{ riskStatistics.highRisk }} </div>
                    </div>
                    <div class="risk-stat-item">
                      <div class="risk-stat-title">较大风险</div>
                      <div class="risk-stat-value">{{ riskStatistics.mediumHighRisk }}  </div>
                    </div>
                    <div class="risk-stat-item">
                      <div class="risk-stat-title">一般风险</div>
                      <div class="risk-stat-value">{{ riskStatistics.mediumRisk }}  </div>
                    </div>
                    <div class="risk-stat-item">
                      <div class="risk-stat-title">低风险</div>
                      <div class="risk-stat-value">{{ riskStatistics.lowRisk }}   </div>
                    </div>
                  </div>
                  <!-- 风险趋势图表 -->
                  <div class="risk-chart">
                    <div class="chart-title">风险点统计</div>
                    <div class="chart-date">截止日期: {{ new Date().toLocaleDateString() }}</div>
                    <div class="chart-container" style="width: 100%; flex: 1; min-height: 250px;">
                      <div v-if="isLoading" style="display: flex; justify-content: center; align-items: center; height: 100%;">
                        <el-icon class="is-loading"><Loading /></el-icon>
                        <span style="margin-left: 8px;">加载中...</span>
                      </div>
                      <Echart v-else :options="riskTrendOptions" :height="250" style="width: 100%;" />
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="隐患治理" name="danger">
                  <!-- 隐患治理图表 -->
                  <div class="risk-chart">
                    <div class="chart-title">隐患治理趋势</div>
                    <div class="chart-date">截止日期: {{ new Date().toLocaleDateString() }}</div>
                    <div class="chart-container" style="width: 100%; flex: 1; min-height: 320px;">
                      <div v-if="isLoading" style="display: flex; justify-content: center; align-items: center; height: 100%;">
                        <el-icon class="is-loading"><Loading /></el-icon>
                        <span style="margin-left: 8px;">加载中...</span>
                      </div>
                      <Echart v-else ref="dangerChart" :options="dangerManagementOptions" :height="320" style="width: 100%;" />
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <!-- 右侧通知公告/政策文件 -->
    <div class="home-side">
      <el-card class="mb-1px" shadow="never">
        <div class="side-header">
          <div class="side-title">通知公告</div>
          <div class="more-link" @click="goToNotice">
            <span>查看更多</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="notice-scroll-container">
          <el-table :data="noticeList" size="small" :show-header="false" style="width: 100%;">
            <el-table-column prop="title">
              <template #default="{ row }">
                <div class="notice-row" @click="viewNotice(row)">
                  <span class="notice-title">
                    <span v-if="row.urgencyLevel === 2" class="urgent-tag">(紧急)</span>
                    {{ row.title }}
                  </span>
                  <span class="notice-date">{{ formatDate(row.publishTime ? new Date(row.publishTime) : null) }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
      
      <!-- 政策文件 -->
      <el-card class="mb-1px" shadow="never">
        <div class="side-header">
          <div class="side-title">政策文件</div>
          <div class="more-link" @click="goToPolicy">
            <span>查看更多</span>
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
        <div class="policy-scroll-container">
          <el-table :data="policyList" size="small" :show-header="false" style="width: 100%;">
            <el-table-column prop="title">
              <template #default="{ row }">
                <div class="notice-row" @click="viewPolicy(row)">
                  <span class="notice-title">{{ row.title }}</span>
                  <span class="notice-date">{{ formatDate(row.createTime ? new Date(row.createTime) : null) }}</span>
                </div>
              </template>
            </el-table-column>
            <template #empty>
              <div class="empty-data">暂无数据</div>
            </template>
          </el-table>
        </div>
      </el-card>
      
      <!-- 智能助手 -->
      <Assistant />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { getTaskStatistics, getDangerStatistics } from '@/api/supervisoryInspect/overview'
import { getCompanyStatistics } from '@/api/enterpriseArchives'
import { getRiskTrend } from '@/api/standardization/risks'
import { getTotalInspected } from '@/api/standardization/overview'
import { noticePage } from '@/api/workbenches/notice'
import { getPolicyDocumentPage } from '@/api/workbenches/policy'
import { formatDate } from '@/utils/formatTime'
import { EChartsOption } from 'echarts'
import { ArrowRight } from '@element-plus/icons-vue'
import Assistant from '@/components/Assistant/index.vue'

// 图标导航静态数据
const iconNav = [
  { name: '检查任务', icon: 'ep:calendar' },
  { name: '通知公告', icon: 'ep:message' },
  { name: '检查记录', icon: 'ep:document' },
  { name: '隐患排查', icon: 'ep:warning' },
]
const activeTab = ref('risk')
const router = useRouter()

// 加载状态
const isLoading = ref(false)

// 图表引用
const dangerChart = ref(null)

// 处理tab切换
const handleTabChange = (tab: any) => {
  const tabName = tab.paneName || tab.name || activeTab.value
  
  if (tabName === 'risk') {
    getRiskStatisticsData()
  } else if (tabName === 'danger') {
    getDangerManagementStatisticsData()
  }
}

// 处理tab点击事件
const handleTabClick = async (tab: any) => {
  const tabName = tab.paneName || tab.name
  
  if (tabName === 'risk') {
    await getRiskStatisticsData()
  } else if (tabName === 'danger') {
    await getDangerManagementStatisticsData()
    // 确保数据加载完成后，在下一个渲染周期重新渲染图表
    await nextTick()
    if (dangerChart.value) {
      dangerChart.value.resize()
    }
  }
}

// 任务统计数据
const taskStatistics = ref({
  unfinishedTasks: 0
})

// 隐患统计数据
const dangerStatistics = ref({
  unRectifiedHazards: 0
})

// 隐患治理统计数据
const dangerManagementStatistics = ref({
  majorHazardsCount: 0,
  generalHazardsCount: 0,
  unRectifiedHazardsCount: 0,
  overdueUnRectifiedHazards: 0,
  rectifiedHazardsCount: 0
})

// 企业统计数据
const companyStatistics = ref({
  totalCount: 0,
  reportedCount: 0,
  notReportedCount: 0,
  completionRate: 0,
  largeEnterpriseCount: 0,
  mediumEnterpriseCount: 0,
  smallEnterpriseCount: 0
})

// 企业规模分布饼图配置
const companyPieOptions = ref<EChartsOption>({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: '75%',
    top: 'center',
    itemWidth: 12,
    itemHeight: 8,
    itemGap: 16,
    textStyle: {
      fontSize: 10
    },
    data: ['规上企业', '中等企业', '小型企业', '小微企业']
  },
  series: [
    {
      name: '企业规模分布',
      type: 'pie',
      radius: ['50%', '80%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 0, name: '规上企业' },
        { value: 0, name: '中等企业' },
        { value: 0, name: '小型企业' },
        { value: 0, name: '小微企业' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 风险统计数据
const riskStatistics = ref({
  highRisk: 0,
  mediumHighRisk: 0,
  mediumRisk: 0,
  lowRisk: 0,
  totalCount: 0
})

// 风险趋势数据
const riskTrendData = ref([])

// 风险趋势图表配置
const riskTrendOptions = ref<EChartsOption>({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
  },
  legend: {
    data: ['重大风险', '较大风险', '一般风险', '低风险'],
    top: 10,
    bottom: 20
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '8%',
    top: '25%',
    containLabel: true,
    width: '90%'
  },
  xAxis: {
    type: 'category',
    data: ['风险点统计']
  },
  yAxis: {
    type: 'value',
    max: 50
  },
  series: [
    {
      name: '重大风险',
      type: 'bar',
      data: [0],
      itemStyle: {
        color: '#ff4757'
      },
      label: {
        show: true,
        position: 'top'
      }
    },
    {
      name: '较大风险',
      type: 'bar',
      data: [0],
      itemStyle: {
        color: '#ffa502'
      },
      label: {
        show: true,
        position: 'top'
      }
    },
    {
      name: '一般风险',
      type: 'bar',
      data: [0],
      itemStyle: {
        color: '#ffdd59'
      },
      label: {
        show: true,
        position: 'top'
      }
    },
    {
      name: '低风险',
      type: 'bar',
      data: [0],
      itemStyle: {
        color: '#409eff'
      },
      label: {
        show: true,
        position: 'top'
      }
    }
  ]
})

// 隐患治理图表配置
const dangerManagementOptions = ref<EChartsOption>({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {
    data: ['重大隐患', '一般隐患', '整改中隐患', '已整改隐患'],
    top: 10,
    bottom: 20,
    textStyle: {
      fontSize: 12
    }
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '15%',
    top: '20%',
    containLabel: true,
    width: '90%'
  },
  xAxis: {
    type: 'category',
    data: [],
    axisLabel: {
      rotate: 45,
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    max: 100,
    axisLabel: {
      fontSize: 11
    }
  },
  series: [
    {
      name: '重大隐患',
      type: 'line',
      data: [],
      itemStyle: { color: '#ff4757' },
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      }
    },
    {
      name: '一般隐患',
      type: 'line',
      data: [],
      itemStyle: { color: '#ffa502' },
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      }
    },
    {
      name: '整改中隐患',
      type: 'line',
      data: [],
      itemStyle: { color: '#ffdd59' },
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      }
    },
    {
      name: '已整改隐患',
      type: 'line',
      data: [],
      itemStyle: { color: '#2ed573' },
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: {
        width: 3
      }
    }
  ]
})

// 跳转到专项检查记录页面
const goToSpecialInspectionRecord = () => {
  router.push('/supervisoryInspect/specialInspectionRecord')
}

// 跳转到任务部署页面
const goToTaskDeploy = () => {
  router.push('/supervisoryInspect/taskDeploy')
}

// 跳转到通知公告页面
const goToNotice = () => {
  router.push('/workbench/notice')
}

// 跳转到检查记录页面
const goToInspectionRecord = () => {
  router.push('/supervisoryInspect/specialInspectionRecord')
}

// 跳转到隐患清单页面
const goToPitfallList = () => {
  router.push('/standardized/pitfall/list')
}

// 跳转到政策文件页面
const goToPolicy = () => {
  router.push('/workbench/policy')
}

// 处理图标点击
const handleIconClick = (name: string) => {
  switch (name) {
    case '检查任务':
      goToTaskDeploy()
      break
    case '通知公告':
      goToNotice()
      break
    case '检查记录':
      goToInspectionRecord()
      break
    case '隐患排查':
      goToPitfallList()
      break
    default:
      break
  }
}

// 获取任务统计数据
const getTaskStatisticsData = async () => {
  try {
    const res = await getTaskStatistics()
    if (res) {
      taskStatistics.value.unfinishedTasks = res.unfinishedTasks || 0
    }
  } catch (error) {
    console.error('获取任务统计数据失败:', error)
  }
}

// 获取隐患统计数据
const getDangerStatisticsData = async () => {
  try {
    const res = await getDangerStatistics()
    if (res) {
      dangerStatistics.value.unRectifiedHazards = res.unRectifiedHazards || 0
    }
  } catch (error) {
    console.error('获取隐患统计数据失败:', error)
  }
}

// 获取隐患治理统计数据
const getDangerManagementStatisticsData = async () => {
  try {
    isLoading.value = true
    const res = await getTotalInspected({ endDate: new Date().toISOString().split('T')[0] })
    if (res && Array.isArray(res) && res.length > 0) {
      // 处理7天的历史数据
      const dates = res.map(item => item.statisticsDate).reverse() // 按时间顺序排列
      const majorHazardsData = res.map(item => item.majorHazardsCount || 0).reverse()
      const generalHazardsData = res.map(item => item.generalHazardsCount || 0).reverse()
      const unRectifiedHazardsData = res.map(item => item.unRectifiedHazardsCount || 0).reverse()
      const rectifiedHazardsData = res.map(item => item.rectifiedHazardsCount || 0).reverse()
      
      // 先更新数据，再更新图表配置
      const newOptions = { ...dangerManagementOptions.value }
      newOptions.xAxis.data = dates
      newOptions.series[0].data = majorHazardsData
      newOptions.series[1].data = generalHazardsData
      newOptions.series[2].data = unRectifiedHazardsData
      newOptions.series[3].data = rectifiedHazardsData
      
      // 根据数据最大值动态设置Y轴范围
      const allValues = [...majorHazardsData, ...generalHazardsData, ...unRectifiedHazardsData, ...rectifiedHazardsData]
      const maxValue = Math.max(...allValues, 1) // 确保至少为1，避免空数据
      newOptions.yAxis.max = Math.ceil(maxValue * 1.2) // 增加20%的余量
      
      // 一次性更新整个配置，避免多次重新渲染
      dangerManagementOptions.value = newOptions
      
      // 在下一个渲染周期重新渲染图表
      await nextTick()
      if (dangerChart.value && activeTab.value === 'danger') {
        dangerChart.value.resize()
      }
    }
  } catch (error) {
    console.error('获取隐患治理统计数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 获取企业统计数据
const getCompanyStatisticsData = async () => {
  try {
    const res = await getCompanyStatistics()
    if (res) {
      companyStatistics.value = res
      // 更新饼图数据 - 使用新的 enterpriseScaleStatistics 数组
      if (res.enterpriseScaleStatistics && Array.isArray(res.enterpriseScaleStatistics)) {
        const pieData = res.enterpriseScaleStatistics.map(item => ({
          value: item.count || 0,
          name: item.scaleName || '未知'
        }))
        companyPieOptions.value.series[0].data = pieData
        
        // 更新图例数据
        companyPieOptions.value.legend.data = res.enterpriseScaleStatistics.map(item => item.scaleName || '未知')
      }
    }
  } catch (error) {
    console.error('获取企业统计数据失败:', error)
  }
}

// 获取风险统计数据
const getRiskStatisticsData = async () => {
  try {
    isLoading.value = true
    const res = await getRiskTrend({ endDate: new Date().toISOString().split('T')[0] })
    if (res && res.length > 0) {
      const latestData = res[res.length - 1] || {}
      
      // 更新统计面板数据
      riskStatistics.value = {
        highRisk: latestData.highRiskCount || 0,
        mediumHighRisk: latestData.mediumHighRiskCount || 0,
        mediumRisk: latestData.mediumRiskCount || 0,
        lowRisk: latestData.lowRiskCount || 0,
        totalCount: latestData.totalCount || 0
      }
      
      // 更新柱形图数据 - 使用最新的风险点数据
      const highRisk = latestData.highRiskCount || 0
      const mediumHighRisk = latestData.mediumHighRiskCount || 0
      const mediumRisk = latestData.mediumRiskCount || 0
      const lowRisk = latestData.lowRiskCount || 0
      
      // 先更新数据，再更新图表配置
      const newOptions = { ...riskTrendOptions.value }
      newOptions.series[0].data = [highRisk]
      newOptions.series[1].data = [mediumHighRisk]
      newOptions.series[2].data = [mediumRisk]
      newOptions.series[3].data = [lowRisk]
      
      // 根据数据最大值动态设置Y轴范围
      const maxValue = Math.max(highRisk, mediumHighRisk, mediumRisk, lowRisk)
      newOptions.yAxis.max = Math.ceil(maxValue * 1.2) // 增加20%的余量
      
      // 一次性更新整个配置，避免多次重新渲染
      riskTrendOptions.value = newOptions
    }
  } catch (error) {
    console.error('获取风险统计数据失败:', error)
  } finally {
    isLoading.value = false
  }
}

// 通知公告数据
const noticeList = ref<any[]>([])
// 政策文件数据
const policyList = ref<any[]>([])

// 获取通知公告数据
const getNoticeData = async () => {
  try {
    const params = {
      pageNo: 1,
      pageSize: 10,
      status: 1, // 已发布状态
      urgencyLevel: undefined // 不限紧急程度
    }
    const res = await noticePage(params)
    if (res && res.list) {
      // 处理数据：如果 publishTime 为空，则将 createTime 赋值给 publishTime
      const processedList = res.list.map((item: any) => ({
        ...item,
        publishTime: item.publishTime || item.createTime
      }))
      noticeList.value = processedList
    }
  } catch (error) {
    console.error('获取通知公告数据失败:', error)
  }
}

// 获取政策文件数据
const getPolicyData = async () => {
  try {
    const params = {
      pageNo: 1,
      pageSize: 10
    }
    const res = await getPolicyDocumentPage(params)
    if (res && res.list) {
      policyList.value = res.list
    }
  } catch (error) {
    console.error('获取政策文件数据失败:', error)
  }
}

// 查看通知详情
const viewNotice = (notice: any) => {
  router.push(`/workbench/notice/info/${notice.id}`)
}

// 查看政策文件详情
const viewPolicy = (policy: any) => {
  router.push(`/workbench/policy/detail?id=${policy.id}`)
}

onMounted(async () => {
  // 并行请求所有数据
  try {
    isLoading.value = true
    
    // 同时发起所有API请求
    const [taskStats, dangerStats, companyStats, noticeData, policyData] = await Promise.all([
      getTaskStatistics().catch(error => {
        console.error('获取任务统计数据失败:', error)
        return { unfinishedTasks: 0 }
      }),
      getDangerStatistics().catch(error => {
        console.error('获取隐患统计数据失败:', error)
        return { unRectifiedHazards: 0 }
      }),
      getCompanyStatistics().catch(error => {
        console.error('获取企业统计数据失败:', error)
        return {}
      }),
      noticePage({
        pageNo: 1,
        pageSize: 10,
        status: 1,
        urgencyLevel: undefined
      }).catch(error => {
        console.error('获取通知公告数据失败:', error)
        return { list: [] }
      }),
      getPolicyDocumentPage({
        pageNo: 1,
        pageSize: 10
      }).catch(error => {
        console.error('获取政策文件数据失败:', error)
        return { list: [] }
      })
    ])

    // 更新数据
    if (taskStats) {
      taskStatistics.value.unfinishedTasks = taskStats.unfinishedTasks || 0
    }
    
    if (dangerStats) {
      dangerStatistics.value.unRectifiedHazards = dangerStats.unRectifiedHazards || 0
    }
    
    if (companyStats) {
      companyStatistics.value = companyStats
      // 更新饼图数据 - 使用新的 enterpriseScaleStatistics 数组
      if (companyStats.enterpriseScaleStatistics && Array.isArray(companyStats.enterpriseScaleStatistics)) {
        const pieData = companyStats.enterpriseScaleStatistics.map(item => ({
          value: item.count || 0,
          name: item.scaleName || '未知'
        }))
        companyPieOptions.value.series[0].data = pieData
        
        // 更新图例数据
        companyPieOptions.value.legend.data = companyStats.enterpriseScaleStatistics.map(item => item.scaleName || '未知')
      }
    }
    
    if (noticeData && noticeData.list) {
      // 处理数据：如果 publishTime 为空，则将 createTime 赋值给 publishTime
      const processedList = noticeData.list.map((item: any) => ({
        ...item,
        publishTime: item.publishTime || item.createTime
      }))
      noticeList.value = processedList
    }
    
    if (policyData && policyData.list) {
      policyList.value = policyData.list
    }
    
    // 根据当前活动tab加载相应数据
    if (activeTab.value === 'risk') {
      await getRiskStatisticsData()
    } else if (activeTab.value === 'danger') {
      await getDangerManagementStatisticsData()
    }
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    isLoading.value = false
    
    // 确保所有图表在初始化后正确渲染
    await nextTick()
    if (dangerChart.value && activeTab.value === 'danger') {
      dangerChart.value.resize()
    }
  }
})
</script>

<style scoped>
.home-layout {
  display: flex;
  gap: 2px;
}
.home-main {
  flex: 3;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.home-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.todo-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 8px;
}
.todo-list {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
}
.todo-item {
  flex: 1;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  min-height: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.todo-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}
.todo-item-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}
.todo-item-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}
.todo-item-count {
  color: #409eff;
  font-weight: bold;
  font-size: 24px;
  text-align: center;
}
.icon-nav {
  padding: 8px 0;
}
.icon-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  cursor: pointer;
  transition: all 0.3s ease;
}
.icon-nav-item:hover {
  color: #409eff;
  transform: translateY(-2px);
}
.icon-nav-label {
  margin-top: 4px;
  font-size: 13px;
}
.chart-area {
  margin-top: 0;
  display: flex;
  flex-direction: column;
}
.chart-area .el-row {
  flex: 1;
  display: flex;
}
.chart-area .el-col {
  display: flex;
  flex-direction: column;
}
.chart-card {
  height: 500px; /* 增加卡片高度 */
  display: flex;
  flex-direction: column;
}
.chart-title {
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 8px;
}
.side-title {
  font-weight: bold;
  font-size: 16px;
}
.notice-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.notice-row:hover .notice-title {
  color: #409eff;
}
.notice-title {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}
.notice-date {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}
.urgent-tag {
  color: #e6a23c;
  font-weight: bold;
  margin-right: 5px;
}
.more-link {
  text-align: right;
  margin-top: 10px;
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.more-link:hover {
  opacity: 0.8;
}
.completion-rate {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
  padding: 8px 0;
  border-top: 1px solid #e4e7ed;
  gap: 8px;
  flex-shrink: 0;
}
.rate-value {
  color: #ff6b35;
  font-weight: bold;
  font-size: 18px;
}
.company-stats {
  padding: 16px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.stat-item {
  text-align: center;
  flex: 1;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin: 0 4px;
  background: #fff;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
.stat-icon {
  margin-right: 8px;
}
.stat-label {
  font-size: 12px;
  color: #606266;
}
.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin-top: auto;
}
.chart-container {
  height: 250px;
  margin: 16px 0;
  flex: 1;
  min-height: 250px;
}
.risk-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 8px;
  flex-shrink: 0;
}
.risk-stat-item {
  flex: 1;
  text-align: center;
  padding: 12px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fff;
}
.risk-stat-title {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}
.risk-stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}
.risk-chart {
  margin-top: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.risk-chart .chart-container {
  flex: 1;
  min-height: 320px; /* 增加图表容器最小高度 */
  width: 100%;
  display: flex;
  flex-direction: column;
}
.risk-chart .chart-container :deep(.echarts) {
  width: 100% !important;
  height: 100% !important;
}
.chart-title {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}
.chart-date {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}
.el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-tabs__header) {
  flex-shrink: 0 !important;
  order: 1 !important;
  position: relative !important;
  top: 0 !important;
  margin-bottom: 16px !important;
}
:deep(.el-tabs__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  order: 2 !important;
}
:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
:deep(.el-tabs__nav-wrap) {
  margin-bottom: 16px !important;
}
:deep(.el-tabs__nav) {
  border-bottom: 1px solid #e4e7ed !important;
}
:deep(.el-tabs__item) {
  padding: 0 20px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 14px !important;
}
:deep(.el-tabs__item.is-active) {
  color: #409eff !important;
  border-bottom: 2px solid #409eff !important;
}

.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.side-title {
  font-weight: bold;
  font-size: 16px;
}

.more-link {
  color: #409eff;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.more-link:hover {
  opacity: 0.8;
}

.empty-data {
  padding: 20px 0;
  text-align: center;
}

.assistant-text {
  color: #909399;
  font-size: 14px;
}

.notice-scroll-container, .policy-scroll-container {
  max-height: 180px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.notice-scroll-container::-webkit-scrollbar,
.policy-scroll-container::-webkit-scrollbar {
  width: 4px;
}

.notice-scroll-container::-webkit-scrollbar-track,
.policy-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.notice-scroll-container::-webkit-scrollbar-thumb,
.policy-scroll-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.notice-scroll-container::-webkit-scrollbar-thumb:hover,
.policy-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 去掉表格所有边框和横线 */
:deep(.el-table) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__inner-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table td),
:deep(.el-table th) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__row) {
  border: none !important;
}

:deep(.el-table__body-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__header-wrapper) {
  border: none !important;
}

:deep(.el-table__border-left-patch),
:deep(.el-table__border-bottom-patch) {
  display: none !important;
}

:deep(.el-table--border) {
  border: none !important;
}

:deep(.el-table--border::after) {
  display: none !important;
}

/* 去掉滚动容器和卡片的边框 */
.policy-scroll-container {
  border: none !important;
  border-bottom: none !important;
}

.notice-scroll-container {
  border: none !important;
  border-bottom: none !important;
}

/* 去掉Element Plus卡片的边框 */
.home-side .el-card {
  border: none !important;
  border-bottom: none !important;
}

.home-side .el-card__body {
  border: none !important;
  border-bottom: none !important;
}

/* 去掉表格外层容器的边框 */
:deep(.el-table__container) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__inner-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__body-wrapper) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__body) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__row:last-child) {
  border-bottom: none !important;
}

:deep(.el-table__row:last-child td) {
  border-bottom: none !important;
}

:deep(.el-table__body tr:last-child) {
  border-bottom: none !important;
}

:deep(.el-table__body tr:last-child td) {
  border-bottom: none !important;
}

:deep(.el-table__body .el-table__row:last-child) {
  border-bottom: none !important;
}

:deep(.el-table__body .el-table__row:last-child td) {
  border-bottom: none !important;
}

:deep(.el-table__body .el-table__row:last-child::after) {
  display: none !important;
}

:deep(.el-table__body .el-table__row:last-child::before) {
  display: none !important;
}

:deep(.el-table::after) {
  display: none !important;
}

/* 去掉所有可能的边框和分隔线 */
:deep(.el-table::before) {
  display: none !important;
}

:deep(.el-table__body-wrapper::after) {
  display: none !important;
}

:deep(.el-table__body-wrapper::before) {
  display: none !important;
}

:deep(.el-table__body tr) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__body td) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__body .el-table__row) {
  border: none !important;
  border-bottom: none !important;
}

:deep(.el-table__body .el-table__row td) {
  border: none !important;
  border-bottom: none !important;
}

/* 去掉表格行的所有伪元素边框 */
:deep(.el-table__row::after) {
  display: none !important;
}

:deep(.el-table__row::before) {
  display: none !important;
}

:deep(.el-table__body tr::after) {
  display: none !important;
}

:deep(.el-table__body tr::before) {
  display: none !important;
}

/* 去掉表格单元格的伪元素边框 */
:deep(.el-table td::after) {
  display: none !important;
}

:deep(.el-table td::before) {
  display: none !important;
}

/* 去掉表格容器的所有伪元素边框 */
:deep(.el-table__container::after) {
  display: none !important;
}

:deep(.el-table__container::before) {
  display: none !important;
}

:deep(.el-table__inner-wrapper::after) {
  display: none !important;
}

:deep(.el-table__inner-wrapper::before) {
  display: none !important;
}

/* 去掉表格行悬停时的背景色变化 */
:deep(.el-table__body tr:hover > td) {
  background-color: transparent !important;
}

:deep(.el-table__body tr:hover) {
  background-color: transparent !important;
}

:deep(.el-table__body .el-table__row:hover > td) {
  background-color: transparent !important;
}

:deep(.el-table__body .el-table__row:hover) {
  background-color: transparent !important;
}

/* 确保所有可能的悬停状态都被覆盖 */
:deep(.el-table tbody tr:hover) {
  background-color: transparent !important;
}

:deep(.el-table tbody tr:hover td) {
  background-color: transparent !important;
}
</style>
 