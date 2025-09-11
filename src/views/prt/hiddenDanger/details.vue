<template>
  <ContentWrap>
    <div style="background: #e7ecfe; padding: 10px"
    >隐患上报记录来源于隐患速记，用于记录员工上报的隐患信息；
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
      <div >
        <el-form-item label="" prop="inspectRecordCode">
          <el-input
            v-model="queryParams.test2"
            placeholder="请输入"
            class="input-with-select"
            @keyup.enter="handleQuery"
          >
            <template #prepend>
              <el-select
                @change="handleQuery"
                v-model="queryParams.test1"
                placeholder="请选择"
                style="width: 115px"
              >
                <el-option label="员工" value="1" />
                <el-option label="部门" value="2" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="处理状态" prop="dangerReportState">
          <el-select
            @change="handleQuery"
            v-model="queryParams.dangerReportState"
            placeholder="请选择"
            clearable
            class="!w-240px"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.DANGER_REPORT_STATE)"
              :key="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="">
          <el-date-picker
            v-model="mydate"
            type="daterange"
            value-format="x"
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
      <el-table-column label="记录编号" align="center" prop="记录编号" />
      <el-table-column label="上报时间" align="center" prop="createTime"  :formatter="dateFormatter"/>
      <el-table-column label="状态" align="center" prop="dangerReportState">
        <template #default="scope">
          <div>{{ getDictLabel(DICT_TYPE.DANGER_REPORT_STATE, scope.row.dangerReportState) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="姓名" align="center" prop="reportUserName" />
      <el-table-column label="账号" align="center" prop="reportUserAccount" />
      <el-table-column label="手机号" align="center" prop="reportUserMobile" />
      <el-table-column label="部门" align="center" prop="reportUserDeptName" />
      <el-table-column label="隐患描述" align="center" prop="dangerDesc" />
      <el-table-column label="隐患图片" align="center" prop="dangerUrl">
        <template #default="{ row }">
          <el-image
            class="h-80px w-80px"
            lazy
            :src="row.dangerUrl"
            :preview-src-list="[row.dangerUrl.split(',')]"
            preview-teleported
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="隐患等级" align="center" prop="dangerLevel">
        <template #default="scope">
          <div>{{ getDictLabel(DICT_TYPE.DANGER_LEVEL, scope.row.dangerLevel) }}</div>
        </template>
      </el-table-column>
      <el-table-column label="隐患位置" align="center" prop="dangerAddress" />
<!--      <el-table-column label="操作" align="center" min-width="120px" fixed="right">-->
<!--        <template #default="scope">-->
<!--          <el-button link type="primary" @click="openForm('details', scope.row.id)">-->
<!--            &lt;!&ndash;            v-hasPermi="['prt:risk:update']"&ndash;&gt;-->
<!--            详情-->
<!--          </el-button>-->
<!--        </template>-->
<!--      </el-table-column>-->
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import download from '@/utils/download'
import { RecordApi, DangerReportRecordSaveReqVO } from '@/api/prt/hiddenDanger'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'

/** 风险点 列表 */
defineOptions({ name: 'Risk' })
const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<DangerReportRecordSaveReqVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  date1: '1',
  test2: '',
  test1: '1',
  startDate: undefined,
  dangerReportState: undefined,
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
    const data = await RecordApi.getRecordPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
let mydate = ref(null)

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  queryParams.reportUserName = ''
  queryParams.reportUserDeptName = ''
  if (queryParams.test1 == '1') {
    queryParams.reportUserName = queryParams.test2
  } else if (queryParams.test1 == '2') {
    queryParams.reportUserDeptName = queryParams.test2
  }
  if (mydate.value != null) {
    queryParams.startDate = mydate.value[0]
    queryParams.endDate = mydate.value[1]
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

/** 添加/修改操作 */
const formRef = ref()
// const router = useRouter() // 路由
const openForm = (type: string, id?: number) => {
  // if (type == 'details') {
  //   router.push({
  //     name: 'risklistDetails',
  //     query: { id: id }
  //   }) 1
  // } else {
  //   router.push({
  //     name: 'risklistEdit',
  //     query: { id: id }
  //   })
  // }
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
