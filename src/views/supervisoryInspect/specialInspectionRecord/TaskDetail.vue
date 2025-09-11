<template>
  <div class="task-detail-container">
    <!-- 顶部操作栏 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">任务详情</span>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧：检查任务详情 -->
      <div class="left-panel">
        <div class="panel-title">检查任务详情</div>
        <div class="detail-item"><span class="label">专项检查任务标题：</span>{{ taskDetail.title }}</div>
        <div class="detail-item description-item">
          <span class="label">专项检查任务描述：</span>
          <span class="description-text">{{ taskDetail.desc }}</span>
        </div>
        <div class="detail-item"><span class="label">检查任务来源：</span>{{ taskDetail.source }}</div>
        <div class="detail-item"><span class="label">检查任务类型：</span>{{ taskDetail.type }}</div>
        <div class="detail-item"><span class="label">检查任务派发时间：</span>{{ taskDetail.dispatchTime }}</div>
        <div class="detail-item"><span class="label">检查开始时间：</span>{{ taskDetail.startTime }}</div>
        <div class="detail-item"><span class="label">检查结束时间：</span>{{ taskDetail.endTime }}</div>
      </div>

      <!-- 中间：检查企业清单 -->
      <div class="center-panel">
        <div class="panel-title">检查企业清单</div>
        <div class="search-bar">
          <el-input v-model="companySearch" placeholder="企业名称" size="small" style="width: 140px; margin-right: 8px;" />
          <!-- <el-select v-model="companyRegion" placeholder="区域" size="small" style="width: 100px; margin-right: 8px;">
            <el-option label="全部" value="" />
            <el-option label="区域A" value="A" />
            <el-option label="区域B" value="B" />
          </el-select> -->
          <el-button type="primary" size="small" @click="searchCompanies">搜索</el-button>
        </div>
        <el-scrollbar class="company-list-scroll" v-loading="companyLoading">
          <ul class="company-list">
            <li v-for="company in companyList" :key="company.id" :class="{active: company.id === selectedCompanyId}" @click="selectCompany(company.id)">
              {{ company.enterpriseName }}
            </li>
          </ul>
        </el-scrollbar>
      </div>

      <!-- 右侧：企业隐患清单 -->
      <div class="right-panel">
        <div class="panel-title">企业隐患清单</div>
        <div class="company-info">
          <span class="company-name">{{ selectedCompany.enterpriseName }}</span>
          <span class="stat">{{ selectedCompany.regionName }}</span>
          <span class="stat">{{ selectedCompany.riskLevel }}风险</span>
          <span class="stat">{{ selectedCompany.enterpriseScale }}</span>
          <span class="stat">负责人：{{ selectedCompany.principal }}</span>
          <span class="stat">信用代码：{{ selectedCompany.creditCode }}</span>
        </div>
        <div class="table-search-bar">
          <el-select v-model="dangerType" placeholder="隐患等级" size="small" style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option label="重大隐患" value="10" />
            <el-option label="一般隐患" value="5" />
          </el-select>
          <el-select v-model="dangerStatus" placeholder="整改状态" size="small" style="width: 100px;">
            <el-option label="全部" value="" />
            <el-option
              v-for="dict in rectStatusOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          <RegionTreeSelect
            v-model="regionId"
            placeholder="选择区域"
            size="small"
            style="width: 160px;"
            clearable
            popper-class="region-tree-popper"
          />
          <el-cascader
            v-model="industryType"
            :options="categoryData"
            :props="{
              checkStrictly: true
            }"
            placeholder="国民经济类型"
            size="small"
            style="width: 140px;"
            clearable
            @change="handleIndustryChange"
          />
          <el-select v-model="enterpriseScale" placeholder="企业规模" size="small" style="width: 110px;">
            <el-option
              v-for="dict in compScaleOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.label"
            />
          </el-select>
          <el-select 
            v-model="riskEnvTypes" 
            placeholder="高危环境类型" 
            size="small" 
            style="width: 130px;"
            multiple
            collapse-tags
          >
            <el-option
              v-for="dict in riskEnvOptions"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          <el-button type="primary" size="small" @click="searchDanger">搜索</el-button>
          <el-button size="small" @click="resetDanger">重置</el-button>
        </div>
        <el-table :data="filteredDangers" v-loading="dangerLoading" border size="small" style="margin-top: 8px;">
          <el-table-column prop="dangerDesc" label="隐患描述" min-width="180" show-overflow-tooltip />
          <el-table-column label="隐患等级" width="80" align="center">
            <template #default="{ row }">{{ row.dangerLevel === 10 ? '重大隐患' : row.dangerLevel === 5 ? '一般隐患' : '' }}</template>
          </el-table-column>
          <el-table-column label="隐患来源" width="80" align="center">
            <template #default="{ row }">{{ getDangerSourceText(row.dangerSource) }}</template>
          </el-table-column>
          <el-table-column prop="dangerAddress" label="隐患位置" width="100" align="center" />
          <el-table-column prop="rectChargeUserName" label="整改责任人" width="80" align="center" />
          <el-table-column label="整改状态" width="80" align="center">
            <template #default="{ row }">{{ getRectStatusText(row.rectConditionType) }}</template>
          </el-table-column>
          <el-table-column prop="timeLimit" label="整改期限" width="100" align="center" />
          <el-table-column prop="rectCompleteTime" label="整改完成时间" width="100" align="center" />
          <el-table-column label="整改照片" width="80" align="center">
            <template #default="{ row }">
              <el-image v-if="row.rectCompleteUrl" :src="row.rectCompleteUrl" :preview-src-list="[row.rectCompleteUrl]" style="width: 32px; height: 32px;" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ row }">
              <el-link type="primary" :underline="false" @click="viewDetail(row)">详情</el-link>
            </template>
          </el-table-column>
        </el-table>
        <div class="table-pagination">
          <el-pagination
            v-model:current-page="dangerPage.current"
            v-model:page-size="dangerPage.size"
            :total="dangerTotal"
            layout="prev, pager, next"
            small
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getInspectionTaskComList, getInspectionTask, type InspectionTaskComListReqVO } from '@/api/supervisoryInspect/taskDeploy'
import { getDangerRectPage, type DangerRectPageReqVO } from '@/api/standardization/risks'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import RegionTreeSelect from '@/components/common/RegionTreeSelect.vue'
import { categoryData } from 'element-china-category-data'

const router = useRouter()
const route = useRoute()
const handleBack = () => router.back()

// 获取路由参数中的 taskId
const taskId = computed(() => route.params.id as string)

// 任务详情
const taskDetail = reactive({
  title: '',
  desc: '',
  source: '',
  type: '',
  dispatchTime: '',
  startTime: '',
  endTime: ''
})

// 获取任务详情
const getTaskDetail = async () => {
  if (!taskId.value) return

  try {
    const response = await getInspectionTask(taskId.value)
    if (response) {
      taskDetail.title = response.taskTitle || ''
      taskDetail.desc = response.taskDescription || ''
      taskDetail.source = response.taskSource || ''
      taskDetail.type = response.taskType || ''
      taskDetail.dispatchTime = response.dispatchTime || ''
      taskDetail.startTime = response.inspectionStartTime || ''
      taskDetail.endTime = response.inspectionEndTime || ''
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    ElMessage.error('获取任务详情失败')
  }
}

// 企业清单
const companyList = ref([])
const companyLoading = ref(false)
const companySearch = ref('')
const companyRegion = ref('')
const selectedCompanyId = ref(null)

// 获取企业检查清单
const getCompanyList = async () => {
  if (!taskId.value) return

  companyLoading.value = true
  try {
    const params: InspectionTaskComListReqVO = {
      taskId: taskId.value,
      enterpriseName: companySearch.value || undefined,
      regionId: companyRegion.value || undefined,
      pageNo: '1',
      pageSize: '99' // 设置一个较大的页面大小来获取所有数据
    }

    const response = await getInspectionTaskComList(params)
    console.log('企业检查清单接口响应:', response)

    if (response && response.data && Array.isArray(response.data)) {
      companyList.value = response.data
      console.log('企业列表数据:', companyList.value)
      console.log('总数:', companyList.value.length)

      // 如果没有选中的企业，默认选中第一个
      if (!selectedCompanyId.value && response.data.length > 0) {
        selectedCompanyId.value = response.data[0].id
        console.log('默认选中企业ID:', selectedCompanyId.value)
        // 默认选中第一个企业后获取隐患数据
        setTimeout(() => {
          getDangerList()
        }, 100)
      }
    } else if (response && Array.isArray(response)) {
      // 如果直接返回数组
      companyList.value = response
      console.log('企业列表数据:', companyList.value)
      console.log('总数:', companyList.value.length)

      // 如果没有选中的企业，默认选中第一个
      if (!selectedCompanyId.value && response.length > 0) {
        selectedCompanyId.value = response[0].id
        console.log('默认选中企业ID:', selectedCompanyId.value)
        // 默认选中第一个企业后获取隐患数据
        setTimeout(() => {
          getDangerList()
        }, 100)
      }
    } else {
      companyList.value = []
      console.log('没有获取到企业数据')
    }
  } catch (error) {
    console.error('获取企业检查清单失败:', error)
    ElMessage.error('获取企业检查清单失败')
    companyList.value = []
  } finally {
    companyLoading.value = false
  }
}

// 搜索企业
const searchCompanies = () => {
  getCompanyList()
}

// 获取隐患整改单数据
const getDangerList = async () => {
  const currentCompany = selectedCompany.value
  if (!currentCompany.id) return

  dangerLoading.value = true
  try {
    const params: DangerRectPageReqVO = {
      pageNo: dangerPage.current.toString(),
      pageSize: dangerPage.size.toString(),
      inspectId: currentCompany.id, // 使用inspectId替代deptId
      rectConditionType: dangerStatus.value || undefined,
      dangerLevel: dangerType.value || undefined,
      regionId: regionId.value || undefined,
      industryId: industryType.value.length > 0 ? industryType.value.join(',') : undefined,
      enterpriseScale: enterpriseScale.value || undefined,
      riskEnvTypes: Array.isArray(riskEnvTypes.value) && riskEnvTypes.value.length > 0 ? riskEnvTypes.value.join(',') : undefined
    }

    const response = await getDangerRectPage(params)
    console.log('隐患整改单接口响应:', response)

    // 直接用后端返回
    allDangers.value = response?.list || []
  } catch (error) {
    console.error('获取隐患整改单失败:', error)
    ElMessage.error('获取隐患数据失败')
    allDangers.value = []
  } finally {
    dangerLoading.value = false
  }
}

// 获取隐患来源文本
const getDangerSourceText = (source: number) => {
  const sourceMap = {
    1: '企业日常检查',
    2: '企业专项检查',
    3: '政府专项检查',
    4: '隐患速记'
  }
  return sourceMap[source] || ''
}

// 获取整改状态文本
const getRectStatusText = (status: number) => {
  return getDictLabel(DICT_TYPE.RECT_CONDITION_TYPE, status) || ''
}

// 查看详情
const viewDetail = (row: any) => {
  router.push({ path: '/standardized/pitfall/detail', query: { id: row.id } })
}

// 选择企业
const selectCompany = (id: number) => {
  selectedCompanyId.value = id
  // 选择企业后获取隐患数据
  getDangerList()
}

// 当前选中的企业
const selectedCompany = computed(() => {
  return companyList.value.find(c => c.id === selectedCompanyId.value) || {
    enterpriseName: '',
    regionName: '',
    riskLevel: '',
    enterpriseScale: '',
    principal: '',
    creditCode: ''
  }
})

// 隐患清单
const allDangers = ref([])
const dangerLoading = ref(false)
const dangerType = ref('')
const dangerStatus = ref('')
const regionId = ref('')
const industryType = ref([] as string[])
const enterpriseScale = ref('')
const riskEnvTypes = ref([] as string[])
const dangerPage = reactive({ current: 1, size: 5, total: 5 })
const filteredDangersRaw = computed(() => {
  // 仅显示服务端返回的数据；筛选通过“搜索”触发服务端查询
  return allDangers.value
})

const filteredDangers = computed(() => {
  const list = filteredDangersRaw.value
  const start = (dangerPage.current - 1) * dangerPage.size
  return list.slice(start, start + dangerPage.size)
})
const dangerTotal = computed(() => filteredDangersRaw.value.length)
const searchDanger = () => {
  dangerPage.current = 1
  getDangerList()
}
const resetDanger = () => {
  dangerType.value = ''
  dangerStatus.value = ''
  regionId.value = ''
  industryType.value = []
  enterpriseScale.value = ''
  riskEnvTypes.value = []
  dangerPage.current = 1
  getDangerList()
}

// 处理国民经济类型选择变化
const handleIndustryChange = (value: string[]) => {
  industryType.value = value
}

// 企业规模字典
const compScaleOptions = computed(() => getIntDictOptions(DICT_TYPE.COMP_SCALE))

// 高危环境类型字典
const riskEnvOptions = computed(() => getIntDictOptions(DICT_TYPE.RISK_ENV_TYPE))

// 整改状态字典
const rectStatusOptions = computed(() => getIntDictOptions(DICT_TYPE.RECT_CONDITION_TYPE))

// 页面初始化
onMounted(async () => {
  await getTaskDetail()
  await getCompanyList()
})
</script>

<style scoped>
.task-detail-container {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 0 0 20px 0;
}

/* 区域选择下拉框样式 */
:deep(.region-tree-popper) {
  min-width: 400px !important;
  max-width: 500px !important;
}

:deep(.region-tree-popper .el-tree) {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

:deep(.region-tree-popper .el-tree-node__content) {
  height: 36px;
  line-height: 36px;
  padding: 0 8px;
}

:deep(.region-tree-popper .el-tree-node__label) {
  font-size: 14px;
  white-space: nowrap;
  overflow: visible !important;
  text-overflow: clip !important;
  max-width: none !important;
  width: auto !important;
  min-width: 0 !important;
}

:deep(.region-tree-popper .el-tree-node__expand-icon) {
  margin-right: 8px;
}

:deep(.region-tree-popper .el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

/* 确保树节点有足够的宽度 */
:deep(.region-tree-popper .el-tree-node) {
  width: 100% !important;
  min-width: 0 !important;
}

/* 确保树容器有足够的宽度 */
:deep(.region-tree-popper .el-tree) {
  width: 100% !important;
  min-width: 0 !important;
}

.top-action-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.action-divider {
  width: 1px;
  height: 16px;
  background: #e4e7ed;
  margin: 0 8px;
}
.action-text {
  color: #333;
  font-size: 14px;
}
.main-content {
  display: flex;
  gap: 12px;
  height: calc(100vh - 70px);
}
.left-panel, .center-panel, .right-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.left-panel {
  width: 260px;
  min-width: 220px;
  max-width: 300px;
}
.center-panel {
  width: 220px;
  min-width: 180px;
  max-width: 260px;
  align-items: stretch;
}
.right-panel {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.panel-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 12px;
  color: #333;
}
.detail-item {
  margin-bottom: 10px;
  font-size: 13px;
  color: #444;
}
.detail-item .label {
  color: #888;
}

.description-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.description-item .label {
  flex-shrink: 0;
}

.description-text {
  word-wrap: break-word;
  word-break: break-all;
  white-space: pre-wrap;
  line-height: 1.4;
  max-width: 100%;
  overflow-wrap: break-word;
}
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.company-list-scroll {
  height: 420px;
}
.company-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.company-list li {
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 3px;
  margin-bottom: 2px;
  font-size: 13px;
  color: #333;
  transition: background 0.2s;
}
.company-list li.active, .company-list li:hover {
  background: #e6f7ff;
  color: #409eff;
}
.company-info {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
}
.company-name {
  font-weight: 600;
  color: #409eff;
}
.stat {
  font-size: 13px;
  color: #888;
}
.table-search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  flex-wrap: wrap;
  gap: 8px;
}
.company-pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.table-pagination {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
}
</style>
