<template>
  <div class="checklist-detail-container">
    <!-- 顶部操作栏 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">
          详情
        </span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="detail-content" v-loading="loading">
      <!-- 左侧基础信息 -->
      <el-card class="basic-info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">基础信息</span>
          </div>
        </template>

        <el-descriptions
          :column="1"
          border
          class="basic-descriptions"
        >
          <el-descriptions-item label="检查清单名称">
            {{ detailData.checkName }}
          </el-descriptions-item>
          <el-descriptions-item label="清单类型">
            <el-tag :type="getCheckTypeTagType(detailData.checkType)">
              {{ getCheckTypeText(detailData.checkType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="适用行业类型">
            {{ detailData.industryName }}
          </el-descriptions-item>
          <el-descriptions-item label="上传部门">
            {{ detailData.uploadDepName }}
          </el-descriptions-item>
          <el-descriptions-item label="是否在企业端展示">
            <el-tag :type="detailData.isDisplayed ? 'success' : 'info'">
              {{ detailData.isDisplayed ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatTime(detailData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="最近操作时间">
            {{ formatTime(detailData.lastOperationTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="检查清单文件">
            <div v-if="detailData.filePath">
              <el-link :href="detailData.filePath" target="_blank" type="primary">
                <el-icon><Download /></el-icon>
                下载文件
              </el-link>
            </div>
            <span v-else class="no-file">暂无文件</span>
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            <div class="remark-text">{{ detailData.remark || '无' }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 右侧检查清单内容 -->
      <el-card class="checklist-content-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="title">检查清单内容</span>
            <span class="item-count">共 {{ itemList.length }} 项</span>
          </div>
        </template>

        <el-table
          :data="itemList"
          border
          style="width: 100%"
          max-height="600"
        >
          <el-table-column
            prop="serialNum"
            label="序号"
            width="80"
            align="center"
          />
          <el-table-column
            prop="itemName"
            label="检查项目"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            prop="inspectionStandard"
            label="检查标准"
            min-width="300"
            show-overflow-tooltip
          />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Download } from '@element-plus/icons-vue'
import { getInspectCheck, type InspectCheckRespVO } from '@/api/supervisoryInspect/checklist'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const checklistType = route.params.type as string
const checklistId = route.params.id as string

// 根据类型计算页面标题
const pageTitle = computed(() => {
  const titles = {
    industrySector: '行业领域检查清单详情',
    special: '专项检查清单详情',
    majorHiddenDangers: '重大隐患检查清单详情'
  }
  return titles[checklistType] || '检查清单详情'
})

// 检查清单项目接口
interface InspectCheckItem {
  id: string
  inspectCheckId: string
  serialNum: number
  itemName: string
  inspectionStandard: string
  createTime: number
}

// 详情数据
const detailData = reactive<Partial<InspectCheckRespVO>>({
  checkName: '',
  checkType: 1,
  industryType: '',
  uploadDepName: '',
  isDisplayed: true,
  filePath: '',
  remark: '',
  createTime: undefined,
  lastOperationTime: undefined
})

// 检查清单项目列表
const itemList = ref<InspectCheckItem[]>([])

const loading = ref(false)

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
const formatTime = (timestamp: number | Date | undefined): string => {
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

// 获取详情数据
const getDetail = async () => {
  try {
    loading.value = true
    const response = await getInspectCheck(Number(checklistId))
    if (response) {
      // 设置基础信息
      Object.assign(detailData, response)
      // 设置检查清单项目列表
      itemList.value = response.itemList || []
    }
  } catch (error) {
    console.error('获取检查清单详情失败:', error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

// 编辑
const handleEdit = () => {
  router.push(`/supervisoryInspect/checklist/edit/${checklistType}/${checklistId}`)
}

// 返回
const handleBack = () => {
  router.back()
}

// 页面加载时初始化
onMounted(() => {
  console.log('检查清单类型:', checklistType, 'ID:', checklistId)
  getDetail()
})
</script>

<style scoped>
.checklist-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding: 16px;
}

.top-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 8px 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  width: 1px;
  height: 16px;
  background-color: #e4e7ed;
  margin: 0 8px;
}

.action-text {
  color: #333;
  font-size: 14px;
}

/* 左右布局 */
.detail-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.basic-info-card {
  flex: 0 0 400px;
  min-width: 400px;
}

.checklist-content-card {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.item-count {
  font-size: 14px;
  color: #666;
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 4px;
}

.basic-descriptions {
  margin-top: 0;
}

.remark-text {
  white-space: pre-line;
  line-height: 1.6;
  color: #333;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  width: 160px;
  white-space: nowrap;
}

:deep(.el-descriptions__content) {
  padding: 12px 16px;
}

.no-file {
  color: #999;
  font-style: italic;
}

:deep(.el-link) {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .detail-content {
    flex-direction: column;
  }

  .basic-info-card {
    flex: none;
    width: 100%;
  }
}
</style> 