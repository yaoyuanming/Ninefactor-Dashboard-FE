<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="专项检查任务标题" prop="inspectName" label-width="150px">
        <el-input
          v-model="queryParams.inspectName"
          placeholder="请输入"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="是否有隐患" prop="isDanger">
        <el-select
          @change="handleQuery"
          v-model="queryParams.isDanger"
          placeholder="请选择"
          clearable
          class="!w-240px"
        >
          <el-option label="是" value="1" />
          <el-option label="否" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item label="整改状态" prop="correctionState">
        <el-select
          @change="handleQuery"
          v-model="queryParams.correctionState"
          placeholder="请选择"
          clearable
          class="!w-240px"
        >
          <el-option label="已整改" value="2" />
          <el-option label="未整改" value="1" />
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
        <el-button v-hasPermi="['prt:government:export']" type="success" plain @click="handleExport" :loading="exportLoading">
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
      <el-table-column label="序号" align="center" prop="id">
        <template #default="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="专项检查任务" align="center" prop="inspectName" width="120px" />
      <el-table-column label="专项任务描述" align="center" prop="inspectTarget" width="120px" />
      <el-table-column label="发布单位" align="center" prop="govAgencyName" />
      <el-table-column label="发布时间" align="center" prop="uploadTime" :formatter="dateFormatter2"/>
      <el-table-column label="开始时间" align="center" prop="startTime" :formatter="dateFormatter2"/>
      <el-table-column label="结束时间" align="center" prop="endTime" :formatter="dateFormatter2"/>
      <el-table-column label="是否有隐患" align="center" prop="isEnable" width="120px">
        <template #default="scope">
          {{ scope.row.isEnable === 1 ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column label="一般隐患" align="center" prop="generalDangerNum" />
      <el-table-column label="重大隐患" align="center" prop="majorDangerNum" />
      <el-table-column label="已整改" align="center" prop="rectifiedNum" />
      <el-table-column label="未整改" align="center" prop="notRectifiedNum" />
      <el-table-column label="操作" align="center" min-width="120px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" @click="openForm(scope.row.id)" v-hasPermi="['prt:government:details']">
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
</template>

<script setup lang="ts">
import {  dateFormatter2 } from '@/utils/formatTime'
import download from '@/utils/download'
import { RiskApi } from '@/api/prt/risk'
// import RiskForm from './RiskForm.vue'
import { useRouter } from 'vue-router'

import { InspectRespAPI, InspectRespVO } from '@/api/prt/inspect'

const list = ref<InspectRespVO[]>([]) // 列表的数据
/** 风险点 列表 */
defineOptions({ name: 'Risk' })

const message = useMessage() // 消息弹窗

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  inspectListCat: 8, //8
  pageSize: 10,
  deptId: undefined,
  isDanger: undefined,
  inspectName: undefined,
  correctionState: undefined,
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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await InspectRespAPI.getGovInspectPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
const router = useRouter() // 路由
const openForm = (id?: number) => {
  router.push({
    name: 'governmentDetailsZF',
    query: { id: id }
  })
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await RiskApi.exportRisk(queryParams)
    download.excel(data, '政府专项检查清单.xls')
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
