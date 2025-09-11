<template>
  <div class="checklist-container">
    <!-- 搜索表单区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-container">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" class="search-form">
          <el-form-item label="清单名称" prop="checkName">
            <el-input
              v-model="queryParams.checkName"
              placeholder="请输入清单名称"
              clearable
              style="width: 250px"
              @keyup.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item label="行业类型" prop="industryType">
            <el-cascader
              v-model="queryParams.industryType"
              :options="industryOptions"
              :props="{
                checkStrictly: true
              }"
              placeholder="请选择行业类型"
              clearable
              style="width: 200px"
              @change="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleQuery" :icon="Search">
              搜索
            </el-button>
            <el-button @click="resetQuery" :icon="Refresh">
              重置
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 新增按钮 -->
        <div class="add-button-wrapper">
          <el-button type="primary" @click="handleAdd" :icon="Plus">
            新增
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        border
      >
        <el-table-column
          prop="checkName"
          label="检查清单名称"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="industryName"
          label="适用行业类型"
          width="250"
          align="center"
        />
        <el-table-column
          prop="uploadDepName"
          label="上传部门"
          width="150"
          align="center"
        />
        <el-table-column
          prop="isDisplayed"
          label="是否在企业端展示"
          width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-tag :type="row.isDisplayed ? 'success' : 'info'">
              {{ row.isDisplayed ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="lastOperationTime"
          label="最近操作时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatTime(row.lastOperationTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="180"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-link type="primary" @click="handleDetail(row)">详情</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
            <el-divider direction="vertical" />
            <el-link type="danger" @click="handleDelete(row)">删除</el-link>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="queryParams.pageNo"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInspectCheckPage, deleteInspectCheck, type InspectCheckPageReqVO } from '@/api/supervisoryInspect/checklist'
import { categoryData } from 'element-china-category-data'

// 定义组件属性
interface Props {
  checkType: number // 检查清单类型：1.行业领域/2.专项/3.重大隐患
}

const props = defineProps<Props>()

// 定义事件
const emit = defineEmits<{
  add: []
  detail: [row: any]
  edit: [row: any]
  delete: [row: any]
  search: [params: any]
}>()



// 查询参数
const queryParams = reactive<InspectCheckPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  checkName: '',
  checkType: props.checkType.toString(), // 使用父组件传入的 checkType
  industryType: ''
})

// 表格数据
const tableData = ref([])
const loading = ref(false)
const queryFormRef = ref()
const total = ref(0)

// 行业类型选项
const industryOptions = ref(categoryData)

// 获取清单类型文本
const getCheckTypeText = (checkType: number): string => {
  const typeMap = {
    1: '行业领域',
    2: '专项',
    3: '重大隐患'
  }
  return typeMap[checkType] || '未知'
}

// 获取清单类型标签颜色
const getCheckTypeTagType = (checkType: number): string => {
  const colorMap = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return colorMap[checkType] || 'info'
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}



// 获取表格数据
const getTableData = async () => {
  try {
    loading.value = true
    // 构建查询参数：行业类型仅传最后一级 code（如 ["A","01","011"] -> "011"）
    const normalizeIndustryType = (val: any) => {
      if (Array.isArray(val)) {
        return val.length > 0 ? String(val[val.length - 1]) : undefined
      }
      if (typeof val === 'string' && val.includes(',')) {
        const parts = val.split(',').map((s) => s.trim()).filter(Boolean)
        return parts.length > 0 ? parts[parts.length - 1] : undefined
      }
      return val || undefined
    }

    const params = {
      ...queryParams,
      industryType: normalizeIndustryType(queryParams.industryType)
    }
    
    const response = await getInspectCheckPage(params)
    if (response && response.list) {
      tableData.value = response.list
      total.value = response.total || 0
    }
  } catch (error) {
    console.error('获取检查清单数据失败:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNo = 1
  getTableData()
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.pageNo = 1
  queryParams.checkName = ''
  queryParams.industryType = []
  // 保持 checkType 不变，因为它是由父组件传入的固定值
  getTableData()
}

import { useRouter } from 'vue-router'

const router = useRouter()

// 新增
const handleAdd = () => {
  // 根据 checkType 映射到对应的路由参数
  const typeMap = {
    1: 'industrySector',
    2: 'special',
    3: 'majorHiddenDangers'
  }
  const routeType = typeMap[props.checkType] || 'industrySector'
  router.push(`/supervisoryInspect/checklist/add/${routeType}`)
}

// 详情
const handleDetail = (row: any) => {
  const typeMap = {
    1: 'industrySector',
    2: 'special',
    3: 'majorHiddenDangers'
  }
  const routeType = typeMap[props.checkType] || 'industrySector'
  router.push(`/supervisoryInspect/checklist/detail/${routeType}/${row.id}`)
}

// 编辑
const handleEdit = (row: any) => {
  const typeMap = {
    1: 'industrySector',
    2: 'special',
    3: 'majorHiddenDangers'
  }
  const routeType = typeMap[props.checkType] || 'industrySector'
  router.push(`/supervisoryInspect/checklist/edit/${routeType}/${row.id}`)
}

// 删除
const handleDelete = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除检查清单"${row.checkName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteInspectCheck(row.id)
    ElMessage.success('删除成功')
    getTableData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size
  queryParams.pageNo = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  queryParams.pageNo = page
  getTableData()
}

// 暴露方法给父组件
defineExpose({
  getTableData,
  queryParams
})

// 页面加载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.checklist-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.search-card {
  margin-bottom: 10px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.search-form .el-form-item {
  margin-bottom: 16px;
  margin-right: 16px;
}

.add-button-wrapper {
  margin-left: 16px;
  flex-shrink: 0;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

:deep(.el-link) {
  font-size: 14px;
}

:deep(.el-tag) {
  font-size: 12px;
}
</style> 