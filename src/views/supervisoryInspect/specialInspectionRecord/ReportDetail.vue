<template>
  <div class="special-inspection-container">
    <!-- 顶部返回按钮 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">报告详情</span>
      </div>
    </div>

    <!-- 报告内容 -->
    <div class="report-content">
      <!-- 报告标题 -->
      <div class="report-header">
        <div class="report-title">专项检查任务报告</div>
      </div>

      <!-- 任务基本信息 -->
      <div class="task-basic-info">
        <div class="info-row">
          <div class="info-label">专项检查任务标题：</div>
          <div class="info-value">{{ taskDetail.taskTitle }}</div>
        </div>
        <div class="info-row-flex">
          <div class="info-col">
            <div class="info-label">检查任务来源：</div>
            <div class="info-value">{{ taskDetail.taskSource || '--' }}</div>
          </div>
          <div class="info-col">
            <div class="info-label">起始检查时间：</div>
            <div class="info-value">{{ taskDetail.inspectionStartTime }} 至 {{ taskDetail.inspectionEndTime }}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-label">专项检查任务描述：</div>
          <div class="info-value description-text">{{ taskDetail.taskDescription }}</div>
        </div>
        
      </div>

      <!-- 结果汇总 -->
      <div class="result-summary">
        <div class="summary-title">结果汇总：</div>
        <div class="summary-content">
          <div class="summary-item">1.本次专项监督共检查{{ taskStats.totalEnterprises }}家企业，其中存在问题隐患{{ taskStats.totalIssues }}家，本次发现隐患{{ taskStats.newIssues }}个，未整改隐患{{ taskStats.unresolvedIssues }}个。</div>
          <div class="summary-item">2.其中一般隐患{{ taskStats.minorIssues }}个，本次发现隐患{{ taskStats.newMinorIssues }}个，未整改隐患{{ taskStats.unresolvedMinorIssues }}个。</div>
        </div>
      </div>

      <!-- 检查企业清单标题 -->
      <div class="section-title">
        <i class="title-marker"></i>
        检查企业清单
      </div>
      <!-- 检查企业清单表格 -->
      <div class="enterprise-list">
        <el-table :data="enterpriseList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="companyName" label="企业名称" show-overflow-tooltip />
          <el-table-column prop="regionName" label="区域" show-overflow-tooltip>
            <template #default="scope">
              {{ scope.row.regionName || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="inspectTime" label="检查时间">
            <template #default="scope">
              {{ formatDate(scope.row.inspectTime, 'YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="generalDangerCount" label="一般隐患数" align="center" />
          <el-table-column prop="majorDangerCount" label="重大隐患数" align="center" />
          <el-table-column prop="unRectifiedCount" label="未整改隐患数" align="center" />
          <el-table-column prop="inspectStatus" label="检查状态" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.inspectStatus === 1 ? 'success' : 'info'">
                {{ scope.row.inspectStatus === 1 ? '已检查' : '未检查' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="queryParams.pageNo"
            v-model:page-size="queryParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 内部隐患清单标题 -->
      <div class="section-title">
        <i class="title-marker"></i>
        内部隐患清单
      </div>
      <!-- 内部隐患清单表格 -->
      <div class="danger-list">
        <el-table :data="dangerList" border style="width: 100%">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="deptName" label="企业名称" show-overflow-tooltip />
          <el-table-column prop="dangerDesc" label="隐患描述" show-overflow-tooltip />
          <el-table-column prop="dangerLevel" label="隐患等级" align="center">
            <template #default="scope">
              {{ getDictLabel(DICT_TYPE.DANGER_LEVEL, scope.row.dangerLevel) }}
            </template>
          </el-table-column>
          <el-table-column prop="dangerAddress" label="隐患地址" show-overflow-tooltip />
          <el-table-column prop="dangerUrl" label="隐患照片" align="center">
            <template #default="scope">
              <el-image 
                v-if="scope.row.dangerUrl" 
                :src="scope.row.dangerUrl" 
                :preview-src-list="[scope.row.dangerUrl]"
                style="width: 50px; height: 50px; cursor: pointer;"
                fit="cover"
              />
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="inspectTime" label="检查时间" align="center">
            <template #default="scope">
              {{ formatDate(scope.row.inspectTime, 'YYYY-MM-DD HH:mm') }}
            </template>
          </el-table-column>
          <el-table-column prop="timeLimit" label="整改期限" align="center" />
          <el-table-column prop="rectConditionType " label="整改状态" align="center">
            <template #default="scope">
              {{ getDictLabel(DICT_TYPE.RECT_CONDITION_TYPE, scope.row.rectConditionType ) }}
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="dangerQueryParams.pageNo"
            v-model:page-size="dangerQueryParams.pageSize"
            :total="dangerTotal"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleDangerSizeChange"
            @current-change="handleDangerCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getInspectionTaskComPage, getInspectionTask } from '@/api/supervisoryInspect/taskDeploy'
import type { InspectionTaskComPageReqVO } from '@/api/supervisoryInspect/taskDeploy'

import { getDangerRectPage, type DangerRectPageReqVO } from '@/api/standardization/risks'
import { ElMessage, ElImage } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

const router = useRouter()
const route = useRoute()
const handleBack = () => router.back()

// 任务详情
const taskDetail = reactive({
  taskTitle: '',
  taskDescription: '',
  taskDate: '',
  inspectionStartTime: '',
  inspectionEndTime: '',
  taskSource: '',
  taskType: '',
  dispatchTime: ''
})

// 统计数据
const taskStats = reactive({
  totalEnterprises: 0,
  totalIssues: 0,
  newIssues: 0,
  unresolvedIssues: 0,
  minorIssues: 0,
  newMinorIssues: 0,
  unresolvedMinorIssues: 0
})

// 获取任务详情
const getTaskDetail = async () => {
  try {
    const res = await getInspectionTask(route.params.id as string)
    if (res) {
      taskDetail.taskTitle = res.taskTitle || '--'
      taskDetail.taskDescription = res.taskDescription || '--'
      taskDetail.taskSource = res.taskSource || '--'
      taskDetail.inspectionStartTime = res.inspectionStartTime || '--'
      taskDetail.inspectionEndTime = res.inspectionEndTime || '--'
      
      // 根据返回数据更新统计数据
      taskStats.totalEnterprises = res.compCount || 0
      taskStats.totalIssues = (res.hasHiddenDanger || res.generalDangerCount > 0 || res.majorDangerCount > 0) ? 1 : 0
      taskStats.newIssues = (res.generalDangerCount || 0) + (res.majorDangerCount || 0)
      taskStats.unresolvedIssues = res.unRectifiedCount || 0
      taskStats.minorIssues = res.generalDangerCount || 0
      taskStats.newMinorIssues = res.generalDangerCount || 0
      taskStats.unresolvedMinorIssues = res.unresolvedGeneral || 0
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
  }
}

// 企业列表查询参数
const queryParams = reactive<InspectionTaskComPageReqVO>({
  taskId: route.params.id as string,
  pageNo: '1',
  pageSize: '10'
})

// 企业列表数据
const enterpriseList = ref([])
const total = ref(0)

// 获取企业列表数据
const getEnterpriseList = async () => {
  try {
    const res = await getInspectionTaskComPage(queryParams)
    if (res && res.list) {
      enterpriseList.value = res.list
      total.value = res.total || 0
      
      // 如果有企业数据，获取第一个企业的隐患数据
      if (res.list.length > 0) {
        await getDangerList(res.list[0])
      }
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
  }
}

// 分页处理
const handleSizeChange = (val: number) => {
  queryParams.pageSize = val.toString()
  getEnterpriseList()
}

const handleCurrentChange = (val: number) => {
  queryParams.pageNo = val.toString()
  getEnterpriseList()
}

// 内部隐患列表相关
const dangerQueryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

// 获取隐患整改单数据
const dangerList = ref([])
const dangerLoading = ref(false)
const dangerTotal = ref(0)

// 获取隐患列表数据
const getDangerList = async (company) => {
  if (!company || !company.id) return
  
  dangerLoading.value = true
  try {
    const params = {
      pageNo: '1',
      pageSize: '10',
      inspectId: company.id // 使用企业的id作为inspectId查询参数
    }
    
    const response = await getDangerRectPage(params)
    console.log('隐患整改单接口响应:', response)
    
    if (response && response.list) {
      dangerList.value = response.list
    } else {
      dangerList.value = []
    }
  } catch (error) {
    console.error('获取隐患整改单失败:', error)
    ElMessage.error('获取隐患数据失败')
    dangerList.value = []
  } finally {
    dangerLoading.value = false
  }
}

const handleDangerSizeChange = (val: number) => {
  dangerQueryParams.pageSize = val
  getDangerList()
}

const handleDangerCurrentChange = (val: number) => {
  dangerQueryParams.pageNo = val
  getDangerList()
}

// 添加描述文字展开/收起功能
const isDescriptionExpanded = ref(false)

const toggleDescription = () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value
}





onMounted(() => {
  getTaskDetail()
  getEnterpriseList()
})
</script>

<style scoped>
.special-inspection-container {
  min-height: 100vh;
  background: #f5f7fa;

}

.top-action-bar {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 8px 16px;
  margin-bottom: 16px;
  border-radius: 4px;
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
  margin: 0 5px;
}

.action-text {
  color: #333;
  font-size: 14px;
}

.report-content {
  background: #fff;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* 报告标题样式 */
.report-header {
  background-color: #f2f2f2;
  padding: 16px 0;
  margin-bottom: 24px;
  border-radius: 4px;
}

.report-title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  color: #333;
}

.task-basic-info {
  margin-bottom: 24px;
  padding: 0 20px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
  line-height: 24px;
}

/* 两列布局样式 */
.info-row-flex {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.info-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-row:last-child,
.info-row-flex:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #333;
}

/* 标题和描述的样式 */
.info-row .info-label {
  min-width: 140px;
}

.info-row .info-value {
  flex: 1;
  word-break: break-all;
}

/* 描述文字样式 */
.description-text {
  max-height: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 24px;
}

/* 两列布局中的值样式 */
.info-col .info-value {
  margin-left: 8px;
}

.result-summary {
  background: #f8f9fa;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 4px;
}

.summary-title {
  font-weight: bold;
  margin-bottom: 12px;
}

.summary-content {
  color: #606266;
}

.summary-item {
  line-height: 24px;
  margin-bottom: 8px;
  &:last-child {
    margin-bottom: 0;
  }
}

/* 修改标题样式 */
.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.title-marker {
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

.enterprise-list,
.danger-list {
  margin-bottom: 24px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

/* 表格容器样式 */
.table-container {
  margin-top: 16px;
}

/* 分页器样式 */
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 表格内的图片列样式 */
:deep(.el-table .cell img) {
  max-width: 50px;
  max-height: 50px;
  cursor: pointer;
}

/* 表格内容样式优化 */
:deep(.el-table) {
  margin-bottom: 16px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 8px 0;
}

/* 状态标签样式 */
:deep(.el-tag) {
  padding: 0 12px;
  height: 24px;
  line-height: 24px;
}
</style>
