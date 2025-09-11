<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="企业日常检查单" name="1" />
      <el-tab-pane label="企业专项检查清单" name="2" />
    </el-tabs>
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
              style="width: 115px"
            >
              <el-option label="风险点名称" value="1" v-if="activeName == '1'" />
              <el-option label="单据编号" value="2" />
              <el-option label="检查清单名称" value="3" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <template v-if="activeName == '1'">
        <el-form-item label="风险点类型">
          <el-select
            v-model="queryParams.riskType"
            placeholder="请选择"
            style="width: 115px"
            @change="handleQuery"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.RISKTYPE)"
              :key="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select
            v-model="queryParams.overallRisk"
            placeholder="请选择"
            style="width: 115px"
            @change="handleQuery"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.RISKLEVEL)"
              :key="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="管控层级">
          <el-select
            v-model="queryParams.controlLevel"
            placeholder="请选择"
            style="width: 115px"
            @change="handleQuery"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in RiskLeveList"
              :key="key"
            />
          </el-select>
        </el-form-item>
      </template>
      <template v-else>
        <el-form-item label="检查类型">
          <el-select
            v-model="queryParams.inspectionType"
            placeholder="请选择"
            style="width: 115px"
            @change="handleQuery"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, key) in getIntDictOptions(DICT_TYPE.INSPECTION_TYPE)"
              :key="key"
            />
          </el-select>
        </el-form-item>
      </template>

      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
<!--      v-hasPermi="['prt:enterprise:created']"  -->
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-if="activeName == '2'"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-if="activeName == '1'"
          v-hasPermi="['prt:enterprise:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
        <el-button
          type="success"
          plain
          @click="openImport"
          :loading="exportLoading"
          v-if="activeName == '2'"
          v-hasPermi="['prt:enterprise:import']"
        >
          <Icon icon="ep:download" class="mr-5px" />
          批量导入
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
      <el-table-column label="单据编号" align="center" prop="inspectCode" />
      <el-table-column label="检查清单名称" align="center" prop="inspectName" width="120px" />
      <template v-if="activeName == '1'">
        <el-table-column label="风险点" align="center" prop="riskName" />
        <el-table-column label="风险等级" align="center" prop="overallRisk">
          <template #default="scope">
            {{ getDictLabel(DICT_TYPE.OVERALLRISK, scope.row.overallRisk) }}
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="riskType">
          <template #default="scope">
            {{ getDictLabel(DICT_TYPE.RISKTYPE, scope.row.riskType) }}
          </template>
        </el-table-column>
        <el-table-column label="风险单元" align="center" prop="riskUnitName" />
        <el-table-column label="管控层级" align="center" prop="controlLevel">
          <template #default="scope">
            {{ getValue(scope.row.controlLevel, 1) }}
          </template>
        </el-table-column>
        <el-table-column label="责任部门" align="center" prop="respDeptName" />
        <el-table-column label="管控责任人" align="center" prop="respUserName" width="120px" />
      </template>
      <template v-else>
        <el-table-column label="检查类型" align="center" prop="inspectionType">
          <template #default="scope">
            {{ getDictLabel(DICT_TYPE.INSPECTION_TYPE, scope.row.inspectionType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="下发日期"
          align="center"
          prop="listDate"
          :formatter="dateFormatter2"
        />
      </template>
      <el-table-column label="检查人员" align="center" prop="inspectUserName" />
      <el-table-column label="检查频次" align="center" prop="frequency" />
      <el-table-column label="检查任务生效时间" align="center" prop="StartTime" width="160px">
        <template #default="scope">
          {{ dateFormatter2(null, {} as any, scope.row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        :min-width="activeName == '1' ? '150px' : '300px'"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('detailsRC', scope.row.id)"
            v-if="activeName == '1'"
          >
<!--            v-hasPermi="['prt:enterprise:details']"-->
            详情
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('edit', scope.row.id)"
            v-if="activeName == '2'"
            v-hasPermi="['prt:enterpriseZX:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="activeName == '2'"
            v-hasPermi="['prt:enterpriseZX:delete']"
          >
            删除
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('detailsRW', scope.row.id)"
          >
<!--            v-hasPermi="['prt:enterprise:task']"-->

            任务分配
          </el-button>
          <el-button
            link
            type="primary"
            @click="openForm('detailsZX', scope.row.id)"
            v-if="activeName == '2'"

          >
<!--            v-hasPermi="['prt:enterpriseZX:details']"-->
            详情
          </el-button>
          <el-button
            v-hasPermi="['prt:enterprise:record']"
            link
            type="primary"
            @click="openForm('detailsZX', scope.row.id, 2)"
            v-if="activeName == '2'"
          >
            检查记录
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
  <ChecklistEdit ref="ChecklistEditRef" @submit="getList" />
  <Dialog
    center
    v-model="importDialogVisible"
    title="批量导入"
    width="800"
    :before-close="handleClose"
  >
    <Import v-if="importDialogVisible" v-model="ImportModel" @submit="importSubmit" />
  </Dialog>
</template>

<script setup lang="ts">
import {usePageStore} from "@/store/modules/pageStore";
const PageStore = usePageStore()
import download from '@/utils/download'
import { InspectRespAPI, InspectRespVO } from '@/api/prt/inspect'
import { useRouter } from 'vue-router'
import ChecklistEdit from '@/views/prt/enterprise/component/ChecklistEdit.vue'

/** 风险点 列表 */
defineOptions({ name: 'Risk' })
const getTag = computed(() => {
  return PageStore.getPrtWorkTag
})
let activeName = ref(getTag||'1')
const handleClick = (e) => {
  PageStore.setPrtWorkTag(e.props.name)
  console.log("PageStore.getPrtWorkTag",PageStore.getPrtWorkTag)
  if (e.index == 0) {
    queryParams.inspectListCat = 1
    queryParams.test1 = '1'
  } else {
    queryParams.inspectListCat = 5
    queryParams.test1 = '2'
  }
  queryParams.test2 = ''
  queryParams.controlLevel = ''
  queryParams.overallRisk = ''
  queryParams.riskType = ''
  queryParams.inspectionType = ''
  getList()
}

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

const loading = ref(true) // 列表的加载中
const list = ref<InspectRespVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
let queryParams = reactive({
  pageNo: 1,
  inspectListCat: 1,
  test2: '',
  test1: '1',
  pageSize: 10,
  deptId: undefined,
  inspectCode: '',
  overallRisk: '',
  riskUnitId: undefined,
  riskName: '',
  inspectName: '',
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: '',
  inspectionType: '',
  isEnable: undefined,
  controlEffectiveness: undefined,
  controlLevel: '',
  respDeptId: undefined,
  respDeptName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  inspectorUser: undefined,
  dataSources: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectRespAPI.getInspectPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
import * as RiskLevelApi from '@/api/prt/risklevel'
import Import from '@/views/prt/risk/component/Import.vue'
import { dateFormatter2 } from '@/utils/formatTime'

let RiskLeveList = ref<RiskLevelApi.RiskVO[]>([])
const getRiskLeveList = async () => {
  let myList = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams)
  if (myList.list != null) {
    myList.list.forEach((item: any) => {
      const myData = { value: item.id, label: item.controlLevel } as RiskLevelApi.RiskVO;
      RiskLeveList.value.push(myData)
    })
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  queryParams.inspectCode = ''
  queryParams.riskName = ''
  queryParams.inspectName = ''
  if (queryParams.test1 == '1') {
    queryParams.riskName = queryParams.test2
  } else if (queryParams.test1 == '2') {
    queryParams.inspectCode = queryParams.test2
  } else if (queryParams.test1 == '3') {
    queryParams.inspectName = queryParams.test2
  }
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  queryParams.test2 = ''
  queryParams.test1 = activeName.value == '1' ? '1' : '2'
  queryParams.controlLevel = ''
  queryParams.overallRisk = ''
  queryParams.riskType = ''
  queryParams.inspectionType = ''
  handleQuery()
}

const getValue = (item: any, type: number) => {
  if (type == 1) {
    RiskLeveList.value.forEach((i) => {
      if (i.value === item) {
        return i.controlLevel
      }
    })
  }
}
const router = useRouter() // 路由
let dialogVisible = ref(false)
const openForm = async (type: string, id?: number, state?: number) => {
  if (type == 'detailsRW') {
    //   打开弹窗
    // 获取任务
    ChecklistEditRef.value.open(id)
    dialogVisible.value = true
  } else if (type == 'detailsZX') {
    //   打开详情页面
    router.push({
      name: 'inspectRecordDetailsZX',
      query: { id: id, state: state }
    })
  } else if (type == 'detailsRC') {
    //   打开详情页面
    router.push({
      name: 'inspectRecordDetailsRC',
      query: { id: id }
    })
  } else if (type == 'details') {
    router.push({
      name: 'risklistDetails',
      query: { id: id }
    })
  } else {
    router.push({
      name: 'EnterpriseEdit',
      query: { id: id }
    })
  }
}

const ChecklistEditRef = ref()
const handleClose = () => {
  dialogVisible.value = false
  importDialogVisible.value = false
}
/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await InspectRespAPI.deleteInspect(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await InspectRespAPI.exportInspect(queryParams)
    download.excel(data, '企业日常检查单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
const importDialogVisible = ref(false)
// 下载数据
let ImportModel = ref({
  url: '/prt/risk/get-import-template', //下载模板
  uploadUrl: '/prt/risk/import', //导入模板
  fileName: '危险有害因素辨识导入模板.xls', //导出模板名称
  returnJson: null //返回数据
})
const importSubmit = () => {
  console.log('---------------------')
}
const openImport = () => {
  importDialogVisible.value = true
}
/** 初始化 **/
onMounted(() => {
  getRiskLeveList()
  if (activeName.value == '1') {
    queryParams.inspectListCat = 1
    queryParams.test1 = '1'
  } else {
    queryParams.inspectListCat = 5
    queryParams.test1 = '2'
  }
  getList()
})
</script>
