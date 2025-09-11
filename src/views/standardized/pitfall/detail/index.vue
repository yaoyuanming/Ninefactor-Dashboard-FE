<template>
  <div class="pitfall-detail-container">
    <!-- 顶部导航 -->
    <div class="header">
      <el-button @click="goBack" :icon="ArrowLeft" text>
        返回
      </el-button>
      <h2 class="title">隐患详情</h2>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper" v-loading="loading">
      <!-- 左侧列 -->
      <div class="left-column">
        <!-- 基本信息 -->
        <el-card class="info-card">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>
          <div class="info-item">
            <span class="label">隐患清单单据编号：</span>
            <span class="value">
              {{ detailData.dangerRectCode || '-' }}
              <el-button 
                v-if="detailData.dangerRectCode" 
                :icon="CopyDocument" 
                text 
                size="small"
                @click="copyDocumentNo"
              />
            </span>
          </div>
          <div class="info-item">
            <span class="label">整改状态：</span>
            <el-tag 
              :type="getStatusTagType(detailData.rectConditionType)"
              size="small"
            >
              {{ getStatusName(detailData.rectConditionType) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">隐患来源：</span>
            <span class="value">{{ getDangerSourceName(detailData.dangerSource) }}</span>
          </div>
        </el-card>

        <!-- 检查与整改信息 -->
        <el-card class="info-card">
          <template #header>
            <span class="card-title">检查与整改信息</span>
          </template>
          <div class="info-item">
            <span class="label">检查人员：</span>
            <span class="value">{{ detailData.inspectUserName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">检查日期：</span>
            <span class="value">{{ formatDate(detailData.inspectTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">责任部门：</span>
            <span class="value">{{ detailData.respDeptName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">整改责任人：</span>
            <span class="value">{{ detailData.rectChargeUserName || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">整改期限：</span>
            <span class="value">{{ formatDate(detailData.timeLimit) }}</span>
          </div>
        </el-card>
      </div>

      <!-- 中间列 -->
      <div class="center-column">
        <!-- 隐患信息 -->
        <el-card class="info-card">
          <template #header>
            <span class="card-title">隐患信息</span>
          </template>
          <div class="info-item">
            <span class="label">隐患描述：</span>
            <span class="value description">{{ detailData.dangerDesc || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">隐患位置：</span>
            <span class="value">{{ detailData.dangerAddress || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">隐患等级：</span>
            <el-tag 
              :type="detailData.dangerLevel === 10 ? 'danger' : 'success'"
              size="small"
            >
              {{ detailData.dangerLevel === 10 ? '重大隐患' : '一般隐患' }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="label">隐患图片：</span>
            <div class="image-list" v-if="detailData.dangerUrl">
              <el-image 
                v-for="(url, index) in detailData.dangerUrl.split(',')"
                :key="index"
                :src="url"
                :preview-src-list="detailData.dangerUrl.split(',')"
                fit="cover"
                style="width: 80px; height: 80px; margin-right: 10px; border-radius: 6px;"
                :z-index="3000"
                :preview-teleported="true"
              />
            </div>
            <span v-else class="no-image">无图片</span>
          </div>
        </el-card>

        <!-- 整改完成信息 -->
        <el-card class="info-card" v-if="detailData.rectConditionType === 50">
          <template #header>
            <span class="card-title">整改完成信息</span>
          </template>
          <div class="info-item">
            <span class="label">整改完成日期：</span>
            <span class="value">{{ formatDate(detailData.rectCompleteTime) }}</span>
          </div>
          <div class="info-item">
            <span class="label">整改完成情况：</span>
            <span class="value">{{ detailData.rectCompletionState || '整改完成并验收通过' }}</span>
          </div>
          <div class="info-item">
            <span class="label">隐患整改后图片：</span>
            <div class="image-list" v-if="detailData.rectCompleteUrl">
              <el-image 
                v-for="(url, index) in detailData.rectCompleteUrl.split(',')"
                :key="index"
                :src="url"
                :preview-src-list="detailData.rectCompleteUrl.split(',')"
                fit="cover"
                style="width: 80px; height: 80px; margin-right: 10px; border-radius: 6px;"
                :z-index="3000"
                :preview-teleported="true"
              />
            </div>
            <span v-else class="no-image">无图片</span>
          </div>
        </el-card>
      </div>

      <!-- 右侧列 -->
      <div class="right-column">
        <el-card class="timeline-card">
          <template #header>
            <span class="card-title">节点跟踪</span>
          </template>
          <div class="timeline-container">
            <div 
              v-for="(item, index) in timelineData" 
              :key="index"
              class="timeline-item"
              :class="{ 'completed': item.status === 'completed' }"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-info" v-if="item.operator">
                  <span class="operator">操作人员：{{ item.operator }}</span>
                  <span class="time">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, CopyDocument } from '@element-plus/icons-vue'
import { getDangerRect } from '@/api/standardization/pitfall'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

// 路由实例
const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(false)
const detailData = ref({} as any)
const timelineData = ref([])

// 字典：整改状态选项
const rectStatusOptions = computed(() => getIntDictOptions(DICT_TYPE.RECT_CONDITION_TYPE))

// 获取详情数据
const fetchDetailData = async () => {
  const id = route.query.id
  if (!id) {
    ElMessage.error('缺少隐患ID参数')
    return
  }

  loading.value = true
  try {
    const response = await getDangerRect(id)
    detailData.value = response
    generateTimelineData()
  } catch (error) {
    console.error('获取隐患详情失败:', error)
    ElMessage.error('获取隐患详情失败')
  } finally {
    loading.value = false
  }
}

// 生成时间线数据
const generateTimelineData = () => {
  const data = detailData.value
  const timeline = []

  // 根据整改状态生成时间线
  if (data.rectConditionType === 50) {
    // 已整改
    timeline.push({
      title: '已完成',
      status: 'completed',
      operator: data.rectChargeUserName,
      time: formatDate(data.rectCompleteTime, 'YYYY-MM-DD HH:mm:ss')
    })
    timeline.push({
      title: '整改完成录入',
      status: 'completed',
      operator: data.rectChargeUserName,
      time: formatDate(data.rectCompleteTime, 'YYYY-MM-DD HH:mm:ss')
    })
  }

  // 分配阶段
  timeline.push({
    title: '已分配',
    status: 'completed',
    operator: data.rectChargeUserName,
    time: formatDate(data.createTime, 'YYYY-MM-DD HH:mm:ss')
  })

  // 上报阶段
  timeline.push({
    title: '隐患上报',
    status: 'completed',
    operator: data.inspectUserName,
    time: formatDate(data.createTime, 'YYYY-MM-DD HH:mm:ss')
  })

  timelineData.value = timeline
}

// 工具函数
const getDangerSourceName = (source) => {
  const sourceMap = {
    1: '企业日常检查',
    2: '企业专项检查',
    3: '政府专项检查',
    4: '隐患速记'
  }
  return sourceMap[source] || '-'
}

const getStatusName = (status) => {
  const found = rectStatusOptions.value.find(o => String(o.value) === String(status))
  return found?.label || '-'
}

const getStatusTagType = (status) => {
  const typeMap = {
    5: 'warning',
    6: 'danger',
    50: 'success'
  }
  return typeMap[status] || 'info'
}

// 复制单据编号
const copyDocumentNo = () => {
  if (detailData.value.dangerRectCode) {
    navigator.clipboard.writeText(detailData.value.dangerRectCode)
    ElMessage.success('单据编号已复制到剪贴板')
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 初始化
onMounted(() => {
  fetchDetailData()
})
</script>

<style lang="scss" scoped>
.pitfall-detail-container {
  padding: 12px;
  background-color: #fff;
  padding-bottom: 8px;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  background-color: #fff;
  padding: 8px 10px;
  border: 1px solid #eaeaea;
  border-radius: 2px;
  box-shadow: none;
  
  .title {
    margin: 0 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.content-wrapper {
  display: flex;
  align-items: stretch;
  gap: 8px;
  min-height: calc(100vh - 150px);
  
  .left-column {
    width: 380px; /* 原320，左侧占比更大 */
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }
  
  .center-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
  }
  
  .right-column {
    width: 320px;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}

/* 让左右两列中的卡片填满列高，并在内容溢出时内部滚动 */
.left-column .info-card,
.center-column .info-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.left-column .info-card :deep(.el-card__body),
.center-column .info-card :deep(.el-card__body) {
  flex: 1;
  overflow: auto;
}

.info-card {
  border: 1px solid #eaeaea;
  border-radius: 2px;
  box-shadow: none;

  :deep(.el-card__header) {
    padding: 8px 14px;
    background: #fafafa;
    border-bottom: 1px solid #eaeaea;
  }
  :deep(.el-card__body) {
    padding: 10px 14px;
  }

  .card-title {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
  
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      width: 100px;
      color: #666;
      font-size: 13px;
      flex-shrink: 0;
    }
    
    .value {
      flex: 1;
      color: #333;
      font-size: 13px;
      
      &.description {
        line-height: 1.5;
      }
    }
    
    .image-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    
    .no-image {
      color: #999;
      font-size: 13px;
    }
  }
}

.timeline-card {
  border: 1px solid #eaeaea;
  border-radius: 2px;
  box-shadow: none;
  flex: 1;
  display: flex;
  flex-direction: column;

  :deep(.el-card__header) {
    padding: 8px 14px;
    background: #fafafa;
    border-bottom: 1px solid #eaeaea;
  }
  :deep(.el-card__body) {
    padding: 10px 14px;
    flex: 1;
    overflow: auto;
  }
  .card-title {
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }
  
  .timeline-container {
    max-height: none;
    overflow-y: visible;
    padding-left: 8px;
    border-left: 1px solid #eaeaea;
  }
  
  .timeline-item {
    position: relative;
    padding-left: 10px;
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .timeline-dot {
      position: absolute;
      left: -5px;
      top: 6px;
      width: 6px;
      height: 6px;
      background-color: #bbb;
      border-radius: 50%;
    }
    
    &.completed .timeline-dot {
      background-color: #67c23a;
    }
    
    .timeline-content {
      .timeline-title {
        font-weight: 500;
        color: #333;
        margin-bottom: 4px;
        font-size: 13px;
      }
      
      .timeline-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        font-size: 12px;
        color: #666;
        
        .operator {
          color: #409eff;
        }
        
        .time {
          color: #999;
        }
      }
    }
  }
}
</style>