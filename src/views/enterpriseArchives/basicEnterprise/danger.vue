<template>
  <div class="danger-overview">
    <!-- 隐患概况统计 -->
    <div class="statistics-grid">
      <div class="stat-item">
        <div class="stat-label">
          <span>已排查隐患总数</span>
        </div>
        <div class="stat-value">{{ dangerOverview.totalHazards || 0 }}</div>
      </div>
      <!-- <div class="stat-item">
        <div class="stat-label">
          <span>已排查重大隐患总数</span>
        </div>
        <div class="stat-value danger">{{ dangerOverview.totalMajorHazards || 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span>已排查一般隐患总数</span>
        </div>
        <div class="stat-value success">{{ dangerOverview.totalGeneralHazards || 0 }}</div>
      </div> -->
      <div class="stat-item">
        <div class="stat-label">
          <span>整改中隐患总数</span>
        </div>
        <div class="stat-value warning">{{ dangerOverview.hazardsInProgress || 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span>逾期未整改隐患数</span>
        </div>
        <div class="stat-value danger">{{ dangerOverview.overdueUnresolvedHazards || 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span>已整改隐患总数</span>
        </div>
        <div class="stat-value warning">{{ dangerOverview.resolvedHazards || 0 }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">
          <span>隐患整改率</span>
          <el-icon class="info-icon"><InfoFilled /></el-icon>
        </div>
        <div class="stat-value primary">{{ dangerOverview.rectificationRate }}</div>
      </div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="search-filter">
      <el-form :inline="true" :model="dangerFilterForm" class="search-form">
        <el-form-item label="隐患等级">
          <el-select v-model="dangerFilterForm.dangerLevel" placeholder="请选择" clearable style="width: 120px;">
            <el-option label="一般隐患" value="5" />
            <el-option label="重大隐患" value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="整改状态">
          <el-select v-model="dangerFilterForm.rectConditionType" placeholder="请选择" clearable style="width: 120px;">
            <el-option
              v-for="opt in rectStatusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleDangerSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetDangerFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <!-- <el-button @click="exportDangerData">
            <el-icon><Download /></el-icon>
            导出
          </el-button> -->
        </el-form-item>
      </el-form>
    </div>

    <!-- 隐患列表 -->
    <div class="danger-table">
      <el-table :data="dangerList" style="width: 100%" v-loading="dangerLoading">
        <el-table-column label="检查日期" width="220">
          <template #default="{ row }">
            {{ formatDate(row.inspectTime ? new Date(row.inspectTime) : null) }}
          </template>
        </el-table-column>
        <el-table-column prop="deptName" label="企业名称" min-width="180" />
        <el-table-column prop="dangerDesc" label="隐患描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="dangerUrl" label="隐患图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.dangerUrl"
              :src="row.dangerUrl"
              :preview-src-list="[row.dangerUrl]"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
              preview-teleported
            >
              <template #error>
                <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: #f5f7fa; color: #909399; font-size: 12px;">
                  无图片
                </div>
              </template>
            </el-image>
            <span v-else style="color: #909399; font-size: 12px;">无图片</span>
          </template>
        </el-table-column>
        <el-table-column prop="dangerLevel" label="隐患等级" width="100">
          
          <template #default="{ row }">
            <el-tag :type="row.dangerLevel === '10' ? 'danger' : 'warning'" effect="dark">
              {{ row.dangerLevel === '10' ? '重大隐患' : '一般隐患' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dangerAddress" label="隐患位置" min-width="150" show-overflow-tooltip />
        <el-table-column prop="inspectUserName" label="整改责任人" width="120" />
        
        <el-table-column prop="rectConditionType" label="整改状态" width="160">
          <template #default="{ row }">
            <el-tag 
              :type="getRectStatusType(row.rectConditionType)" 
              effect="dark"
            >
              {{ getRectStatusText(row.rectConditionType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="timeLimit" label="整改期限" width="120" />
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="viewDangerDetail(row)">详情</el-link>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        class="pagination-container"
        v-model:current-page="dangerPagination.currentPage"
        v-model:page-size="dangerPagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="dangerPagination.total"
        @current-change="handleDangerCurrentChange"
        @size-change="handleDangerSizeChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import { getDangerStatisticsByCompId } from '@/api/standardization/overview'
import { getDangerRectPage, type DangerRectPageReqVO } from '@/api/standardization/pitfall'
import { formatDate } from '@/utils/formatTime'
import { useRouter } from 'vue-router'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

// 定义props
interface Props {
  companyId: string | number
}

const props = defineProps<Props>()

const router = useRouter()

// 隐患治理相关
const dangerOverview = ref({} as any)
const dangerList = ref([] as any[])
const dangerLoading = ref(false)
const dangerPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 字典：整改状态选项
const rectStatusOptions = computed(() => getIntDictOptions(DICT_TYPE.RECT_CONDITION_TYPE))

// 隐患筛选表单
const dangerFilterForm = reactive({
  dangerLevel: '',
  rectConditionType: ''
})

// 计算整改率
const rectificationRate = computed(() => {
  const total = dangerOverview.value.totalHazards || 0
  const unRectified = dangerOverview.value.unRectifiedHazards || 0
  if (total === 0) return '0.00'
  const rate = ((total - unRectified) / total * 100).toFixed(2)
  return rate
})

// 获取隐患概况数据
const fetchDangerOverview = async () => {
  try {
    const response = await getDangerStatisticsByCompId({ compId: props.companyId.toString() })
    if (response) {
      dangerOverview.value = response
    }
  } catch (error) {
    console.error('获取隐患概况失败:', error)
    ElMessage.error('获取隐患概况失败')
  }
}

// 获取隐患列表数据
const fetchDangerList = async () => {
  try {
    dangerLoading.value = true
    
    const params: DangerRectPageReqVO = {
      pageNo: dangerPagination.currentPage.toString(),
      pageSize: dangerPagination.pageSize.toString(),
      deptId: props.companyId.toString(),
      dangerLevel: dangerFilterForm.dangerLevel || undefined,
      rectConditionType: dangerFilterForm.rectConditionType || undefined
    }
    
    const response = await getDangerRectPage(params)
    if (response && response.list) {
      dangerList.value = response.list
      dangerPagination.total = response.total || 0
    } else {
      dangerList.value = []
      dangerPagination.total = 0
    }
  } catch (error) {
    console.error('获取隐患列表失败:', error)
    ElMessage.error('获取隐患列表失败')
    dangerList.value = []
    dangerPagination.total = 0
  } finally {
    dangerLoading.value = false
  }
}

// 隐患搜索
const handleDangerSearch = () => {
  dangerPagination.currentPage = 1
  fetchDangerList()
}

// 重置隐患筛选
const resetDangerFilter = () => {
  dangerFilterForm.dangerLevel = ''
  dangerFilterForm.rectConditionType = ''
  dangerPagination.currentPage = 1
  fetchDangerList()
}

// 导出隐患数据
const exportDangerData = () => {
  console.log('导出隐患数据')
  // 这里可以实现导出功能
  ElMessage.info('导出功能开发中...')
}

// 获取整改状态类型
const getRectStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    '5': 'warning',   // 未整改
    '6': 'danger',    // 逾期未整改
    '50': 'success'   // 整改完成
  }
  return statusMap[status] || 'info'
}

// 获取整改状态文本（从字典映射）
const getRectStatusText = (status: string) => {
  const found = rectStatusOptions.value.find(o => String(o.value) === String(status))
  return found?.label || '未知'
}

// 查看隐患详情
const viewDangerDetail = (row: any) => {
  router.push({ path: '/standardized/pitfall/detail', query: { id: String(row.id) } })
}

// 隐患分页处理
const handleDangerCurrentChange = (page: number) => {
  dangerPagination.currentPage = page
  fetchDangerList()
}

const handleDangerSizeChange = (size: number) => {
  dangerPagination.pageSize = size
  dangerPagination.currentPage = 1
  fetchDangerList()
}

// 暴露方法给父组件
defineExpose({
  fetchDangerOverview,
  fetchDangerList
})

// 组件挂载时不自动获取数据，等待父组件调用
// onMounted(() => {
//   fetchDangerOverview()
//   fetchDangerList()
// })
</script>

<style lang="scss" scoped>
.danger-overview {
  .statistics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 24px;
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: #fafafa;
      border-radius: 8px;
      border: 1px solid #e4e7ed;
      
      .stat-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        margin-bottom: 8px;
        font-size: 14px;
        color: #666;
        height: 40px;
        line-height: 1.2;
        text-align: center;
        flex-wrap: wrap;
        align-content: center;
        min-height: 40px;
        
        .info-icon {
          font-size: 12px;
          color: #909399;
          cursor: help;
        }
      }
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #333;
        margin-top: auto;
        line-height: 1;
        margin-top: 8px;
        flex-shrink: 0;
        
        &.primary {
          color: #409eff;
        }
        
        &.success {
          color: #67c23a;
        }
        
        &.warning {
          color: #000000;
        }
        
        &.danger {
          color: #f56c6c;
        }
      }
    }
  }
  
  .search-filter {
    margin-bottom: 20px;
    padding: 16px;
    background-color: #fafafa;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    
    .search-form {
      margin: 0;
      
      .el-form-item {
        margin-bottom: 0;
        margin-right: 16px;
      }
    }
  }
  
  .danger-table {
    .pagination-container {
      margin-top: 16px;
      justify-content: flex-end;
      display: flex;
    }
  }
}

// 响应式设计
@media (max-width: 1400px) {
  .danger-overview .statistics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .danger-overview .statistics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .danger-overview .statistics-grid {
    grid-template-columns: 1fr;
  }
}
</style> 