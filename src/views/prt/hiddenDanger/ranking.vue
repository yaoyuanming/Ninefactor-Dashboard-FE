<template>
  <ContentWrap>
    <div style="background: #e7ecfe; padding: 10px">
      统计隐患上报排行，优化采纳隐患数，其次上报总数，统计数据相同则并列排行名称；
    </div>
    <!-- 搜索工作栏 -->
    <el-form
      style="margin-top: 10px"
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <div>
        <el-form-item label="" prop="inspectRecordCode">
          <el-select
            style="width: 100px"
            v-model="queryParams.type"
            placeholder="请选择时间"
            @change="handleQuery"
            clearable
          >
            <el-option label="按日" value="1" />
            <el-option label="按月" value="2" />
            <el-option label="按年" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="" prop="inherentRisk" v-if="queryParams.type == '1'">
          <el-date-picker
            v-model="myDate"
            @change="handleQuery()"
            type="daterange"
            value-format="x"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <div style="margin-left: 10px">
            <el-space wrap>
              <div @click="setDate(7)" style="cursor: pointer;">近7天</div>
              <div>|</div>
              <div @click="setDate(30)" style="cursor: pointer;">近30天</div>
              <div>|</div>
              <div @click="setDate(90)" style="cursor: pointer;">近90天</div>
            </el-space>
          </div>
        </el-form-item>
        <el-form-item label="" prop="inherentRisk" v-if="queryParams.type == '2'">
          <el-date-picker
            @change="handleQuery()"
            v-model="queryParams.month"
            type="month"
            value-format="MM"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        <el-form-item label="" prop="inherentRisk" v-if="queryParams.type == '3'">
          <el-date-picker
            @change="handleQuery()"
            v-model="queryParams.year"
            type="year"
            value-format="YYYY"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
      </div>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
        <el-button
          v-hasPermi="['prt:hiddenDanger:export']"
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      style="overflow-x: auto"
    >
      <el-table-column label="排名" align="center" prop="ranking" />
      <el-table-column label="员工" align="center" prop="reportUserName" />
      <el-table-column label="手机号" align="center" prop="reportUserMobile" />
      <el-table-column label="部门" align="center" prop="reportUserDeptName" />
      <el-table-column label="上报总数" align="center" prop="reportTatalNum" />
      <el-table-column label="重大隐患数" align="center" prop="majorDangerNum" />
      <el-table-column label="一般隐患数" align="center" prop="generalDangerNum" />
      <el-table-column label="采纳数" align="center" prop="adoptNum" />
    </el-table>
    <!-- 分页 -->
<!--    <Pagination-->
<!--      :total="total"-->
<!--      v-model:page="queryParams.pageNo"-->
<!--      v-model:limit="queryParams.pageSize"-->
<!--      @pagination="getList"-->
<!--    />-->
  </ContentWrap>
</template>

<script setup lang="ts">
import download from '@/utils/download'
import { RecordApi, DangerReportRecordSaveReqVO } from '@/api/prt/hiddenDanger'

/** 风险点 列表 */
defineOptions({ name: 'Risk' })
let myDate = ref([])
// 设置时间
const setDate = (val: number) => {
  if (val == 7) {
    //   则设置时间为今天和七天前的时间戳，以此类推
    myDate.value = [Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()]
  } else if (val == 30) {
    myDate.value = [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()]
  } else if (val == 90) {
    myDate.value = [Date.now() - 90 * 24 * 60 * 60 * 1000, Date.now()]
  }
  getList()
}
const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<DangerReportRecordSaveReqVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  type: '1',
  test2: '',
  month: '',
  year: '',
  test1: '1',
  startDate: undefined,
  endDate: undefined,
  pageSize: 10,
  reportUserDeptName: '',
  reportUserName: ''
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    //   请求上报明细列表
    const data = await RecordApi.getStatPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  if (myDate.value != null) {
    queryParams.startDate = myDate.value[0]
    queryParams.endDate = myDate.value[1]
  }
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.test1 = '1'
  queryParams.test2 = ''
  handleQuery()
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await RecordApi.exportRecord(queryParams)
    download.excel(data, `上报明细批量导出.xls`)
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
