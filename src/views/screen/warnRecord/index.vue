<template>
  <div class="warn-record-container">
    <!-- 切换数据的部分 -->
    <div class="tab-buttons">
      <el-button
        :type="currentTab === 'unprocessed' ? 'primary' : ''"
        @click="switchData('unprocessed')"
        >未处理 ({{ unprocessedCount }})</el-button
      >
      <el-button
        :type="currentTab === 'processed' ? 'primary' : ''"
        @click="switchData('processed')"
        >已处理</el-button
      >
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form
        :inline="true"
        v-if="currentTab === 'unprocessed'"
        :model="unprocessedSearchForm"
        class="demo-form-inline"
      >
        <el-form-item label="风险等级">
          <el-select
            v-model="unprocessedSearchForm.riskLevel"
            placeholder="请选择风险等级"
            clearable
            style="width: 100px"
            popper-class="risk-level-select-dropdown"
          >
            <el-option
              v-for="item in riskLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="推送时间">
          <el-date-picker
            v-model="unprocessedSearchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="unprocessedSearchForm.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-else :model="processedSearchForm" class="demo-form-inline">
        <el-form-item label="风险等级">
          <el-select 
            v-model="processedSearchForm.riskLevel" 
            placeholder="请选择风险等级" 
            clearable
            style="width: 100px"
            popper-class="risk-level-select-dropdown"
          >
            <el-option
              v-for="item in riskLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处理时间">
          <el-date-picker
            v-model="processedSearchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="processedSearchForm.companyName" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格区域 -->
    <div class="table-area">
      <el-table
        :data="tableData"
        style="width: 100%; height: 340px"
        v-loading="tableLoading"
        :border="false"
        :stripe="false"
        element-loading-text="数据加载中..."
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.8)"
      >
        <el-table-column prop="companyName" label="企业名称">
          <template #default="scope">
            <span>{{
              scope.row.companyName && scope.row.companyName.trim()
                ? scope.row.companyName
                : '--'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="pushTime" label="推送时间">
          <template #default="scope">
            {{ formatDate(scope.row.pushTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="handleTime" label="处理时间" v-if="currentTab === 'processed'">
          <template #default="scope">
            {{ formatDate(scope.row.handleTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="riskLevel" label="风险等级">
          <template #default="scope">
            <span :style="{ color: getRiskLevelColor(scope.row.riskLevel) }">
              {{ getRiskLevelLabel(scope.row.riskLevel) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="pushContent" label="推送内容">
          <template #default="scope">
            <div class="multi-line-ellipsis" :title="scope.row.pushContent">
              {{ scope.row.pushContent }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="pushType" label="推送状态">
          <template #default="scope">
            <span v-if="scope.row.pushType === '0'">未下发</span>
            <span v-else-if="scope.row.pushType === '1'">已下发</span>
            <span v-else-if="scope.row.pushType === '2'">已反馈</span>
            <span v-else>{{ scope.row.pushType }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="currentTab === 'processed'" prop="feedback" label="反馈意见">
          <template #default="scope">
            <div class="multi-line-ellipsis" :title="scope.row.feedback">
              {{ scope.row.feedback }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="text" @click="handleDetail(scope.row)">详情</el-button>
            <el-button
              type="text"
              v-if="currentTab === 'unprocessed'"
              @click="handleProcess(scope.row)"
              >处理</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <Pagination
        :total="paginationParams.total"
        v-model:page="paginationParams.pageNum"
        v-model:limit="paginationParams.pageSize"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  getWarningPushRecordPage,
  type WarningPushRecordPageParams,
  getUnhandleCount
} from '@/api/monitoring/record/warningRecord/index'
import { formatDate } from '@/utils/formatTime'

const currentTab = ref('unprocessed')
const tableData = ref([])
const unprocessedCount = ref(0) // 默认显示0
const tableLoading = ref(false) // 表格加载状态

// 风险等级选项
const riskLevelOptions = ref([
  { value: '1', label: '重大' },
  { value: '2', label: '较大' },
  { value: '3', label: '一般' },
  { value: '4', label: '低' }
])

interface UnprocessedSearchForm {
  dateRange: any[]
  riskLevel: string
  companyName: string
}

const unprocessedSearchForm = ref<UnprocessedSearchForm>({
  dateRange: [],
  riskLevel: '',
  companyName: ''
})

const processedSearchForm = ref({
  dateRange: [],
  riskLevel: '',
  companyName: ''
})

// 分页参数
const paginationParams = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 获取风险等级标签
const getRiskLevelLabel = (riskLevel: string) => {
  const option = riskLevelOptions.value.find(item => item.value === riskLevel)
  return option ? option.label : '未知'
}

// 获取风险等级颜色
const getRiskLevelColor = (riskLevel: string) => {
  switch (riskLevel) {
    case '1':
      return '#f56c6c' // 红色 - 重大
    case '2':
      return '#e6a23c' // 橙色 - 较大
    case '3':
      return '#409eff' // 蓝色 - 一般
    case '4':
      return '#67c23a' // 绿色 - 低
    default:
      return '#909399' // 灰色 - 默认
  }
}

// 切换数据
const switchData = (tab: string) => {
  currentTab.value = tab
  paginationParams.pageNum = 1
  getTableData()
}

// 获取表格数据
const getTableData = async () => {
  tableLoading.value = true
  try {
    const params: WarningPushRecordPageParams = {
      pageNo: String(paginationParams.pageNum),
      pageSize: String(paginationParams.pageSize)
    }

    if (currentTab.value === 'unprocessed') {
      // 未处理数据
      if (unprocessedSearchForm.value.riskLevel) {
        params.riskLevel = unprocessedSearchForm.value.riskLevel
      }
      if (unprocessedSearchForm.value.companyName) {
        params.companyName = unprocessedSearchForm.value.companyName
      }
      if (unprocessedSearchForm.value.dateRange && unprocessedSearchForm.value.dateRange.length === 2) {
        params.beginPushTime = unprocessedSearchForm.value.dateRange[0]
        params.endPushTime = unprocessedSearchForm.value.dateRange[1]
      }
      params.pushType = '0' // 未下发
    } else {
      // 已处理数据
      if (processedSearchForm.value.riskLevel) {
        params.riskLevel = processedSearchForm.value.riskLevel
      }
      if (processedSearchForm.value.companyName) {
        params.companyName = processedSearchForm.value.companyName
      }
      if (processedSearchForm.value.dateRange && processedSearchForm.value.dateRange.length === 2) {
        params.beginPushTime = processedSearchForm.value.dateRange[0]
        params.endPushTime = processedSearchForm.value.dateRange[1]
      }
      params.pushType = '2' // 已反馈
    }

    const res = await getWarningPushRecordPage(params)
    tableData.value = res.pageData || []
    paginationParams.total = res.total || 0
  } catch (error) {
    console.error('获取预警记录失败:', error)
  } finally {
    tableLoading.value = false
  }
}

// 获取未处理数量
const getUnprocessedCount = async () => {
  try {
    const res = await getUnhandleCount()
    unprocessedCount.value = res || 0
  } catch (error) {
    console.error('获取未处理数量失败:', error)
  }
}

// 查询
const onSubmit = () => {
  paginationParams.pageNum = 1
  getTableData()
}

// 重置
const onReset = () => {
  if (currentTab.value === 'unprocessed') {
    unprocessedSearchForm.value = {
      dateRange: [],
      riskLevel: '',
      companyName: ''
    }
  } else {
    processedSearchForm.value = {
      dateRange: [],
      riskLevel: '',
      companyName: ''
    }
  }
  paginationParams.pageNum = 1
  getTableData()
}

// 查看详情
const handleDetail = (row: any) => {
  console.log('查看详情:', row)
  // TODO: 实现详情查看功能
}

// 处理预警
const handleProcess = (row: any) => {
  console.log('处理预警:', row)
  // TODO: 实现预警处理功能
}

// 监听分页变化
watch(
  () => [paginationParams.pageNum, paginationParams.pageSize],
  () => {
    getTableData()
  }
)

onMounted(() => {
  getTableData()
  getUnprocessedCount()
})
</script>

<style scoped lang="scss">
.warn-record-container {
  display: flex;
  width: 100%;
  height: 100%;
  color: #fff;
  flex-direction: column;

  .tab-buttons {
    display: flex;
    margin-bottom: 16px;
    gap: 8px;

    .el-button {
      color: #fff;
      background: rgb(255 255 255 / 10%);
      border: 1px solid rgb(255 255 255 / 20%);

      &:hover {
        background: rgb(255 255 255 / 20%);
      }

      &.el-button--primary {
        background: #409eff;
        border-color: #409eff;
      }
    }
  }

  .search-area {
    margin-bottom: 16px;

    .el-form {
      .el-form-item {
        margin-bottom: 8px;

        .el-form-item__label {
          color: #fff;
        }

        .el-input,
        .el-select,
        .el-date-editor {
          .el-input__wrapper {
            color: #fff;
            background: rgb(255 255 255 / 10%);
            border: 1px solid rgb(255 255 255 / 20%);

            .el-input__inner {
              color: #fff;

              &::placeholder {
                color: rgb(255 255 255 / 50%);
              }
            }
          }
        }

        // 专门为选择框添加样式
        .el-select {
          .el-input__wrapper {
            width: 140px;
            min-width: 140px;
          }
        }

        .el-button {
          color: #fff;
          background: rgb(255 255 255 / 10%);
          border: 1px solid rgb(255 255 255 / 20%);

          &:hover {
            background: rgb(255 255 255 / 20%);
          }

          &.el-button--primary {
            background: #409eff;
            border-color: #409eff;
          }
        }
      }
    }
  }

  .table-area {
    flex: 1;
    overflow: hidden;

    .el-table {
      color: #fff;
      background: transparent;

      .el-table__header-wrapper {
        .el-table__header {
          background: rgb(255 255 255 / 10%);

          th {
            color: #fff;
            background: rgb(255 255 255 / 10%);
            border-bottom: 1px solid rgb(255 255 255 / 20%);
          }
        }
      }

      .el-table__body-wrapper {
        .el-table__body {
          tr {
            background: rgb(255 255 255 / 5%);

            &:hover {
              background: rgb(255 255 255 / 10%);
            }

            td {
              color: #fff;
              background: transparent;
              border-bottom: 1px solid rgb(255 255 255 / 10%);
            }
          }
        }
      }
    }

    .multi-line-ellipsis {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style> 