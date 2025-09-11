<template>
  <div class="containerpage">
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="searchForm" class="search-form">
      <el-form-item label="专项检查任务标题">
        <el-input v-model="searchForm.title" placeholder="请输入专项检查任务标题" class="search-input" />
      </el-form-item>
      <el-form-item label="是否存在隐患">
        <el-select v-model="searchForm.hasRisk" placeholder="请选择" class="search-select">
          <el-option label="全部" value="" />
          <el-option label="是" value="yes" />
          <el-option label="否" value="no" />
        </el-select>
      </el-form-item>
      <el-form-item label="整改状态">
        <el-select v-model="searchForm.status" placeholder="请选择" class="search-select">
          <el-option label="全部" value="" />
          <el-option label="已整改" value="done" />
          <el-option label="未整改" value="undone" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格数据 -->
    <el-table
      :data="tableData"
      v-loading="loading"
      style="width: 100%; margin-top: 20px;"
      header-row-class-name="table-header"
    >
      <el-table-column prop="taskTitle" label="专项检查任务标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="taskDescription" label="专项检查任务描述" min-width="250">
        <template #default="{ row }">
          <el-tooltip :content="row.taskDescription" placement="top" :show-after="500">
            <div class="description-cell">
              {{ row.taskDescription }}
            </div>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="taskSource" label="检查任务来源" min-width="120" />
      <el-table-column prop="taskType" label="任务类型" min-width="120" />
      <el-table-column prop="inspectionStartTime" label="检查开始时间" min-width="140" />
      <el-table-column prop="inspectionEndTime" label="检查结束时间" min-width="140" />
      <el-table-column prop="status" label="任务状态" min-width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success" size="small">已派发</el-tag>
          <el-tag v-else-if="row.status === 0" type="warning" size="small">未派发</el-tag>
          <span v-else>{{ row.status || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="dispatchTime" label="派发时间" min-width="140" />
      <el-table-column label="检查企业" min-width="120" align="center">
        <template #default="{ row }">
          <span>{{ row.compCount || 0 }}家</span>
        </template>
      </el-table-column>
      <el-table-column label="是否存在隐患" min-width="120" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.hasHiddenDanger" type="danger" size="small">是</el-tag>
          <el-tag v-else type="success" size="small">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="一般隐患" min-width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.generalDangerCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="重大隐患" min-width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.majorDangerCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已整改" min-width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.rectifiedCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="未整改" min-width="100" align="center">
        <template #default="{ row }">
          <span>{{ row.unRectifiedCount || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="{ row }">
          <el-link type="primary" @click="goToTaskDetail(row.id)">任务详情</el-link>
          <el-divider direction="vertical" />
          <el-link type="primary" @click="goToReportDetail(row.id)">报告详情</el-link>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInspectionTaskPage, type InspectionTaskPageReqVO } from '@/api/supervisoryInspect/taskDeploy'

const router = useRouter()

// 搜索表单数据 - 保持原有的三个搜索字段
const searchForm = ref({
  title: '',
  hasRisk: '',
  status: ''
})

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const loading = ref(false)

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    // 构建查询参数 - 将原有搜索字段映射到API参数
    const params: InspectionTaskPageReqVO = {
      pageNo: pagination.currentPage.toString(),
      pageSize: pagination.pageSize.toString(),
      taskTitle: searchForm.value.title || undefined,
      hasHiddenDanger: searchForm.value.hasRisk === 'yes' ? 'true' : searchForm.value.hasRisk === 'no' ? 'false' : undefined,
      status: searchForm.value.status === 'done' ? '1' : searchForm.value.status === 'undone' ? '0' : undefined,
    }

    // 调用API
    const response = await getInspectionTaskPage(params)

    if (response && response.list) {
      tableData.value = response.list
      pagination.total = response.total || 0
    } else {
      tableData.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('获取专项检查任务数据失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    tableData.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const onSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

// 重置
const onReset = () => {
  searchForm.value = { title: '', hasRisk: '', status: '' }
  pagination.currentPage = 1
  getTableData()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  getTableData()
}

// 当前页改变
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  getTableData()
}

// 跳转任务详情
const goToTaskDetail = (id: string | number) => {
  router.push(`/supervisoryInspect/specialInspectionRecord/taskDetail/${id}`)
}

// 跳转报告详情
const goToReportDetail = (id: string | number) => {
  router.push(`/supervisoryInspect/specialInspectionRecord/reportDetail/${id}`)
}

// 页面加载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.containerpage {
  padding: 20px;
  background-color: #fff;
 
}

.search-form {
  margin-bottom: 20px;
  width: 100%;
}


.search-input {
  width: 240px;
}

.search-select {
  width: 180px;
}


:deep(.el-form-item) {
  margin-right: 20px;
  margin-bottom: 15px;
}

:deep(.el-form-item__label) {
  width: auto;
  min-width: 120px;
}

:deep(.table-header) {
  background-color: #f5f7fa;
}

:deep(.table-header th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
}


:deep(.el-table) {
  border: 1px solid #ebeef5;
  width: 100% !important;
}

:deep(.el-table th) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5;
}


:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table .cell) {
  word-break: break-word;
  white-space: normal;
}

.description-cell {
  max-width: 250px;
  max-height: 2.4em;
  line-height: 1.2em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
