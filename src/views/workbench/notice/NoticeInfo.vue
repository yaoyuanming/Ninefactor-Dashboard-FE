<template>
  <div class="notice-info-container">
    <!-- 顶部返回区域 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">通知公告</span>
      </div>
    </div>

    <!-- 通告详情外部容器 -->
    <div class="notice-outer-container">
      <!-- 通告详情内容 -->
      <div class="notice-content-wrapper">
        <!-- 左上角标题 -->
        <div class="notice-top-title">通知公告</div>
        
        <!-- 标题 -->
        <h1 class="notice-title">{{ notice.title }}</h1>
        
        <!-- 内容 -->
        <div class="notice-content" v-html="notice.content"></div>
        
        <!-- 署名和日期 -->
        <div class="notice-signature">
          <div class="signature-office">{{ notice.publisherDeptName }}</div>
          <div class="signature-date">{{ formatCreateDate }}</div>
        </div>
        
        <!-- 附件 -->
        <div class="notice-attachments" v-if="notice.attachment && notice.attachment.length > 0">
          <h3 class="attachments-title">附件</h3>
          <div class="attachments-list">
            <div v-for="(item, index) in attachmentList" :key="index" class="attachment-item">
              <el-link :href="item.url" target="_blank" type="primary" download>
                <el-icon><Document /></el-icon>
                {{ item.name }}
                <span v-if="item.fileSize" class="file-info">
                  ({{ item.fileSize }}KB)
                </span>
              </el-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { noticeGet } from '@/api/workbenches/notice'
import { formatDate } from '@/utils/formatTime'

const route = useRoute()
const router = useRouter()
const noticeId = ref(route.params.id as string)

// 通知详情
const notice = ref({
  id: '',
  title: '',
  content: '',
  publisherId: '',
  publisherName: '',
  publisherDeptId: '',
  publisherDeptName: '',
  urgencyLevel: 1,
  status: 0,
  publishTime: '',
  createTime: '',
  attachment: []
})

// 格式化发布时间
const formatPublishTime = computed(() => {
  if (notice.value.publishTime) {
    return formatDate(new Date(notice.value.publishTime))
  }
  // 如果发布时间为空，使用创建时间
  return formatDate(notice.value.createTime ? new Date(notice.value.createTime) : null)
})

// 格式化创建时间（用于署名日期）
const formatCreateDate = computed(() => {
  if (notice.value.createTime) {
    const date = new Date(notice.value.createTime)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  return ''
})

// 附件列表
const attachmentList = computed(() => {
  if (!notice.value.attachment || notice.value.attachment.length === 0) return []
  
  // 处理新的附件数据结构（对象数组）
  if (Array.isArray(notice.value.attachment) && notice.value.attachment.length > 0) {
    return notice.value.attachment.map((item: any) => {
      // 如果是对象格式，直接使用fileName和filePath
      if (typeof item === 'object' && item.fileName && item.filePath) {
        return {
          name: item.fileName,
          url: item.filePath,
          fileSize: item.fileSize,
          fileType: item.fileType
        }
      }
      // 如果是字符串格式，保持原有逻辑
      if (typeof item === 'string') {
        const parts = item.split('/')
        const name = parts[parts.length - 1]
        return {
          name,
          url: item
        }
      }
      return item
    })
  }
  
  // 兼容旧的字符串格式
  if (typeof notice.value.attachment === 'string') {
    return notice.value.attachment.split(',').map(item => {
      const parts = item.split('/')
      const name = parts[parts.length - 1]
      return {
        name,
        url: item
      }
    })
  }
  
  return []
})

// 获取通知详情
const getNoticeDetail = async () => {
  try {
    const res = await noticeGet(Number(noticeId.value))
    if (res) {
      notice.value = res
    }
  } catch (error) {
    console.error('获取通知详情失败:', error)
    ElMessage.error('获取通知详情失败')
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 页面加载时获取数据
onMounted(() => {
  if (noticeId.value) {
    getNoticeDetail()
  } else {
    ElMessage.error('通知ID不存在')
  }
})
</script>

<style scoped>
.notice-info-container {
  background: #f5f7fa;
  min-height: 100vh;
  padding-bottom: 20px;
}

.top-action-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 16px;
  margin-bottom: 16px;
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
  font-weight: 500;
}

/* 外部容器 */
.notice-outer-container {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  position: relative;
}

/* 内容容器 */
.notice-content-wrapper {
  width: 800px;
  margin: 20px auto;
  padding: 20px 0;
  background: #fff;
  position: relative;
  min-height: 500px;
}

/* 左上角标题 */
.notice-top-title {
  position: absolute;
  top: 0;
  left: 0;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.notice-title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-top: 60px;
  margin-bottom: 40px;
  color: #333;
}

.notice-content {
  margin: 20px 0 60px;
  line-height: 1.8;
  color: #333;
  text-align: justify;
}

.notice-signature {
  text-align: right;
  margin: 40px 0 20px;
}

.signature-office {
  margin-bottom: 8px;
  font-weight: 500;
}

.notice-attachments {
  margin-top: 80px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.attachments-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.file-info {
  color: #909399;
  font-size: 12px;
  margin-left: 8px;
}

:deep(.el-link) {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 内容样式优化 */
:deep(p) {
  margin: 16px 0;
  text-indent: 2em;
}

@media (max-width: 768px) {
  .notice-content-wrapper {
    width: 95%;
    padding: 20px;
  }
}
</style> 