<template>
  <div class="overview-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="title">概览</div>
      <p class="subtitle">截止到{{ currentDate }}的最新数据</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper" v-loading="loading">
      <!-- 已部署企业专项检查任务概况  -->
      <el-card class="statistics-card task-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon task-icon"><Document /></el-icon>
            <span class="card-title">已部署企业专项检查任务概况</span>
          </div>
        </template>
        <div class="statistics-grid">
          <div class="stat-item">
            <div class="stat-label">
              <span>已部署专项检查任务总数</span>
            </div>
            <div class="stat-value">{{ taskData.totalTasks || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>未完成专项检查任务数</span>
            </div>
            <div class="stat-value">{{ taskData.unfinishedTasks || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>已完成专项检查任务数</span>
            </div>
            <div class="stat-value">{{ taskData.completedTasks || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>完成率</span>
            </div>
            <div class="stat-value primary">{{ completionRate }}%</div>
          </div>
        </div>
      </el-card>

      <!-- 专项检查隐患治理概况 -->
      <el-card class="statistics-card danger-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon danger-icon"><DocumentChecked /></el-icon>
            <span class="card-title">专项检查隐患治理概况</span>
          </div>
        </template>
        <div class="statistics-grid danger-grid">
          <div class="stat-item">
            <div class="stat-label">
              <span>专项检查隐患总数</span>
            </div>
            <div class="stat-value">{{ dangerData.totalHazards || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>专项检查重大隐患数</span>
            </div>
            <div class="stat-value danger">{{ dangerData.majorHazards || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>专项检查一般隐患数</span>
            </div>
            <div class="stat-value">{{ dangerData.generalHazards || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>未整改专项检查隐患数</span>
            </div>
            <div class="stat-value">{{ dangerData.unRectifiedHazards || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>已整改专项检查隐患数</span>
            </div>
            <div class="stat-value">{{ dangerData.overdueUnRectifiedHazards || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>隐患整改率</span>
            </div>
            <div class="stat-value primary">{{ rectificationRate }}%</div>
          </div>
        </div>
      </el-card>

      <!-- 检查清单概况 -->
      <el-card class="statistics-card checklist-card">
        <template #header>
          <div class="card-header">
            <el-icon class="header-icon checklist-icon"><DocumentCopy /></el-icon>
            <span class="card-title">检查清单概况</span>
          </div>
        </template>
        <div class="statistics-grid checklist-grid">
          <div class="stat-item">
            <div class="stat-label">
              <span>行业领域检查清单总数</span>
            </div>
            <div class="stat-value">{{ checklistData.industryChecklists || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>专项检查清单总数</span>
            </div>
            <div class="stat-value primary">{{ checklistData.specialChecklists || 0 }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              <span>重大隐患检查清单总数</span>
            </div>
            <div class="stat-value danger">{{ checklistData.majorHazardChecklists || 0 }}</div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, DocumentChecked, DocumentCopy, InfoFilled } from '@element-plus/icons-vue'
import { getCheckListStatistics, getDangerStatistics, getTaskStatistics } from '@/api/supervisoryInspect/overview'

// 响应式数据
const loading = ref(false)
const taskData = ref({})
const dangerData = ref({})
const checklistData = ref({})

// 计算属性
const currentDate = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`
})

const completionRate = computed(() => {
  const total = taskData.value.totalTasks || 0
  const completed = taskData.value.completedTasks || 0
  if (total === 0) return '0.00'
  return ((completed / total) * 100).toFixed(2)
})

const rectificationRate = computed(() => {
  const total = dangerData.value.totalHazards || 0
  const rectified = dangerData.value.overdueUnRectifiedHazards || 0
  if (total === 0) return '0.00'
  return ((rectified / total) * 100).toFixed(2)
})

// 获取统计数据
const fetchStatisticsData = async () => {
  loading.value = true
  try {
    // 并行请求三个接口
    const [taskResponse, dangerResponse, checklistResponse] = await Promise.all([
      getTaskStatistics(),
      getDangerStatistics(),
      getCheckListStatistics()
    ])

    taskData.value = taskResponse || {}
    dangerData.value = dangerResponse || {}
    checklistData.value = checklistResponse || {}
  } catch (error) {
    console.error('获取统计数据失败:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化
onMounted(() => {
  fetchStatisticsData()
})
</script>

<style lang="scss" scoped>
.overview-container {
  padding: 20px;
  background-color: #f5f5f5;
  height: 100%;
}

.page-header {
  margin-bottom: 24px;
  
  .title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px 0;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -10px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background: #409eff;
      border-radius: 2px;
    }
  }
  
  .subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.statistics-card {
  box-shadow: none;
  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .header-icon {
      font-size: 20px;
      
      &.task-icon {
        color: #f56c6c;
      }
      
      &.danger-icon {
        color: #67c23a;
      }
      
      &.checklist-icon {
        color: #409eff;
      }
    }
    
    .card-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }
  
  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;
    
    &.danger-grid {
      grid-template-columns: repeat(5, 1fr);
    }
    
    &.checklist-grid {
      grid-template-columns: repeat(5, 1fr);
    }
    
    .stat-item {
      text-align: center;
      padding: 20px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      
      .stat-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-bottom: 12px;
        font-size: 20px;
        color: #666;
        
        .info-icon {
          font-size: 14px;
          color: #909399;
          cursor: help;
        }
      }
      
      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #333;
        
        &.primary {
          color: #409eff;
        }
        
        &.success {
          color: #67c23a;
        }
        
        &.warning {
          color: #e6a23c;
        }
        
        &.danger {
          color: #f56c6c;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .statistics-card .statistics-grid {
    grid-template-columns: 2fr;
    
    &.danger-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    
    &.checklist-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
}

@media (max-width: 768px) {
  .statistics-card .statistics-grid {
    grid-template-columns: 1fr;
    
    &.danger-grid,
    &.checklist-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>