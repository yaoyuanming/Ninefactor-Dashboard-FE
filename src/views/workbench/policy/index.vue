<template>
  <div class="policy-document-container">
    <div class="policy-card">
      <!-- 搜索筛选区域 -->
      <div class="filter-item">
        <span class="label">可见范围</span>
        <el-checkbox v-model="publicVisible" label="公开可见" />
        <el-checkbox v-model="deptVisible" label="仅本单位可见" />
      </div>
      <div class="filter-item">
        <el-input v-model="queryParams.title" placeholder="请输入文件名称" clearable style="width: 180px;" />
        <el-input v-model="queryParams.publisherName" placeholder="请输入发布单位" clearable style="width: 180px;" />
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="上传时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 240px; margin-right: 20px;"
        />
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <div class="flex-spacer"></div>
        <el-button type="primary" @click="handleAdd">+ 添加文件</el-button>
      </div>

      <!-- 列表或空状态 -->
      <div class="table-wrapper">
        <template v-if="documentList.length > 0">
          <el-table :data="documentList" border style="width: 100%">
            <el-table-column prop="title" label="文件名称" min-width="200">
              <template #default="{ row }">
                <div class="document-title-cell">
                  <el-icon><Document /></el-icon>
                  <span class="document-title-text">{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="publisherName" label="发布单位" width="150" />
            <el-table-column label="可见范围" width="120">
              <template #default="{ row }">
                <el-tag :type="row.visibility === 1 ? 'success' : 'info'">
                  {{ row.visibility === 1 ? '公开可见' : '仅本单位可见' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="上传时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button type="info" link @click="handleView(row)">查看</el-button>
                <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </template>
        <template v-else>
          <el-empty description="暂无文件" :image-size="120">
            <template #description>
              <span>暂无文件</span>
            </template>
          </el-empty>
        </template>
      </div>

      <!-- 分页（有数据时显示） -->
      <div v-if="documentList.length > 0" class="pagination-container in-card">
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPolicyDocumentPage, deletePolicyDocument, PolicyDocumentPageReqVO } from '@/api/workbenches/policy'
import { formatDate } from '@/utils/formatTime'
import { useRouter } from 'vue-router'
import { Document } from '@element-plus/icons-vue'

const router = useRouter()

// 查询参数
const queryParams = reactive<PolicyDocumentPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  title: undefined,
  publisherName: undefined,
  visibility: undefined
})

// 日期范围
const dateRange = ref<string[]>([])

// 文件列表和总数
const documentList = ref<any[]>([])
const total = ref(0)

// 可见范围过滤状态
const publicVisible = ref(true)
const deptVisible = ref(true)

// 获取文件列表
const getDocumentList = async () => {
  try {
    // 处理可见范围过滤
    if (publicVisible.value && !deptVisible.value) {
      queryParams.visibility = 1 // 仅公开可见
    } else if (!publicVisible.value && deptVisible.value) {
      queryParams.visibility = 2 // 仅本单位可见
    } else {
      queryParams.visibility = undefined // 全部
    }

    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      queryParams.createTime = dateRange.value
    } else {
      queryParams.createTime = undefined
    }

    const res = await getPolicyDocumentPage(queryParams)
    documentList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('获取政策文件列表失败')
  }
}

// 获取文件名（去除哈希部分）
const getFileName = (fileName: string) => {
  // 如果文件名是哈希值形式，显示文件类型
  if (/^[a-f0-9]{32,}\./.test(fileName)) {
    const fileType = fileName.split('.').pop()
    return fileType ? fileType.toUpperCase() + '文件' : '未知文件'
  }
  return fileName
}

// 搜索
const handleQuery = () => {
  queryParams.pageNo = 1
  getDocumentList()
}

// 重置
const resetQuery = () => {
  queryParams.title = undefined
  queryParams.publisherName = undefined
  queryParams.visibility = undefined
  publicVisible.value = true
  deptVisible.value = true
  dateRange.value = []
  queryParams.pageNo = 1
  getDocumentList()
}

// 分页大小变化
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val
  getDocumentList()
}

// 页码变化
const handleCurrentChange = (val: number) => {
  queryParams.pageNo = val
  getDocumentList()
}

// 添加文件
const handleAdd = () => {
  router.push('/workbench/policy/add')
}

// 编辑文件
const handleEdit = (item: any) => {
  // 跳转到编辑页面或打开编辑对话框
  router.push(`/workbench/policy/edit?id=${item.id}`)
}

// 删除文件
const handleDelete = (item: any) => {
  ElMessageBox.confirm(`确定要删除政策文件"${item.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deletePolicyDocument(item.id)
      ElMessage.success('删除成功')
      getDocumentList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  }).catch(() => {})
}

// 查看文件详情
const handleView = (item: any) => {
  router.push(`/workbench/policy/detail?id=${item.id}`)
}

onMounted(() => {
  getDocumentList()
})
</script>

<style lang="scss" scoped>
.policy-document-container {

  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
  display: flex;
}

.policy-card {
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* 表格表头标题背景色 */
:deep(.el-table__header th) {
  background-color: #f6f8fb !important;
  color: #333 !important;
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    margin-right: 16px;
    font-weight: 500;
  }

  .el-checkbox {
    margin-right: 24px;
  }

  .el-input, .el-date-picker {
    margin-right: 12px;
  }
  
  .flex-spacer {
    flex: 1;
  }
}

.table-wrapper {
  margin-top: 8px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.document-title-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .document-title-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pagination-container.in-card {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
