<template>
  <div class="task-deploy-container">
        <!-- 搜索表单区域 -->
    <el-card class="search-card" shadow="never">
      <div class="search-container">
        <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
          <el-form-item label="专项检查任务标题">
            <el-input
              v-model="searchForm.taskTitle"
              placeholder="请输入专项检查任务标题"
              clearable
              style="width: 250px"
            />
          </el-form-item>
          <el-form-item label="检查任务派发时间">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="handleReset" :icon="Refresh">
              重置
            </el-button>
          </el-form-item>
        </el-form>
        
        <!-- 新增按钮 -->
        <div class="add-button-wrapper">
          <el-button type="primary" @click="handleAdd" :icon="Plus">
            新增专项检查
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
          prop="taskTitle"
          label="专项检查任务标题"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="taskDescription"
          label="专项检查任务描述"
          min-width="250"
          show-overflow-tooltip
        />
        <el-table-column
          prop="taskType"
          label="任务类型"
          width="120"
          align="center"
        />
        <el-table-column
          prop="inspectionStartTime"
          label="检查开始时间"
          width="140"
          align="center"
        />
        <el-table-column
          prop="inspectionEndTime"
          label="检查结束时间"
          width="140"
          align="center"
        />
        <el-table-column
          prop="status"
          label="任务状态"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.status === 1" type="success" size="small">已派发</el-tag>
            <el-tag v-else-if="row.status === 0" type="warning" size="small">未派发</el-tag>
            <span v-else>{{ row.status || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="dispatchTime"
          label="派发时间"
          width="140"
          align="center"
        />
        <el-table-column
          prop="uploadDeptName"
          label="上传部门"
          width="120"
          align="center"
        />
        <el-table-column
          label="操作"
          width="120"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <!-- <el-link type="primary" @click="handleEdit(row)">编辑</el-link> -->
            <el-divider direction="vertical" />
            <el-link type="danger" @click="handleDelete(row)">删除</el-link>
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
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Search, Refresh, Plus, Lightning } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getInspectionTaskPage, deleteInspectionTask, type InspectionTaskPageReqVO } from '@/api/supervisoryInspect/taskDeploy'
const router = useRouter()

// 搜索表单数据
const searchForm = reactive({
  taskTitle: '',
  taskDescription: '',
  taskSource: '',
  taskType: '',
  status: '',
  dateRange: []
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
const searchFormRef = ref()

// 获取表格数据
const getTableData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params: InspectionTaskPageReqVO = {
      pageNo: pagination.currentPage.toString(),
      pageSize: pagination.pageSize.toString(),
      taskTitle: searchForm.taskTitle || undefined,
      taskDescription: searchForm.taskDescription || undefined,
      taskSource: searchForm.taskSource || undefined,
      taskType: searchForm.taskType || undefined,
      status: searchForm.status || undefined,
      dispatchTime: searchForm.dateRange && searchForm.dateRange.length === 2 ? searchForm.dateRange[0] : undefined,
      // 如果需要结束时间，可以添加另一个参数
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
const handleSearch = () => {
  pagination.currentPage = 1
  getTableData()
}

// 重置
const handleReset = () => {
  // 手动重置 reactive 表单数据
  searchForm.taskTitle = ''
  searchForm.taskDescription = ''
  searchForm.taskSource = ''
  searchForm.taskType = ''
  searchForm.status = ''
  searchForm.dateRange = []
  
  // 重置分页
  pagination.currentPage = 1
  
  // 重新获取数据
  getTableData()
}

// 新增
const handleAdd = () => {
  router.push({ path: '/supervisoryInspect/taskDeploy/add/0' })
}

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info(`编辑任务：${row.taskTitle}`)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除专项检查任务"${row.taskTitle}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      // 调用删除接口
      await deleteInspectionTask(row.id)
      ElMessage.success('删除成功')
      // 刷新表格数据
      getTableData()
    } catch (error) {
      console.error('删除专项检查任务失败:', error)
      ElMessage.error('删除失败，请重试')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
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

// 页面加载时获取数据
onMounted(() => {
  getTableData()
})
</script>

<style scoped>
.task-deploy-container {

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

.enterprise-count {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background-color: #fff7e6;
  border-radius: 4px;
  color: #d46b08;
  font-size: 12px;
}

.enterprise-count .el-icon {
  font-size: 12px;
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
</style>
