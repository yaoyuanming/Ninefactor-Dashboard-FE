<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-tabs v-model="activeName"  :key="activeName" @tab-click="handleClick">
      <el-tab-pane label="未整改" name="1" />
      <el-tab-pane label="已整改" name="2" />
    </el-tabs>
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="单据编号" prop="dangerRectCode">
        <el-input
          v-model="queryParams.dangerRectCode"
          placeholder="请输入风险点名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="隐患等级" prop="dangerLevel">
        <el-select
          @change="handleQuery"
          v-model="queryParams.dangerLevel"
          placeholder="请选择隐患等级"
          clearable
          class="!w-240px"
        >
          <el-option label="一般隐患" value="5" />
          <el-option label="重大隐患" value="10" />
        </el-select>
      </el-form-item>
      <el-form-item label="整改期限" prop="termType">
        <el-select
          @change="handleQuery"
          v-model="queryParams.termType"
          placeholder="请选择隐患等级"
          clearable
          class="!w-240px"
        >
          <el-option label="> 10" value="1" />
          <el-option label="<=10" value="2" />
          <el-option label="逾期未整改" value="3" />
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
          v-hasPermi="['prt:hazardInvestigation:create']"
          type="primary"
          plain
          @click="openForm('create')"
          v-if="activeName == '1'"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          录入隐患
        </el-button>
        <el-button
          type="success"
          @click="handleExport"
          v-loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
    <div style="background: #f8f3fe; padding: 5px; margin-top: 10px" v-if="activeName == '1'">
      整改期限说明:<span style="color: red">红色</span>表示已经超过整改期限;<span
        style="color: orange"
        >橙色</span
      >表示离整改期限不到10天;<span style="color: green">绿色</span>表示离整改期限大于10天;
    </div>
  </ContentWrap>
  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      style="overflow-x: auto; height: 630px; overflow-y: auto"
    >
      <el-table-column label="隐患描述" align="center" prop="dangerDesc">
        <template #default="{ row }">
          <span :style="getDangerDescStyle(row)">
            {{ row.dangerDesc }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患图片"
        align="center"
        prop="dangerUrl"
        :show-overflow-tooltip="false"
      >
        <template #default="{ row }">
          <el-image
            class="h-80px w-80px"
            lazy
            :src="row?.dangerUrl"
            :preview-src-list="[row?.dangerUrl?.split(',')]"
            preview-teleported
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="隐患等级" align="center" prop="dangerLevel">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.DANGER_LEVEL, scope.row.dangerLevel) }}
        </template>
      </el-table-column>
      <el-table-column label="隐患来源" align="center" prop="dangerSource">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.DANGER_SOURCE, scope.row.dangerSource) }}
        </template>
      </el-table-column>
      <el-table-column label="隐患位置" align="center" prop="dangerAddress" />
      <el-table-column label="整改责任人" align="center" prop="rectChargeUserName" width="130" />
      <el-table-column label="检查日期" align="center" prop="inspectTime">
        <template #default="scope">
          {{ dateFormatter2(null, {} as any, scope.row.inspectTime) }}
        </template>
      </el-table-column>
      <el-table-column label="整改状态" align="center" prop="rectConditionType">
        <template #default="scope">
          {{ getDictLabel(DICT_TYPE.RECT_CONDITION_TYPE, scope.row.rectConditionType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="整改期限"
        align="center"
        prop="timeLimit"
        :formatter="dateFormatter2"
      />
      <el-table-column
        width="130"
        v-if="activeName == '2'"
        label="整改完成日期"
        align="center"
        prop="rectCompleteTime"
        :formatter="dateFormatter2"
      />
      <el-table-column
        width="130"
        v-if="activeName == '2'"
        label="整改后图片"
        align="center"
        prop="rectCompleteUrl"
        :show-overflow-tooltip="false"
      >
        <template #default="{ row }">
          <el-image
            class="h-80px w-80px"
            lazy
            :src="row?.rectCompleteUrl"
            :preview-src-list="[row?.rectCompleteUrl?.split(',')]"
            preview-teleported
            fit="cover"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="180px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm('details', scope.row)">
            <!--            v-hasPermi="['prt:hazardInvestigation:details']"-->
            详情
          </el-button>
          <el-button
            v-hasPermi="['prt:hazardInvestigation:enter']"
            link
            type="primary"
            @click="openForm('enter', scope.row)"
            v-if="scope.row.rectConditionType != 50"
          >
            整改完成录入
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
  <!-- 表单弹窗：添加/修改 -->
  <InspectRecordEnter ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import {usePageStore} from "@/store/modules/pageStore";
const PageStore = usePageStore()
import { dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { DangerRectApi, DangerRectSaveReqVO } from '@/api/prt/dangerRect'
// import RiskForm from './RiskForm.vue'
import { useRouter } from 'vue-router'
import InspectRecordEnter from './inspectRecordEnter.vue'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

const formRef = ref()
const getTag = computed(() => {
  return PageStore.getPrtWorkTag2
})
let activeName = ref(getTag||'1')
const handleClick = (e) => {
  PageStore.setPrtWorkTag2(e.props.name)
  if (e.index == '0') {
    queryParams.value.conditionType = 1
  } else {
    queryParams.value.conditionType = 2
  }
  getList()
}
// 判断隐患描述的颜色样式
const getDangerDescStyle = (row) => {
  // 如果已经完成整改，显示默认颜色（或灰色）
  if (row.rectConditionType == 50) {
    return { color: '#999' } // 灰色表示已完成
  }
  const now = new Date()
  const timeLimit = new Date(row.timeLimit) // 整改期限
  const diffDays = Math.ceil((timeLimit - now) / (1000 * 60 * 60 * 24)) // 剩余天数
  if (diffDays < 0) {
    return { color: 'red' } // 已超期
  } else if (diffDays <= 10) {
    return { color: 'orange' } // 10天内到期
  } else {
    return { color: 'green' } // 大于10天
  }
}
/** 风险点 列表 */
defineOptions({ name: 'Risk' })
const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const list = ref<DangerRectSaveReqVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = ref({
  pageNo: 1,
  conditionType: 1,
  pageSize: 10,
  deptId: undefined,
  riskUnitId: undefined,
  riskName: undefined,
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: undefined,
  isEnable: undefined,
  controlEffectiveness: undefined,
  controlLevel: undefined,
  respDeptId: undefined,
  respDeptName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  inspectorUser: undefined,
  dataSources: undefined,
  termType: undefined,
  dangerLevel: undefined,
  dangerRectCode: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await DangerRectApi.getDangerRectPage(queryParams.value)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const router = useRouter() // 路由
const openForm = (type: string, row?: any) => {
  if (type == 'details') {
    router.push({
      name: 'inspectRecordDetailsGZ',
      query: { id: row.id }
    })
  } else if (type == 'enter') {
    //   打开弹窗
    formRef.value.open(type, row)
  } else if (type == 'create') {
    router.push({
      name: 'hazardInvestigationEdit'
      // query: { id: row.id }
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
    const data = await DangerRectApi.exportDangerRect(queryParams.value)
    download.excel(data, '隐患整改单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  queryParams.value.conditionType = activeName.value
  getList()
})
</script>
