<template>
  <div class="policy-detail-container">
    <div class="header">
      <div class="left">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </div>
      </div>
      <div class="center">文件详情</div>
      <div class="right">
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </div>
    </div>

    <div class="detail-container" v-loading="loading">
      <div class="detail-card">
        <div class="detail-header">
          <h2 class="detail-title">{{ documentData.title }}</h2>
          <div class="detail-meta">
            <div class="meta-item">
              <span class="label">发布部门：</span>
              <span class="value">{{ documentData.publisherName }}</span>
            </div>
            <div class="meta-item">
              <span class="label">上传时间：</span>
              <span class="value">{{ formatDate(documentData.createTime) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">可见范围：</span>
              <el-tag :type="documentData.visibility === 1 ? 'success' : 'info'">
                {{ documentData.visibility === 1 ? '公开可见' : '仅本单位可见' }}
              </el-tag>
            </div>
          </div>
        </div>

        <div v-if="documentData.remark" class="detail-section">
          <div class="section-title">备注</div>
          <div class="section-content">{{ documentData.remark }}</div>
        </div>

        <div class="detail-section">
          <div class="section-title">附件</div>
          <div class="section-content">
            <div v-if="documentData.filePaths && documentData.filePaths.length > 0" class="file-list">
              <div v-for="(file, index) in documentData.filePaths" :key="index" class="file-item">
                <el-link :href="file.filePath" target="_blank" type="primary" :underline="false">
                  <div class="file-icon">
                    <el-icon v-if="getFileType(file.fileName) === 'pdf'"><Document /></el-icon>
                    <el-icon v-else-if="getFileType(file.fileName) === 'doc' || getFileType(file.fileName) === 'docx'"><Document /></el-icon>
                    <el-icon v-else><Document /></el-icon>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ getFileName(file.fileName) }}</div>
                    <div class="file-action">
                      <el-button type="primary" link size="small" @click="downloadFile(file)">下载</el-button>
                    </div>
                  </div>
                </el-link>
              </div>
            </div>
            <el-empty v-else description="暂无附件" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Document } from '@element-plus/icons-vue'
import { getPolicyDocument } from '@/api/workbenches/policy'
import { formatDate } from '@/utils/formatTime'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const documentId = ref<number | null>(null)

// 文档数据
const documentData = reactive({
  id: undefined,
  title: '',
  publisherId: undefined,
  publisherName: '',
  visibility: 1,
  remark: '',
  filePaths: [],
  createTime: undefined
})

// 获取文档详情
const getDocumentDetail = async (id: number) => {
  loading.value = true
  try {
    const data = await getPolicyDocument(id)
    if (data) {
      // 更新文档数据
      documentData.id = data.id
      documentData.title = data.title
      documentData.publisherId = data.publisherId
      documentData.publisherName = data.publisherName
      documentData.visibility = data.visibility
      documentData.remark = data.remark || ''
      documentData.filePaths = data.filePaths || []
      documentData.createTime = data.createTime
    }
  } catch (error) {
    ElMessage.error('获取文档详情失败')
  } finally {
    loading.value = false
  }
}

// 获取文件类型
const getFileType = (fileName: string) => {
  return fileName.split('.').pop()?.toLowerCase()
}

// 获取文件名（去除哈希部分）
const getFileName = (fileName: string) => {
  // 直接显示原始文件名
  return fileName
}

// 下载文件
const downloadFile = (file: any) => {
  window.open(file.filePath, '_blank')
}

// 编辑文档
const handleEdit = () => {
  router.push(`/workbench/policy/edit?id=${documentData.id}`)
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(async () => {
  // 从路由参数中获取文档ID
  const id = route.query.id
  if (id) {
    documentId.value = Number(id)
    await getDocumentDetail(Number(id))
  } else {
    ElMessage.error('缺少文档ID参数')
    goBack()
  }
})
</script>

<style lang="scss" scoped>
.policy-detail-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;

  .left {
    width: 80px;
  }

  .center {
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    text-align: center;
  }

  .right {
    width: 80px;
    display: flex;
    justify-content: flex-end;
  }

  .back-btn {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    font-size: 14px;

    .el-icon {
      margin-right: 4px;
    }

    &:hover {
      color: #409eff;
    }
  }
}

.detail-container {
  padding: 20px 16px;
}

.detail-card {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-title {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #303133;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  
  .meta-item {
    display: flex;
    align-items: center;
    
    .label {
      color: #606266;
      margin-right: 8px;
    }
    
    .value {
      color: #303133;
    }
  }
}

.detail-section {
  margin-bottom: 24px;
  
  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    margin-bottom: 16px;
    position: relative;
    padding-left: 12px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }
  
  .section-content {
    color: #606266;
    line-height: 1.6;
  }
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-item {
  .el-link {
    display: flex;
    align-items: center;
    padding: 12px;
    border-radius: 4px;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #f5f7fa;
    }
  }
  
  .file-icon {
    font-size: 24px;
    margin-right: 12px;
    color: #409eff;
  }
  
  .file-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .file-name {
      color: #303133;
      font-size: 14px;
    }
  }
}
</style> 