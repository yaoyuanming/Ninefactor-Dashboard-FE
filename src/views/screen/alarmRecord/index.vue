<template>
  <div class="alarm-record-container">
    <!-- 切换数据的部分，可以使用 Element Plus 的 Tabs 或 Button 组件 -->
    <div class="tab-buttons">
      <el-button
        :type="currentTab === 'unprocessed' ? 'primary' : ''"
        @click="switchData('unprocessed')"
        >未消警 ({{ unprocessedCount }})</el-button
      >
      <el-button
        :type="currentTab === 'processed' ? 'primary' : ''"
        @click="switchData('processed')"
        >已消警</el-button
      >
    </div>

    <!-- 日期选择器、搜索框和表格区域 -->
    <div class="search-area">
      <el-form
        :inline="true"
        v-if="currentTab === 'unprocessed'"
        :model="unprocessedSearchForm"
        class="demo-form-inline"
      >
        <!-- <el-form-item label="报警等级" >
          <el-select v-model="unprocessedSearchForm.alarmGradeList" placeholder="请选择报警等级" clearable>
            <el-option
              v-for="dict in alarmLevelOptions"
              :key="String(dict.value)"
              :label="dict.label"
              :value="dict.value"
            >
              <span :style="{ color: getAlarmLevelColor(dict) }">{{ dict.label }}</span>
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="报警类型">
          <el-select
            v-model="unprocessedSearchForm.alarmType"
            placeholder="请选择报警类型"
            clearable
          >
            <el-option
              v-for="item in getDictOptions(DICT_TYPE.MWS_ALARM_TYPE)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报警时间">
          <el-date-picker
            v-model="unprocessedSearchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">查询</el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-form :inline="true" v-else :model="processedSearchForm" class="demo-form-inline">
        <!-- <el-form-item label="报警等级">
          <el-select v-model="processedSearchForm.alarmGradeList" placeholder="请选择报警等级" clearable>
            <el-option
              v-for="dict in alarmLevelOptions"
              :key="String(dict.value)"
              :label="dict.label"
              :value="dict.value"
            >
              <span :style="{ color: getAlarmLevelColor(dict) }">{{ dict.label }}</span>
            </el-option>
          </el-select>
        </el-form-item> -->
        <el-form-item label="报警类型">
          <el-select v-model="processedSearchForm.alarmType" placeholder="请选择报警类型" clearable>
            <el-option
              v-for="item in getDictOptions(DICT_TYPE.MWS_ALARM_TYPE)"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="消警时间">
          <el-date-picker
            v-model="processedSearchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <!-- <el-form-item label="设备编码">
          <el-input v-model="processedSearchForm.nodeCodeList" placeholder="请输入设备名称" />
        </el-form-item> -->
        <!-- TODO: 添加已消警的其他搜索字段 -->
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
        <el-table-column prop="alarmPosition" label="报警位置">
          <template #default="scope">
            <span>{{
              scope.row.alarmPosition && scope.row.alarmPosition.trim()
                ? scope.row.alarmPosition
                : '--'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="warningDate" label="报警时间">
          <template #default="scope">
            {{ formatDate(scope.row.warningDate) }}
          </template>
        </el-table-column>
        <el-table-column prop="clearDate" label="消警时间" v-if="currentTab === 'processed'">
          <template #default="scope">
            {{ formatDate(scope.row.clearDate) }}
          </template>
        </el-table-column>
        <el-table-column label="报警设备类型">
          <template #default>
            <div class="multi-line-ellipsis" title="摄像头"> 摄像头 </div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="alarmTypeName" label="报警事件名称" >
    
          <template #default="scope">
            <div class="multi-line-ellipsis" :title="scope.row.alarmTypeName">
              {{ scope.row.alarmTypeName }}
            </div>
          </template>
        </el-table-column> -->

        <!-- <el-table-column
          prop="handleStat"
          label="处理状态"
          width="100"
          v-if="currentTab === 'processed'"
        >
          <template #default="scope">
            <span v-if="scope.row.handleStat === 0">未处理</span>
            <span v-else-if="scope.row.handleStat === 1">处理中</span>
            <span v-else-if="scope.row.handleStat === 2">已处理</span>
            <span v-else-if="scope.row.handleStat === 3">误报</span>
            <span v-else-if="scope.row.handleStat === 4">忽略</span>
            <span v-else>{{ scope.row.handleStat }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="alarmGrade" label="报警等级">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.MWS_ALARM_GRADE" :value="scope.row.alarmGrade" />
          </template>
        </el-table-column> -->
        <el-table-column prop="alarmType" label="报警类型">
          <template #default="scope">
            <span>{{
              alarmTypeDict.find((item) => String(item.value) === String(scope.row.alarmType))
                ?.label || '其他类型'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="currentTab === 'processed'" prop="handleMessage" label="处理内容">
          <template #default="scope">
            <div class="multi-line-ellipsis" :title="scope.row.handleMessage">
              {{ scope.row.handleMessage }}
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
              >消警处置</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <!-- TODO: 添加分页组件 -->
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
  getAlarmRecordPage,
  type AlarmRecordPageReqVO,
  getUnhandleAlarmCount
} from '@/api/monitoring/record/alarmrecord/index'
import { formatDate } from '@/utils/formatTime'
import { getDictOptions, DICT_TYPE, DictDataType } from '@/utils/dict'
import { DictTag } from '@/components/DictTag'

const currentTab = ref('unprocessed')
const tableData = ref([])
const unprocessedCount = ref(0) // 默认显示0
const tableLoading = ref(false) // 表格加载状态

interface UnprocessedSearchForm {
  dateRange: any[]
  alarmGradeList: string
  alarmType: string
}
const unprocessedSearchForm = ref<UnprocessedSearchForm>({
  dateRange: [],
  alarmGradeList: '',
  alarmType: ''
})

const processedSearchForm = ref({
  dateRange: [],
  alarmGradeList: '',
  alarmType: ''
  // TODO: 添加已消警的其他搜索字段
})

// 分页参数
const paginationParams = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0 // 总条数
})

// 获取路由实例
const router = useRouter()

// 报警类型字典
const alarmTypeDict = ref<any[]>([])

// 获取报警类型字典
const getAlarmTypeDict = async () => {
  alarmTypeDict.value = await getDictOptions(DICT_TYPE.MWS_ALARM_TYPE)
  console.log('报警类型字典数据:', alarmTypeDict.value)
}

// 存储报警等级字典
const alarmLevelOptions = ref<DictDataType[]>([])

// 获取报警记录列表
const fetchAlarmRecords = async () => {
  tableLoading.value = true // 开始加载
  const apiQueryParams: AlarmRecordPageReqVO = {
    pageNum: String(paginationParams.pageNum),
    pageSize: String(paginationParams.pageSize),
    handleStat: currentTab.value === 'unprocessed' ? '0' : '2',

    ...(currentTab.value === 'unprocessed'
      ? {
          alarmStartDateString: unprocessedSearchForm.value.dateRange?.[0] || undefined,
          alarmEndDateString: unprocessedSearchForm.value.dateRange?.[1] || undefined,
          alarmGrade: unprocessedSearchForm.value.alarmGradeList
            ? unprocessedSearchForm.value.alarmGradeList
            : undefined,
          alarmType: unprocessedSearchForm.value.alarmType
            ? unprocessedSearchForm.value.alarmType
            : undefined
        }
      : {
          handleStartDateString: processedSearchForm.value.dateRange?.[0] || undefined,
          handleEndDateString: processedSearchForm.value.dateRange?.[1] || undefined,
          alarmGrade: processedSearchForm.value.alarmGradeList
            ? processedSearchForm.value.alarmGradeList
            : undefined,
          alarmType: processedSearchForm.value.alarmType
            ? processedSearchForm.value.alarmType
            : undefined
        })
  }

  try {
    // 调用接口，并直接使用返回的数据部分
    const res = await getAlarmRecordPage(apiQueryParams)
    tableData.value = res.pageData
    paginationParams.total = res.totalRows
  } catch (error) {
    console.error('获取报警记录失败:', error)
  } finally {
    tableLoading.value = false // 结束加载
  }
}

// 获取未处理报警数量
const fetchUnhandleCount = async () => {
  try {
    const res = await getUnhandleAlarmCount()
    if (res !== undefined) {
      unprocessedCount.value = res
    }
  } catch (error) {
    console.error('获取未处理报警数量失败:', error)
  }
}

// 切换 Tab
const switchData = (tab: string) => {
  currentTab.value = tab
  paginationParams.pageNum = 1
}

const onSubmit = () => {
  paginationParams.pageNum = 1 // 查询时重置分页
  fetchAlarmRecords()
}

const onReset = () => {
  if (currentTab.value === 'unprocessed') {
    unprocessedSearchForm.value.dateRange = []
    unprocessedSearchForm.value.alarmGradeList = ''
    unprocessedSearchForm.value.alarmType = ''
  } else {
    processedSearchForm.value.dateRange = []
    processedSearchForm.value.alarmGradeList = ''
    processedSearchForm.value.alarmType = ''
  }
  // TODO: 重置其他搜索字段
  paginationParams.pageNum = 1 // 重置时重置分页
  console.log('重置')
  fetchAlarmRecords() // 立即刷新表格数据
}

const handleDetail = (row: any) => {
  console.log('详情', row)
  // 检查是否存在 id
  if (row.id) {
    router.push({
      path: `/monitoring/record/detail/${row.id}` // 路径中仍然保留 i
    })
  } else {
    console.error('报警记录缺少ID，无法跳转到详情页面', row)
  }
}

const handleProcess = (row: any) => {
  console.log('消警处置', row)
  router.push({ path: `/monitoring/record/process/${row.id}` }) // 并携带报警记录ID
}

// 组件挂载时获取未处理报警数量和列表数据
onMounted(() => {
  fetchUnhandleCount()
  fetchAlarmRecords() // 主动调用一次获取列表数据
  getAlarmTypeDict()
  // 获取报警等级字典
  alarmLevelOptions.value = getDictOptions(DICT_TYPE.MWS_ALARM_GRADE)
})

// 使用 watch 监听分页参数变化来触发数据加载
watch(
  () => [paginationParams.pageNum, paginationParams.pageSize, currentTab.value], // 监听页码、每页大小和当前 tab 的变化
  () => {
    fetchAlarmRecords()
  }
  // 移除 immediate: true，因为我们已经在 onMounted 中主动调用了
)

function getAlarmLevelColor(dict: any) {
  if (dict.cssClass) return dict.cssClass // 优先使用字典配置的颜色
  switch (dict.label) {
    case '严重':
      return '#f5222d' // 红色
    case '一般':
      return '#e6a23c' // 橙色
    case '轻微':
      return '#409eff' // 蓝色
    default:
      return '#606266'
  }
}
</script>

<style scoped lang="scss">
.alarm-record-container {
  color: #fff;
  padding: 10px;
}

.tab-buttons {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 4px;
  :deep(.el-form-item__label) {
    color: #fff;
  }
}

.search-area .el-select,
.search-area .el-input {
  width: 200px; /* 根据需要调整选择框和输入框的宽度 */
}

.multi-line-ellipsis {
  display: -webkit-box;
  max-height: 3em;
  overflow: hidden;
  line-height: 1.5;
  text-overflow: ellipsis;
  word-break: break-all;
  white-space: normal;
  cursor: pointer;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

:deep(.el-table__header-wrapper th) {
  font-weight: bold;
  color: #303133;
  /* background-color: #f5f7fa; */
}

.table-area {
  :deep(.el-table--fit) {
    background-color: rgba(255,255,255, 0.8) !important;
  }
  :deep(.el-table) {
    tr, th {
      background-color: rgba(255,255,255, 0.8) !important;
      // color: rgba(255,255,255, 0.6);
    }
  }
}
</style>
