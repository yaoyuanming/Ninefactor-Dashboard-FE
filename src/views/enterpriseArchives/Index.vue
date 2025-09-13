<template>
  <div class="enterprise-manage-container">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="0" class="stats-container stats-grid">
      <el-col :span="3">
        <el-statistic title="企业总数" :value="statistics?.totalCount ?? 0" class="stat-card" />
      </el-col>
      <el-col :span="3">
        <el-statistic title="已上报企业数" :value="statistics?.reportedCount ?? 0" class="stat-card" />
      </el-col>
      <el-col :span="3">
        <el-statistic title="未上报企业数" :value="statistics?.notReportedCount ?? 0" class="stat-card" />
      </el-col>
      <el-col :span="3">
        <el-statistic title="规上企业" :value="getScaleCount('规上企业')" class="stat-card" />
      </el-col>
      <el-col :span="3">
        <el-statistic title="中等企业" :value="getScaleCount('中等企业')" class="stat-card" />
      </el-col>
      <!-- <el-col :span="3">
        <el-statistic title="小型企业" :value="getScaleCount('小型企业')" class="stat-card" />
      </el-col> -->
      <el-col :span="3">
        <el-statistic title="小微企业" :value="getScaleCount('小微企业')" class="stat-card" />
      </el-col>
    </el-row>

    <!-- 搜索筛选区域 -->
    <el-card class="filter-container">
      <el-form :inline="true" :model="filterForm" class="search-box">
        <el-form-item label="企业名称">
          <el-input v-model="filterForm.enterpriseName" placeholder="请输入企业名称" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item label="区域">
          <RegionTreeSelect
            v-model="filterForm.areaId"
            placeholder="请选择区域"
            clearable
            filterable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="管控行业类型">
          <el-cascader
            v-model="filterForm.controlId"
            :options="controlTreeData"
            :props="{
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children'
            }"
            placeholder="请选择管控行业类型"
            clearable
            style="width: 200px;"
            @change="handleControlTypeChange"
          />
        </el-form-item>
        <el-form-item label="整体风险等级">
          <el-select
            clearable
            @change="handleQuery"
            v-model="filterForm.riskLevel"
            placeholder="请选择"
            class="!w-240px"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in riskLevelOptions"
              :key="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
          <!-- <el-button>导入</el-button>
          <el-button>导出</el-button> -->
        </el-form-item>
      </el-form>

      <el-table :data="enterpriseData" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="企业名称" min-width="260" />
        <el-table-column prop="creditCode" label="统一信用代码" width="180" />
        <el-table-column prop="areaName" label="区域" min-width="120">
          <template #default="{ row }">
            {{ row.areaName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="controlName" label="管控行业类型" width="220">
          <template #default="{ row }">
            {{ row.controlName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="citySupervisionDepartment" label="市级监管部门" min-width="150">
          <template #default="{ row }">
            {{ row.citySupervisionDepartment || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="整体风险等级" width="120" align="center" prop="dynamicRiskLevel">
          <template #default="scope">
            <el-tag
              v-if="scope.row.dynamicRiskLevel == 1"
              style="background: #c7d3f5; border: 1px solid blue;color: #434343;"
            >
              {{ getRiskLevelLabel(scope.row.dynamicRiskLevel) }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.dynamicRiskLevel == 2"
              style="background: #F0E68C; border: 1px solid #bab25b;color: #434343;"
            >
              {{ getRiskLevelLabel(scope.row.dynamicRiskLevel) }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.dynamicRiskLevel == 3"
              style="background: #fff0da; border: 1px solid orange;color: #434343;"
            >
              {{ getRiskLevelLabel(scope.row.dynamicRiskLevel) }}
            </el-tag>
            <el-tag
              v-else-if="scope.row.dynamicRiskLevel == 4"
              style="background: #f6d4cd; border: 1px solid red;color: #434343;"
            >
              {{ getRiskLevelLabel(scope.row.dynamicRiskLevel) }}
            </el-tag>
            <span v-else style="color: #999;">--</span>
          </template>
        </el-table-column>
        <el-table-column prop="controlManager" label="主要负责人" width="120">
          <template #default="{ row }">
            {{ row.controlManager || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseScale" label="企业规模" width="120">
          <template #default="{ row }">
            <span style="color: #333;">{{ row.enterpriseScale || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="最近填报时间" width="180">
          <template #default="{ row }">
            {{ row.updateTime ? formatDate(row.updateTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最近登录时间" width="180">
          <template #default="{ row }">
            {{ row.lastLoginTime ? formatDate(row.lastLoginTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="企业状态" width="100">
          <template #default="{}">
            <el-tag type="success" effect="plain">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="operation-buttons">
              <el-button type="primary" link size="small" @click="viewInfo(row)">企业信息</el-button>
              <el-button type="primary" link size="small" @click="modifyInfo(row)">修改信息</el-button>
              <el-dropdown>
                <el-button type="primary" link size="small" class="more-btn">
                  更多<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <!-- <el-dropdown-item @click="modifyInfo(row)">企业信息修改</el-dropdown-item> -->
                    <!-- <el-dropdown-item @click="resetPassword(row)">重置密码</el-dropdown-item>
                    <el-dropdown-item @click="lockAccount(row)">关闭账号</el-dropdown-item> -->
                    <el-dropdown-item @click="unlockAccount(row)">解除锁定</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
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
    </el-card>

    <!-- 修改行业监管部门弹窗 -->
    <el-dialog
      title="修改行业监管部门"
      v-model="showDeptDialog"
      width="800px"
      top="10vh"
      class="large-dept-dialog"
      :before-close="() => { showDeptDialog = false; selectedDeptIds = []; }"
    >
      <el-form :model="currentRow" label-width="100px">
        <el-form-item label="行业监管部门">
          <el-tree-select
            v-model="selectedDeptIds"
            :data="deptTreeData"
            placeholder="请选择行业监管部门"
            style="width: 100%;"
            filterable
            multiple
            collapse-tags
            collapse-tags-tooltip
            :props="{
              children: 'children',
              label: 'label',
              value: 'id'
            }"
            node-key="id"
            show-checkbox
            check-strictly
            :max-height="250"
            popper-class="dept-tree-select-dropdown"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDeptDialog = false; selectedDeptIds = [];">取消</el-button>
          <el-button type="primary" @click="handleDeptUpdate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCompanyPage, type CompanyPageReqVO, updateCompany,getCompanyStatistics, getControlTree } from '@/api/enterpriseArchives'
import { formatDate } from '@/utils/formatTime'
import { getSimpleDeptList } from '@/api/system/dept'
// import { categoryData, CodeToText, TextToCode } from 'element-china-category-data'
import RegionTreeSelect from '@/components/common/RegionTreeSelect.vue'

const router = useRouter()

// 筛选表单
const filterForm = reactive({
  enterpriseName: '',
  areaId: '', // 改为 areaId
  riskLevel: '',
  controlId: [] // 改为 controlId
})

// 添加管控行业树数据
const controlTreeData = ref([])

// 获取管控行业树数据
const fetchControlTree = async () => {
  try {
    const response = await getControlTree()
    controlTreeData.value = response || []
  } catch (error) {
    console.error('获取管控行业树失败:', error)
    ElMessage.error('获取管控行业树失败')
  }
}

// 处理管控行业类型变化
const handleControlTypeChange = (value) => {
  console.log('选择的管控行业ID:', value)
  // 可以在这里添加其他处理逻辑
}

// 定义组件参数
const props = defineProps({
  // 标题文本
  enterpriseScale: {
    type: String,
    default: ''
  },
})

// 企业数据
const enterpriseData = ref([])

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// 统计数据
const statistics = ref<any | null>(null)

// 风险标签类型
const getRiskTagType = (risk) => {
  if (!risk) return 'danger'
  const map = {
    重大风险: 'danger',
    一般风险: 'warning'
  }
  return map[risk] || 'info'
}

// 从 enterpriseScaleStatistics 获取对应规模的数量
const getScaleCount = (scaleName: string) => {
  const list = statistics.value?.enterpriseScaleStatistics || []
  const item = list.find((i: any) => i.scaleName === scaleName)
  return item?.count ?? 0
}

// 获取企业数据
const fetchEnterpriseData = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const params: CompanyPageReqVO = {
      pageNo: currentPage.value.toString(),
      pageSize: pageSize.value.toString(),
      enterpriseName: filterForm.enterpriseName || undefined,
      enterpriseScale: props.enterpriseScale || undefined,
      areaId: filterForm.areaId || undefined, // 改为 areaId
      riskLevel: filterForm.riskLevel || undefined,
      controlId: filterForm.controlId.length > 0 ? filterForm.controlId.join(',') : undefined // 修改为 controlId
    }

    // 调用API接口
    const response = await getCompanyPage(params)

    if (response && response.records) {
      enterpriseData.value = response.records
      total.value = response.total || 0
    } else {
      enterpriseData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取企业数据失败:', error)
    ElMessage.error('获取企业数据失败，请稍后重试')
    enterpriseData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await getCompanyStatistics()
    statistics.value = res
  } catch (e) {
    ElMessage.error('获取企业统计信息失败')
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  fetchEnterpriseData()
}

// 重置筛选
const resetFilter = () => {
  filterForm.enterpriseName = ''
  filterForm.areaId = '' 
  filterForm.riskLevel = ''
  filterForm.controlId = [] // 重置 controlId
  currentPage.value = 1
  fetchEnterpriseData()
}

// 处理国民经济类型变化
const handleIndustryChange = (value) => {
  filterForm.industryType = value
}

// 操作处理函数
const viewInfo = (row) => {
  router.push('/enterpriseArchives/basic/' + row.id)
}
const viewCredit = (row) => {
  /* 查看企业信用信息实现 */
}

const showDeptDialog = ref(false)
const currentRow = ref(null)
const selectedDeptIds = ref([])
const deptTreeData = ref([])
const deptOptions = ref([]) // 新增：用于存储部门选项

// 将平铺数据转换为树形结构
const convertToTreeData = (flatData) => {
  const treeData = []
  const map = {}
  
  // 先创建所有节点的映射
  flatData.forEach(item => {
    map[item.id] = {
      id: Number(item.id),
      label: item.name,
      children: []
    }
  })
  
  // 构建树形结构
  flatData.forEach(item => {
    const node = map[item.id]
    if (item.parentId === 0 || !item.parentId) {
      // 根节点
      treeData.push(node)
    } else {
      // 子节点
      const parent = map[item.parentId]
      if (parent) {
        parent.children.push(node)
      } else {
        // 如果找不到父节点，作为根节点处理
        treeData.push(node)
      }
    }
  })
  
  return treeData
}

// 根据部门ID获取部门名称（支持多个部门）
const getDeptNameById = (deptId) => {
  if (!deptId || !deptOptions.value.length) return null
  
  // 如果是逗号分隔的多个ID
  if (typeof deptId === 'string' && deptId.includes(',')) {
    const deptIds = deptId.split(',').map(id => Number(id.trim())).filter(id => id)
    const deptNames = deptIds.map(id => {
      const dept = deptOptions.value.find(item => item.id === id)
      return dept ? dept.name : null
    }).filter(name => name)
    return deptNames.join(', ')
  }
  
  // 单个ID的情况
  const dept = deptOptions.value.find(item => item.id === Number(deptId))
  return dept ? dept.name : null
}

// 获取监管部门树数据
const fetchDeptTreeData = async () => {
  try {
    const response = await getSimpleDeptList()
    if (response) {
      // 转换为树形结构数据
      deptTreeData.value = convertToTreeData(response)
      // 同时保留平铺数据用于表格显示
      deptOptions.value = response.map(item => ({
        id: Number(item.id),
        name: item.name
      }))
    }
  } catch (error) {
    console.error('获取监管部门数据失败:', error)
    ElMessage.error('获取监管部门数据失败')
  }
}

const modifyInfo = (row) => {
  currentRow.value = row
  // 处理多选数据回显，将逗号分隔的字符串转换为数组
  if (row.regulatoryDepartmentId) {
    selectedDeptIds.value = row.regulatoryDepartmentId.split(',').map(id => Number(id.trim())).filter(id => id)
  } else {
    selectedDeptIds.value = []
  }
  console.log('当前企业监管部门IDs:', row.regulatoryDepartmentId, '转换后:', selectedDeptIds.value)
  showDeptDialog.value = true
}

async function handleDeptUpdate() {
  if (!selectedDeptIds.value || selectedDeptIds.value.length === 0) {
    ElMessage.warning('请选择监管部门')
    return
  }
  
  try {
    // 将数组转换为逗号分隔的字符串
    const regulatoryDepartmentIdStr = selectedDeptIds.value.join(',')
    
    // 构建完整的更新参数，保留原有数据，只更新 regulatoryDepartmentId
    const updateData = {
      id: currentRow.value.id,
      enterpriseName: currentRow.value.enterpriseName || '',
      creditCode: currentRow.value.creditCode || '',
      areaId: currentRow.value.areaId,
      industryId: currentRow.value.industryId,
      regulatoryDepartmentId: regulatoryDepartmentIdStr, // 更新为逗号分隔的字符串
      riskLevel: currentRow.value.riskLevel,
      principal: currentRow.value.principal,
      principalId: currentRow.value.principalId,
      enterpriseScale: currentRow.value.enterpriseScale,
      lastReportTime: currentRow.value.lastReportTime,
      lastLoginTime: currentRow.value.lastLoginTime,
      status: currentRow.value.status || 1, // 默认正常状态
      longitude: currentRow.value.longitude,
      latitude: currentRow.value.latitude,
      registerAddress: currentRow.value.registerAddress,
      productionAddress: currentRow.value.productionAddress,
      businessScope: currentRow.value.businessScope,
      licenseAnnex: currentRow.value.licenseAnnex,
      employeeCount: currentRow.value.employeeCount,
      lastYearRevenue: currentRow.value.lastYearRevenue
    }
    
    await updateCompany(updateData)
    ElMessage.success('修改成功')
    showDeptDialog.value = false
    selectedDeptIds.value = []
    // 重新刷新表格数据
    handleSearch && handleSearch()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('修改失败，请重试')
  }
}

const resetPassword = (row) => {
  /* 重置密码实现 */
}
const lockAccount = (row) => {
  /* 关闭账号实现 */
}
const unlockAccount = (row) => {
  /* 解除锁定实现 */
}

// 分页变化处理
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchEnterpriseData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchEnterpriseData()
}

// 页面初始化
onMounted(() => {
  fetchEnterpriseData()
  // fetchDeptTreeData() // 在组件挂载时获取监管部门树数据
  fetchControlTree() // 在组件挂载时获取管控行业树数据
  fetchStatistics() // 在组件挂载时获取统计数据
})

// 添加风险等级数据映射 (1-4 对应 重大-低风险)
const riskLevelOptions = [
  { label: '重大风险', value: '1' },
  { label: '较大风险', value: '2' },
  { label: '一般风险', value: '3' },
  { label: '低风险', value: '4' }
]

// 风险等级映射函数
const getRiskLevelLabel = (value) => {
  const option = riskLevelOptions.find(item => item.value === value?.toString())
  return option ? option.label : '-'
}

// 风险等级颜色映射
const getRiskLevelStyle = (value) => {
  const styles = {
    '1': { background: '#c7d3f5', border: '1px solid blue', color: '#434343' }, // 重大风险 - 蓝色
    '2': { background: '#F0E68C', border: '1px solid #bab25b', color: '#434343' }, // 较大风险 - 黄色
    '3': { background: '#fff0da', border: '1px solid orange', color: '#434343' }, // 一般风险 - 橙色
    '4': { background: '#f6d4cd', border: '1px solid red', color: '#434343' } // 低风险 - 红色
  }
  return styles[value?.toString()] || { background: '#f5f7fa', border: '1px solid #dcdfe6', color: '#434343' }
}
</script>

<style lang="scss" scoped>
.enterprise-manage-container {
  padding: 20px;
  background-color: #f5f7fa;

  .stats-container {
    margin-bottom: 20px;

    .stat-card {
      background: white;
      padding: 15px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      text-align: center;

      :deep(.el-statistic__content) {
        font-size: 24px;
        font-weight: 600;
        color: #1f2d3d;
      }

      :deep(.el-statistic__title) {
        margin-bottom: 8px;
        color: #5e6d82;
      }
    }
  }

  /* 让统计卡片一排等分 7 份 */
  :deep(.stats-grid) {
    display: flex;
    flex-wrap: nowrap;
    column-gap: 16px;
  }
  :deep(.stats-grid .el-col) {
    flex: 0 0 calc((100% - 5 * 16px) / 6);
    max-width: calc((100% - 5 * 16px) / 6);
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .filter-container {
    margin-bottom: 20px;
  }

  .pagination-container {
    margin-top: 20px;
    justify-content: flex-end;
    display: flex;
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
  }
}

// 弹窗样式优化
:deep(.el-dialog) {
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

:deep(.el-dialog__body) {
  flex: 1;
  overflow: hidden;
  padding: 20px;
  max-height: 70vh;
}

:deep(.el-dialog__footer) {
  flex-shrink: 0;
  padding: 10px 20px 20px;
}

// 大弹窗样式
:deep(.large-dept-dialog) {
  max-height: 90vh !important;
}

:deep(.large-dept-dialog .el-dialog__body) {
  min-height: 500px !important;
  max-height: 600px !important;
  padding: 30px !important;
}

:deep(.large-dept-dialog .el-dialog__footer) {
  padding: 20px 30px 30px !important;
}

// 树形选择器下拉框样式
:deep(.el-tree-select__popper) {
  max-height: 400px !important;
}

:deep(.el-tree-select .el-select-dropdown) {
  max-height: 400px !important;
}

// 自定义popper样式
:deep(.dept-tree-select-dropdown) {
  max-height: 400px !important;
  overflow-y: auto !important;
}

:deep(.dept-tree-select-dropdown .el-tree) {
  max-height: 380px !important;
  overflow-y: auto !important;
}
</style>