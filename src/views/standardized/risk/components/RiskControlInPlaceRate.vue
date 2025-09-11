<template>
  <div class="risk-detail">
    <div class="stat-card">
      <h3 class="stat-title">风险巡查到位率</h3>
      <div class="stat-content">
        <div class="main-value">{{ comparisons.mainValue }}%</div>
        <div class="comparison-items">
          <div class="comparison-item" :class="comparisons.trend">
            <span
              >{{ comparisons.label }} {{ comparisons.trend === 'up' ? '▲' : '▼'
              }}{{ comparisons.value }}%</span
            >
          </div>
        </div>
      </div>
    </div>

    <el-form inline>
      <el-form-item label="区域">
        <el-tree-select
          v-model="detailsFilterForm.region"
          :data="regionTree"
          :props="{ label: 'regionName', value: 'primaryId', children: 'children' }"
          check-strictly
          default-expand-all
          placeholder="请选择区域"
          value-key="primaryId"
          clearable
          filterable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="企业名称">
        <el-input
          v-model="detailsFilterForm.enterpriseName"
          placeholder="请输入企业名称"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleDetailSearch">搜索</el-button>
        <el-button @click="handleDetailReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="enterpriseName" label="企业名称" />
      <el-table-column prop="regionName" label="区域" />
      <el-table-column prop="inspectionCoverageRate" label="风险巡查到位率">
        <template #default="{ row }">{{ row.inspectionCoverageRate }}</template>
      </el-table-column>
    </el-table>
    <div style="margin-top: 12px; display: flex; justify-content: flex-end">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { getRiskControlDetail } from '@/api/standardization/risks'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'
import { getIndustryTree } from '@/api/systemSettings/dataApplication/national'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getDangerStatisticsDayList } from '@/api/screen'
import dayjs from 'dayjs'

const regionTree = ref<any[]>([])
const industryTree = ref<any[]>([])
const riskEnvOptions = ref(getIntDictOptions(DICT_TYPE.RISK_ENV_TYPE) || [])
const riskLevelOptions = ref(getIntDictOptions(DICT_TYPE.RISKLEVEL) || [])

const comparisons = reactive({ label: '同比前一天', mainValue: '0', value: '0', trend: 'up' })

const detailsFilterForm = reactive({
  region: '',
  industryId: '',
  level: '',
  enterpriseName: '',
  riskEnvType: '' as string
})

const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const transformRegionData = (data: any[]) => {
  if (!data || !Array.isArray(data)) return []
  return data.map((item) => ({
    primaryId: item.primaryId || item.id,
    regionName: item.label || item.regionName,
    children: item.children ? transformRegionData(item.children) : []
  }))
}
const transformIndustryData = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map((item) => ({
    label: item.name || item.industryName || item.label,
    value: item.code || item.industryCode || item.value || item.id,
    children: item.children ? transformIndustryData(item.children) : []
  }))
}

const loadTrees = async () => {
  const regionRes = await getRegionTree()
  if (regionRes) regionTree.value = transformRegionData(regionRes)
  const industryRes = await getIndustryTree()
  if (industryRes) industryTree.value = transformIndustryData(industryRes)
}

const loadDetailData = async () => {
  const res = await getRiskControlDetail({
    pageNo: pagination.currentPage.toString(),
    pageSize: pagination.pageSize.toString(),
    regionId: detailsFilterForm.region || undefined,
    riskLevel: detailsFilterForm.level,
    enterpriseName: detailsFilterForm.enterpriseName,
    industryId: detailsFilterForm.industryId || undefined,
    riskEnvTypes: detailsFilterForm.riskEnvType || undefined
  })
  tableData.value = res?.list ?? []
  pagination.total = res?.total || 0
}

const getRiskLevelText = (level: string) => {
  switch (level) {
    case '1':
      return '重大风险'
    case '2':
      return '较大风险'
    case '3':
      return '一般风险'
    case '4':
      return '低风险'
    default:
      return '待评级'
  }
}
const getRiskLevelTagType = (level: string) => {
  switch (level) {
    case '1':
      return 'danger'
    case '2':
      return 'warning'
    case '3':
      return 'info'
    case '4':
      return 'success'
    default:
      return ''
  }
}

const handleDetailSearch = () => loadDetailData()
const handleDetailReset = () => {
  detailsFilterForm.region = ''
  detailsFilterForm.industryId = ''
  detailsFilterForm.level = ''
  detailsFilterForm.enterpriseName = ''
  detailsFilterForm.riskEnvType = ''
  loadDetailData()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadDetailData()
}

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val
  loadDetailData()
}

const getData = () => {
  const utcDate = dayjs().format('YYYY-MM-DD')
  getDangerStatisticsDayList({
    endDate: utcDate
  }).then((res) => {
    const today = res?.[res.length - 1]
    const yesterday = res?.[res.length - 2]
    const todayNumber = Number(today.inspectionRate) || 0
    const yesterdayNumber = Number(yesterday.inspectionRate) || 0
    debugger
    comparisons.mainValue = todayNumber.toFixed(2)
    if (todayNumber - yesterdayNumber > 0) {
      comparisons.trend = 'up'
      comparisons.value = (todayNumber - yesterdayNumber).toFixed(2)
    } else {
      comparisons.trend = 'down'
      comparisons.value = (yesterdayNumber - todayNumber).toFixed(2)
    }
  })
}

onMounted(async () => {
  await loadTrees()
  await loadDetailData()
  await getData()
})
</script>

<style lang="scss" scoped>
.risk-detail {
  width: 100%;
  height: 100%;
}
.stat-card {
  width: 380px;
  background: white;
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 20px;
  background: #f3f3f3;

  .stat-title {
    font-size: 16px;
    color: #333;
    margin-bottom: 16px;
    font-weight: 500;
  }
  .stat-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .main-value {
    font-size: 32px;
    font-weight: 700;
    color: #000;
  }
  .comparison-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .comparison-item {
    display: flex;
    align-items: center;
    font-size: 14px;
  }
  .up {
    color: #48bb78;
  }
  .down {
    color: #f56565;
  }
}
</style> 