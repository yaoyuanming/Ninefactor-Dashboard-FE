<template>
  <div class="risk-detail">
    <el-form inline>
      <!-- <el-form-item label="区域">
        <RegionTreeSelect
          v-model="detailsFilterForm.areaId"
          placeholder="请选择区域"
          clearable
          filterable
          style="width: 200px"
        />
      </el-form-item> -->
      <el-form-item label="管控行业类型">
        <el-cascader
          v-model="detailsFilterForm.controlId"
          :options="controlTreeData"
          :props="{
            checkStrictly: true,
            value: 'id',
            label: 'name',
            children: 'children'
          }"
          placeholder="请选择管控行业类型"
          clearable
          style="width: 200px"
          @change="handleControlTypeChange"
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
      <el-table-column prop="name" label="企业名称"  />
  
      <el-table-column prop="areaName" label="区域" />
      <el-table-column prop="dynamicRiskLevel" label="动态风险等级">
        <template #default="{ row }">
          <el-tag
            v-if="row.dynamicRiskLevel == 4"
            style="background: #c7d3f5; border: 1px solid blue;color: #434343;"
          >
            {{ getRiskLevelText(String(row.dynamicRiskLevel)) }}
          </el-tag>
          <el-tag
            v-if="row.dynamicRiskLevel == 3"
            style="background: #F0E68C; border: 1px solid #bab25b;color: #434343;"
          >
            {{ getRiskLevelText(String(row.dynamicRiskLevel)) }}
          </el-tag>
          <el-tag
            v-if="row.dynamicRiskLevel == 2"
            style="background: #fff0da; border: 1px solid orange;color: #434343;"
          >
            {{ getRiskLevelText(String(row.dynamicRiskLevel)) }}
          </el-tag>
          <el-tag
            v-if="row.dynamicRiskLevel == 1"
            style="background: #f6d4cd; border: 1px solid red;color: #434343;"
          >
            {{ getRiskLevelText(String(row.dynamicRiskLevel)) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="riskPointTotal" label="风险点总数" />
      <!-- <el-table-column prop="riskInspectionRate" label="风险巡查到位率">
        <template #default="{ row }">{{ row.inspectionCoverageRate }}</template>
      </el-table-column> -->
      <el-table-column prop="riskControlMeasures" label="风险管控措施数" />
      <el-table-column prop="majorRiskPoints" label="重大风险点数量" />
      <el-table-column prop="significantRiskPoints" label="较大风险点数量" />
      <el-table-column prop="generalRiskPoints" label="一般风险点数量" />
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
import { getCompanyRiskPage } from '@/api/screen'
import { getControlTree } from '@/api/enterpriseArchives'
import RegionTreeSelect from '@/components/common/RegionTreeSelect.vue'

const router = useRouter()

const controlTreeData = ref([])
const riskEnvOptions = ref([
  { label: '不涉及', value: '0' },
  { label: '有限空间', value: '5' },
  { label: '涉爆粉尘', value: '1' },
  { label: '涉氨制冷', value: '3' }
])
const riskLevelOptions = ref([
  { label: '重大风险', value: '1' },
  { label: '较大风险', value: '2' },
  { label: '一般风险', value: '3' },
  { label: '低风险', value: '4' }
])

const detailsFilterForm = reactive({
  areaId: '',
  controlId: [], // 改为数组
  level: '',
  enterpriseName: '',
  riskEnvType: '',
})

const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const transformIndustryData = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map(item => ({
    label: item.name || item.industryName || item.label,
    value: item.code || item.industryCode || item.value || item.id,
    children: item.children ? transformIndustryData(item.children) : []
  }))
}

const fetchControlTree = async () => {
  try {
    const response = await getControlTree()
    controlTreeData.value = response || []
  } catch (error) {
    console.error('获取管控行业树失败:', error)
  }
}

const handleControlTypeChange = (value) => {
  console.log('选择的管控行业ID:', value)
  // 可以在这里添加其他处理逻辑
}

const loadDetailData = async () => {
  const params = {
    pageNo: pagination.currentPage.toString(),
    pageSize: pagination.pageSize.toString(),
    infoStatus: 1,
    name: detailsFilterForm.enterpriseName || undefined,
    areaId: detailsFilterForm.areaId || undefined,
    riskLevel: detailsFilterForm.level || undefined,
    controlId: detailsFilterForm.controlId && detailsFilterForm.controlId.length > 0 ? detailsFilterForm.controlId.join(',') : undefined,
    riskEnvTypes: detailsFilterForm.riskEnvType && detailsFilterForm.riskEnvType.length > 0 
      ? detailsFilterForm.riskEnvType.join(',') 
      : undefined
  }
  
  const res = await getCompanyRiskPage(params)
  
  tableData.value = res?.records ?? []
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
  detailsFilterForm.areaId = ''
  detailsFilterForm.controlId = [] // 重置为空数组
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

const goToEnterpriseDetail = (id: string) => {
  router.push('/enterpriseArchives/basic/' + id + '?tab=risk')
}

onMounted(async () => {
  await fetchControlTree()
  await loadDetailData()
})
</script>

<style scoped>
.risk-detail { width: 100%; height: 100%; }
</style> 