<template>
  <div class="risk-detail">
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
      <el-form-item label="风险等级">
        <el-select v-model="detailsFilterForm.level" placeholder="请选择" clearable style="width: 200px">
          <el-option
            v-for="(opt, idx) in riskLevelOptions"
            :key="idx"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="企业名称">
        <el-input v-model="detailsFilterForm.enterpriseName" placeholder="请输入企业名称" style="width: 200px" />
      </el-form-item>
      <el-form-item label="所涉高危环境类型">
        <el-select v-model="detailsFilterForm.riskEnvType" placeholder="请选择高危环境类型" clearable style="width: 200px" multiple collapse-tags>
          <el-option
            v-for="(opt, idx) in riskEnvOptions"
            :key="idx"
            :label="opt.label"
            :value="opt.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleDetailSearch">搜索</el-button>
        <el-button @click="handleDetailReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="enterpriseName" label="企业名称">
        <template #default="{ row }">
          <el-link type="primary" @click="goToEnterpriseDetail(row.id)">
            {{ row.enterpriseName }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="regionName" label="区域" />
      <el-table-column prop="dynamicRiskLevel" label="动态风险等级">
        <template #default="{ row }">
          <el-tag
            v-if="row.riskLevel == 2"
            style="background: #c7d3f5; border: 1px solid blue;color: #434343;"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="row.riskLevel == 5"
            style="background: #F0E68C; border: 1px solid #bab25b;color: #434343;"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="row.riskLevel == 8"
            style="background: #fff0da; border: 1px solid orange;color: #434343;"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, row.riskLevel) }}
          </el-tag>
          <el-tag
            v-if="row.riskLevel == 10"
            style="background: #f6d4cd; border: 1px solid red;color: #434343;"
          >
            {{ getDictLabel(DICT_TYPE.RISKLEVEL, row.riskLevel) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalRiskPoints" label="风险点总数" />
      <el-table-column prop="inspectionCoverageRate" label="风险巡查到位率">
        <template #default="{ row }">{{ row.inspectionCoverageRate }}</template>
      </el-table-column>
      <el-table-column prop="controlMeasuresCount" label="风险管控措施数" />
      <el-table-column prop="highRiskPoints" label="重大风险点数量" />
      <el-table-column prop="mediumHighRiskPoints" label="较大风险点数量" />
      <el-table-column prop="mediumRiskPoints" label="一般风险点数量" />
      <el-table-column prop="lowRiskPoints" label="低风险点数量" />
    </el-table>
    <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
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
import { useRouter } from 'vue-router'
import { getRiskControlDetail } from '@/api/standardization/risks'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'
import { getIndustryTree } from '@/api/systemSettings/dataApplication/national'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { categoryData, CodeToText, TextToCode } from 'element-china-category-data'

const router = useRouter() // 路由

const regionTree = ref<any[]>([])
const industryTree = ref<any[]>([])
const riskEnvOptions = ref(getIntDictOptions(DICT_TYPE.RISK_ENV_TYPE) || [])
const riskLevelOptions = ref(getIntDictOptions(DICT_TYPE.RISKLEVEL) || [])

const detailsFilterForm = reactive({
  region: '',
  industryId: '',
  level: '',
  enterpriseName: '',
  riskEnvType: '',
  industryType: [] as string[]
})

const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const transformRegionData = (data: any[]) => {
  if (!data || !Array.isArray(data)) return []
  return data.map(item => ({
    primaryId: item.primaryId || item.id,
    regionName: item.label || item.regionName,
    children: item.children ? transformRegionData(item.children) : []
  }))
}
const transformIndustryData = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map(item => ({
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
  // 构建查询参数，将 riskEnvType 数组转换为逗号分隔的字符串
  const params = {
    pageNo: pagination.currentPage.toString(),
    pageSize: pagination.pageSize.toString(),
    regionId: detailsFilterForm.region || undefined,
    riskLevel: detailsFilterForm.level,
    enterpriseName: detailsFilterForm.enterpriseName,
    industryId: detailsFilterForm.industryId || undefined,
    riskEnvTypes: Array.isArray(detailsFilterForm.riskEnvType) && detailsFilterForm.riskEnvType.length > 0 
      ? detailsFilterForm.riskEnvType.join(',') 
      : undefined
  }
  
  const res = await getRiskControlDetail(params)
  tableData.value = res?.list ?? []
  pagination.total = res?.total || 0
}

const getRiskLevelText = (level: string) => {
  switch (level) {
    case '1': return '重大风险'
    case '2': return '较大风险'
    case '3': return '一般风险'
    case '4': return '低风险'
    default: return '待评级'
  }
}
const getRiskLevelTagType = (level: string) => {
  switch (level) {
    case '1': return 'danger'
    case '2': return 'warning'
    case '3': return 'info'
    case '4': return 'success'
    default: return ''
  }
}

const handleDetailSearch = () => loadDetailData()
const handleDetailReset = () => {
  detailsFilterForm.region = ''
  detailsFilterForm.industryId = ''
  detailsFilterForm.level = ''
  detailsFilterForm.enterpriseName = ''
  detailsFilterForm.riskEnvType = []
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

const handleIndustryChange = (value: string[]) => {
  detailsFilterForm.industryId = value.join(',')
}

const goToEnterpriseDetail = (id: string) => {
  router.push('/enterpriseArchives/basic/' + id + '?tab=risk')
}

onMounted(async () => {
  await loadTrees()
  await loadDetailData()
})
</script>

<style scoped>
.risk-detail { width: 100%; height: 100%; }
</style> 