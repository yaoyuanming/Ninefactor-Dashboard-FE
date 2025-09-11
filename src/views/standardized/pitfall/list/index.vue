<template>
  <div class="pitfall-list-container">
    <!-- 整体卡片容器 -->
    <el-card class="main-card">
    <!-- 搜索筛选区域 -->
      <div class="filter-section">
      <el-form :inline="true" :model="filterForm" class="search-form">
        <el-form-item label="企业名称">
          <el-input 
            v-model="filterForm.deptName" 
            placeholder="请输入企业名称" 
            clearable 
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="整改状态">
          <el-select v-model="filterForm.rectConditionType" placeholder="请选择" clearable style="width: 150px;">
              <el-option
                v-for="(opt, idx) in rectStatusOptions"
                :key="idx"
                :label="opt.label"
                :value="opt.value"
              />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
            <RegionTreeSelect
              v-model="filterForm.areaCode"
              placeholder="请选择区域"
              clearable
              filterable
              style="width: 200px"
            />
        </el-form-item>
        <el-form-item label="隐患来源">
          <el-select v-model="filterForm.dangerSource" placeholder="请选择" clearable style="width: 150px;">
              <el-option
                v-for="(opt, idx) in dangerSourceOptions"
                :key="idx"
                :label="opt.label"
                :value="opt.value"
              />
          </el-select>
        </el-form-item>
        <el-form-item label="隐患等级">
          <el-select v-model="filterForm.dangerLevel" placeholder="请选择" clearable style="width: 150px;">
              <el-option
                v-for="(opt, idx) in dangerLevelOptions"
                :key="idx"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="国民经济类型">
            <el-cascader
              v-model="filterForm.industryType"
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
            <el-select v-model="filterForm.riskEnvTypes" placeholder="请选择" clearable multiple collapse-tags style="width: 180px;">
              <el-option
                v-for="(opt, idx) in riskEnvOptions"
                :key="idx"
                :label="opt.label"
                :value="opt.value"
              />
          </el-select>
        </el-form-item>
    
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            搜索
          </el-button>
          <el-button @click="resetFilter" :icon="Refresh">
            重置
          </el-button>
            <!-- <el-button @click="exportData" :icon="Upload">
            导出
            </el-button> -->
        </el-form-item>
      </el-form>
      </div>

    <!-- 数据表格 -->
      <div class="table-section">
      <el-table 
        :data="tableData" 
        style="width: 100%" 
        v-loading="loading"
        stripe
      >
        <el-table-column prop="inspectTime" label="检查日期" width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ formatDate(row.inspectTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="企业名称" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.deptName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="regionName" label="区域" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getAreaName(row.regionName) }}
          </template>
        </el-table-column>
        <el-table-column prop="dangerDesc" label="隐患描述" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.dangerDesc || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="dangerUrl" label="隐患图片" align="center" width="120">
          <template #default="scope">
            <el-image 
              v-if="scope.row.dangerUrl"
              :src="scope.row.dangerUrl.split(',')[0]"
              :preview-src-list="scope.row.dangerUrl.split(',')"
              fit="cover"
              style="width: 60px; height: 60px; cursor: pointer; border-radius: 6px;"
              :z-index="3000"
              :preview-teleported="true"
            >
              <template #error>
                <div style="display:flex;width:60px;height:60px;color:#ccc;align-items:center;justify-content:center;">
                  无图
                </div>
              </template>
            </el-image>
            <span v-else style="color:#ccc;">无图</span>
          </template>
        </el-table-column>
        <el-table-column prop="dangerLevel" label="隐患等级" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="row.dangerLevel === 10 ? 'danger' : 'success'"
              size="small"
            >
              {{ row.dangerLevel === 10 ? '重大隐患' : '一般隐患' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dangerSource" label="隐患来源" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ getDangerSourceName(row.dangerSource) }}
          </template>
        </el-table-column>
        <el-table-column prop="dangerAddress" label="隐患位置" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.dangerAddress || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rectChargeUserName" label="整改责任人" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.rectChargeUserName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="rectConditionType" label="整改状态" width="120">
          <template #default="{ row }">
            <el-tag 
              :type="getStatusTagType(row.rectConditionType)"
              size="small"
            >
              {{ (rectStatusOptions.find(o => o.value === row.rectConditionType)?.label) || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeLimit" label="整改期限" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span>
              {{ formatDate(row.timeLimit) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-link type="primary" :underline="false" @click="viewDetail(row)">详情</el-link>
              <el-link type="danger" :underline="false" @click="confirmDelete(row)">删除</el-link>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination-container"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Upload, Lightning } from '@element-plus/icons-vue'
import { getDangerRectPage, type DangerRectPageReqVO } from '@/api/standardization/pitfall'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { getIndustryTree } from '@/api/systemSettings/dataApplication/national'
import { getRegionTree } from '@/api/systemSettings/dataApplication/region'
import RegionTreeSelect from '@/components/common/RegionTreeSelect.vue'
import { categoryData } from 'element-china-category-data'
import { DangerRectApi } from '@/api/prt/dangerRect'

// 路由实例
const router = useRouter()

// 响应式数据
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 字典&树数据
const riskEnvOptions = ref(getIntDictOptions(DICT_TYPE.RISK_ENV_TYPE) || [])
const industryTree = ref<any[]>([])
const regionTree = ref<any[]>([])
const rectStatusOptions = ref(getIntDictOptions(DICT_TYPE.RECT_CONDITION_TYPE) || [])
const dangerSourceOptions = ref(getIntDictOptions(DICT_TYPE.DANGER_SOURCE) || [])
const dangerLevelOptions = ref(getIntDictOptions(DICT_TYPE.DANGER_LEVEL) || [])

// 行业树转换
const transformIndustryData = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map(item => ({
    label: item.name || item.industryName || item.label,
    value: item.code || item.industryCode || item.value || item.id,
    children: item.children ? transformIndustryData(item.children) : []
  }))
}

// 筛选表单
const filterForm = reactive({
  deptName: '',
  areaCode: '',
  dangerSource: '',
  dangerLevel: '',
  rectConditionType: '', // 默认全部
  industryType: [] as string[],
  riskEnvTypes: [] as string[]
})

// 加载行业树
const loadIndustryTree = async () => {
  const res = await getIndustryTree()
  if (res && Array.isArray(res)) {
    industryTree.value = transformIndustryData(res)
  }
}

// 区域树转换
const transformRegionData = (data: any[]): any[] => {
  if (!data || !Array.isArray(data)) return []
  return data.map(item => ({
    label: item.label || item.regionName,
    value: item.primaryId || item.id,
    children: item.children ? transformRegionData(item.children) : []
  }))
}

// 加载区域树
const loadRegionTree = async () => {
  const res = await getRegionTree()
  if (res && Array.isArray(res)) {
    regionTree.value = transformRegionData(res)
  }
}

// 获取表格数据
const fetchTableData = async () => {
  try {
    loading.value = true
    
    const params: DangerRectPageReqVO = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      deptName: filterForm.deptName || undefined,
      areaCode: filterForm.areaCode || undefined,
      dangerSource: filterForm.dangerSource || undefined,
      dangerLevel: filterForm.dangerLevel || undefined,
      rectConditionType: filterForm.rectConditionType,
      industryId: filterForm.industryType.length > 0 ? filterForm.industryType.join(',') : undefined,
      riskEnvTypes: Array.isArray(filterForm.riskEnvTypes) && filterForm.riskEnvTypes.length > 0 
        ? filterForm.riskEnvTypes.join(',') 
        : undefined
    }
    const response = await getDangerRectPage(params)
    tableData.value = response.list || []
    total.value = response.total || 0
    
  } catch (error) {
    console.error('获取隐患整改单列表失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchTableData()
}

// 处理国民经济类型选择变化
const handleIndustryChange = (value: string[]) => {
  filterForm.industryType = value
}

// 重置筛选
const resetFilter = () => {
  Object.assign(filterForm, {
    deptName: '',
    areaCode: '',
    dangerSource: '',
    dangerLevel: '',
    rectConditionType: '',
    industryType: [],
    riskEnvTypes: []
  })
  currentPage.value = 1
  fetchTableData()
}

// 导出数据
const exportData = () => {
  ElMessage.info('导出功能开发中...')
}

// 查看详情
const viewDetail = (row) => {
  console.log('查看详情:', row)
  router.push({ path: '/standardized/pitfall/detail', query: { id: row.id } })
}

// 删除
const confirmDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确认删除该隐患整改单吗？删除后不可恢复。', '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    // await DangerRectApi.deleteDangerRect(row.id)
    ElMessage.success('删除成功')
    fetchTableData()
  } catch (e) {
    // 取消或失败
  }
}

// 分页处理
const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchTableData()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchTableData()
}

// 工具函数
const getDangerSourceName = (source) => {
  const sourceMap = { 1: '企业日常检查', 2: '企业专项检查', 3: '政府专项检查', 4: '隐患速记' }
  return sourceMap[source] || '-'
}

const getStatusName = (status) => {
  const statusMap = { 5: '待整改', 6: '逾期未整改', 50: '整改完成' }
  return statusMap[status] || '-'
}

const getStatusTagType = (status) => {
  const typeMap = { 5: 'warning', 6: 'danger', 50: 'success' }
  return typeMap[status] || 'info'
}

const getAreaName = (regionName) => regionName || '-'

const isOverdue = (timeLimit) => {
  if (!timeLimit) return false
  const limitDate = new Date(timeLimit)
  const now = new Date()
  return limitDate < now
}

// 初始化
onMounted(() => {
  loadIndustryTree()
  loadRegionTree()
  fetchTableData()
})
</script>

<style lang="scss" scoped>
.pitfall-list-container {
  padding: 5px;
}

.main-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-section {
  margin-bottom: 16px;

.search-form {
  .el-form-item {
      margin-bottom: 12px;
      margin-right: 16px;
    }
    
    .el-form-item:last-child {
      margin-bottom: 8px;
      
      .el-button {
        margin-right: 8px;
      }
      
      .el-button:last-child {
        margin-right: 0;
      }
    }
  }
}

.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  
  .lightning-icon {
    color: #409eff;
    margin-left: 4px;
  }
  
  .overdue-date {
    color: #f56c6c;
  }
}

.pagination-container {
  margin-top: 16px;
  text-align: right;
}

:deep(.el-tabs__item) {
  font-size: 14px;
  
  .el-icon {
    margin-left: 4px;
  }
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  margin-top: 8px;
}
</style>