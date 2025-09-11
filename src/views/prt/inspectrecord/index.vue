<template>
  <ContentWrap>
    <div style="background: #e7ecfe; padding: 5px; margin-bottom: 10px">
      检查记录来源于企业日常、专项、政府专项检查清单所生成的检查记录明细
    </div>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
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
              style="width: 135px"
            >
              <el-option label="检查记录编号" value="1" />
              <el-option label="检查清单单据编号" value="2" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="单据状态" prop="inspectStatus">
        <el-select
          v-model="queryParams.inspectStatus"
          placeholder="请选择检查状态"
          clearable
          class="!w-240px"
          @change="handleQuery()"
        >
          <el-option label="待检查" value="1" />
          <el-option label="已检查" value="5" />
          <el-option label="已作废" value="15" />
        </el-select>
      </el-form-item>
      <el-form-item label="单据类型" prop="inspectStatus">
        <el-select
          @change="handleQuery()"
          v-model="queryParams.inspectListCat"
          placeholder="请选择检查状态"
          clearable
          class="!w-240px"
        >
          <el-option label="企业日常检查单" value="1" />
          <el-option label="企业专项检查单" value="5" />
          <el-option label="政府专项检查单" value="8" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查结果" prop="inspectResult">
        <el-select
          @change="handleQuery()"
          v-model="queryParams.inspectResult"
          placeholder="请选择检查状态"
          clearable
          class="!w-240px"
        >
          <el-option label="正常" value="1" />
          <el-option label="异常" value="10" />
          <el-option label="逾期未检" value="15" />
        </el-select>
      </el-form-item>
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
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['prt:inspect-record:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['prt:inspect-record:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column
        label="检查日期"
        align="center"
        prop="inspectTime"
        :formatter="dateFormatter"
      />
      <el-table-column label="检查记录编号" align="center" prop="inspectRecordCode" width="120px" />
      <el-table-column label="单据状态" align="center" prop="inspectStatus">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.INSPECT_STATUS, scope.row.inspectStatus) }}
        </template>
      </el-table-column>
      <el-table-column label="检查清单单据编号" align="center" prop="inspectCode" width="160px" />
      <el-table-column label="检查人员" align="center" prop="inspectUserName" />
      <el-table-column label="风险点名称" align="center" prop="riskName" width="120px" />
      <el-table-column label="风险点类型" align="center" prop="riskType" width="120px">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.RISKTYPE, scope.row.riskType) }}
        </template>
      </el-table-column>
      <el-table-column label="风险等级" align="center" prop="overallRisk">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.OVERALLRISK, scope.row.overallRisk) }}
        </template>
      </el-table-column>
      <el-table-column label="管控层级" align="center" prop="controlLevel">
        <template #default="scope">
          {{ getValue(scope.row.controlLevel,scope.$index) }}
        </template>
      </el-table-column>
      <el-table-column label="责任部门名称" align="center" prop="respDeptName" width="120px" />
      <el-table-column label="检查结果" align="center" prop="inspectResult">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.INSPECT_RESULT, scope.row.inspectResult) }}
        </template>
      </el-table-column>
      <el-table-column
        label="本次有效检查开始时间"
        align="center"
        prop="validStartTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="本次有效检查结束时间"
        align="center"
        prop="validEndTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="100px" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('details', scope.row.id)"
            v-hasPermi="['prt:inspect-record:details']"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>
  <el-drawer v-model="dialogVisible" title="检查任务分配" width="500" :before-close="handleClose">
    <ChecklistEdit v-if="dialogVisible" :initialData="ChecklistEditInit" ref="ChecklistEditRef" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm()"> 保存</el-button>
      </div>
    </template>
  </el-drawer>
  <!-- 表单弹窗：添加/修改 -->
  <InspectRecordForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import download from '@/utils/download'
import { InspectRecordApi, InspectRecordVO } from '@/api/prt/inspectrecord'
import InspectRecordForm from './InspectRecordForm.vue'
import { useRouter } from 'vue-router'
import ChecklistEdit from '@/views/prt/enterprise/component/ChecklistEdit.vue'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

/** 检查记录 列表 */
defineOptions({ name: 'InspectRecord' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<InspectRecordVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = ref({
  test2: '',
  test1: '1',
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
  inspectRecordCode: '',
  inspectStatus: undefined,
  inspectResult: undefined,
  validStartTime: [],
  validEndTime: [],
  inspectTaskId: undefined,
  inspectType: undefined,
  inspectUsers: undefined,
  submitType: undefined,
  inspectFrqType: undefined,
  cycleFrqType: undefined,
  cycleFrqNumber: undefined,
  cycleFrqTimeType: undefined,
  cycleFrqTimes: undefined,
  inspectId: undefined,
  inspectName: undefined,
  inspectCode: '',
  inspectListCat: undefined,
  inspectItemType: undefined,
  inspectTarget: undefined,
  govInspectListType: undefined,
  govAgencyName: undefined,
  govAgencyCode: undefined,
  validType: undefined,
  startTime: [],
  endTime: [],
  riskId: undefined,
  riskName: undefined,
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: undefined,
  controlLevel: undefined,
  respDeptId: undefined,
  respDeptName: undefined,
  riskUnitId: undefined,
  riskUnitName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  supervisorUserName: undefined,
  inspectorUser: undefined,
  inspectorUserName: undefined,
  inspectUserIds: undefined,
  inspectUserId: undefined,
  inspectUserName: undefined,
  inspectTime: [],
  supportInfoUrl: undefined,
  supportInfoUrlName: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中
const dialogVisible = ref(false)
const ChecklistEditRef = ref()
const ChecklistEditInit = {}
const submitForm = async () => {
  let form = { state: false, data: null }
  if (ChecklistEditRef.value != null) {
    form = await ChecklistEditRef.value.validate()
  }
  console.log('------------', form)
}
const handleClose = () => {
  dialogVisible.value = false
}
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectRecordApi.getInspectRecordPage(queryParams.value)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNo = 1
  queryParams.value.inspectCode = ''
  queryParams.value.inspectRecordCode = ''
  if (queryParams.value.test1 == '1') {
    queryParams.value.inspectRecordCode = queryParams.value.test2
  } else {
    queryParams.value.inspectCode = queryParams.value.test2
  }
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryParams.value = {}
  queryParams.value.test2 = ''
  queryParams.value.test1 = '1'
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const router = useRouter() // 路由
const openForm = (type: string, id?: number) => {
  if (type == 'details') {
    //   打开详情页面
    router.push({
      name: 'inspectrecordDetails',
      query: { id: id }
    })
  }
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await InspectRecordApi.exportInspectRecord(queryParams.value)
    download.excel(data, '检查记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

import * as RiskLevelApi from '@/api/prt/risklevel'

let RiskLeveList = ref<RiskLevelApi.RiskVO[]>([])
const getRiskLeveList = async () => {
  RiskLeveList.value = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams.value)
}
const getValue = (item: any,index : number) => {
  let str = ''
  if(RiskLeveList.value!= null && RiskLeveList.value.list!= null ){
    RiskLeveList.value.list.forEach((i) => {
      if (i.id === item) {
        str =  i.controlLevel
      }
    })
  }
  return str;
}
/** 初始化 **/
onMounted(async () => {
  await getRiskLeveList()
  getList()
})
</script>

<style lang="scss" scoped>
.myDiv div {
  margin-top: 10px;
}
</style>
