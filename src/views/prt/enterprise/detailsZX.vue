<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center justify-between px-20px"
      >
        <!-- 左侧标题 -->
        <div class="flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" />
          <span class="ml-10px text-16px truncate"> 企业专项检查清单详情 </span>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="openDialog()">任务分配</el-button>
          <el-button @click="openPage()">编辑</el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 基本信息</div>
              <div class="myDiv grid-container">
                <div> 检查清单名称：</div>
                <span>{{ formData?.inspectName }}</span>
                <div> 检查清单单据编号：</div>
                <span>{{ formData?.inspectCode }}</span>
                <div> 检查目标：</div>
                <span>{{ formData?.inspectTarget }}</span>
                <div> 检查类型：</div>
                <span>{{ getDictLabel(DICT_TYPE.INSPECTION_TYPE, formData?.inspectionType) }}</span>
                <div> 下发日期：</div>
                <span>{{ formData?.listDate }}</span>
                <div> 创建时间：</div>
                <span>{{ formData?.uploadTime }}</span>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 检查任务分配</div>
              <div class="myDiv grid-container">
                <div> 检查人员：</div>
                <span>{{ formData?.inspectUserName }}</span>
                <div> 检查任务提交方式：</div>
                <span>{{ getsubType(formData?.submitType) }}</span>
                <div> 检查频次：</div>
                <span>{{ formData?.frequency }}</span>
                <div> 检查任务生效时间：</div>
                <span>{{ formData?.startTime }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="18">
            <el-card shadow="never">
              <el-tabs class="demo-tabs" v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="检查清单" name="1">
                  <el-table :data="formData?.inspectItemList" style="width: 100%">
                    <el-table-column prop="date" label="序号" width="180">
                      <template #default="scope">
                        <div>{{ scope.$index + 1 }}</div>
                      </template>
                    </el-table-column>
                    <el-table-column prop="inspectItemName" label="检查项目" width="180" />
                    <el-table-column prop="inspectStandard" label="检查标准" width="180" />
                  </el-table>
                </el-tab-pane>
                <el-tab-pane label="检查记录" name="2">
                  <ContentWrap>
                    <!-- 搜索工作栏 -->
                    <el-form
                      class="-mb-15px"
                      :model="queryParams"
                      ref="queryFormRef"
                      :inline="true"
                      label-width="68px"
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
                          type="success"
                          plain
                          @click="handleExport"
                          :loading="exportLoading"
                          v-hasPermi="['prt:risk-unit:export']"
                        >
                          <Icon icon="ep:download" class="mr-5px" />
                          导出
                        </el-button>
                      </el-form-item>
                    </el-form>
                    <el-table
                      v-loading="loading"
                      :data="list"
                      :stripe="true"
                      :show-overflow-tooltip="true"
                    >
                      <el-table-column label="检查日期" align="center" prop="id" />
                      <el-table-column label="检查记录编号" align="center" prop="deptId" />
                      <el-table-column label="单据状态" align="center" prop="riskUnitName" />
                      <el-table-column
                        label="检查清单单据编号"
                        align="center"
                        prop="riskUnitName"
                      />
                      <el-table-column label="检查人员" align="center" prop="riskUnitName" />
                      <el-table-column label="风险点" align="center" prop="riskUnitName" />
                      <el-table-column label="风险点类型" align="center" prop="riskUnitName" />
                      <el-table-column label="风险等级" align="center" prop="riskUnitName" />
                      <el-table-column label="管控层级" align="center" prop="riskUnitName" />
                      <el-table-column label="责任部门" align="center" prop="riskUnitName" />
                      <el-table-column label="检查结果" align="center" prop="riskUnitName" />
                      <el-table-column label="检查时间" align="center" prop="riskUnitName" />
                      <el-table-column label="操作" align="center" min-width="120px" fixed="right">
                        <template #default="scope">
                          <el-button link @click="handldetails(scope.row.id)"> 详情</el-button>
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
                </el-tab-pane>
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <el-drawer v-model="dialogVisible" title="检查任务分配" size="500" :before-close="handleClose">
    <ChecklistEdit v-if="dialogVisible" />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false"> Confirm</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import ChecklistEdit from './component/ChecklistEdit.vue'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

const dialogVisible = ref(false) //弹窗控制
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
const queryParams = reactive({
  test2: '',
  test1: '1',
  inspectId: "",
  pageNo: 1,
  pageSize: 10,
  deptId: undefined,
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
  inspectName: undefined,
  inspectCode: '',
  inspectRecordCode: '',
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
// 关闭弹窗事件
const handleClose = () => {
  dialogVisible.value = false
}
// 打开任务分配弹窗
const openDialog = () => {
  dialogVisible.value = true
}
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'EnterpriseInspectionList' })
}
const queryFormRef = ref() // 搜索的表单
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  queryParams.inspectCode = ''
  queryParams.inspectRecordCode = ''
  if (queryParams.test1 == '1') {
    queryParams.inspectRecordCode = queryParams.test2
  } else {
    queryParams.inspectCode = queryParams.test2
  }
  getList()
}
/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的加载中
const list = ref([]) // 列表的加载中
// 跳转详情
const handldetails = (id: number) => {
  router.push({
    name: 'inspectrecordDetails',
    query: {
      id: id
    }
  })
}
import { InspectRecordApi } from '@/api/prt/inspectrecord'
/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    queryParams.inspectId = (route.query.id ?? '').toString();
    const data = await InspectRecordApi.getInspectRecordPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}


const activeName = ref('1')
const handleClick = (tab: any) => {
  if(tab.index == 1){
    getList()
  }
}

import * as RiskLevelApi from '@/api/prt/risklevel'

let RiskLeveList = ref<RiskLevelApi.RiskVO[]>([])
const getRiskLeveList = async () => {
  let mylist = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams)
  if (mylist.list != null) {
    mylist.list.forEach((item: any) => {
      const myData = { value: item.id, label: item.controlLevel } as RiskLevelApi.RiskVO;
      RiskLeveList.value.push(myData)
    })
  }
}
interface formDataApi {
  inspectName: string
  inherentRisk: string
  existingRisk: string
  riskType: string
  controlLevel: string
  respDeptId: number
  respDeptName: string
  riskUnitId: number
  riskUnitName: string
  respUserId: number
  respUserName: string
  supervisorUser: number
  supervisorUserName: string
  inspectorUser: number
  inspectorUserName: string
  inspectUserIds:number
}
let formData = ref<formDataApi[]>([])
import { InspectRespAPI } from '@/api/prt/inspect'
const openPage = ()=>{
  router.push({
    name: 'EnterpriseEdit',
    query: { id: route.query.id }
  })
}
/** 初始化 */
onMounted(async () => {
  try {
    loading.value = true
    await getRiskLeveList()
    if (route.query.id != null) {
      formData.value = await InspectRespAPI.getInspect((route.query.id))
    }
  } finally {
    loading.value = false
  }
})
const message = useMessage() // 消息弹窗
let exportLoading = ref(false)
import download from '@/utils/download'
/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await InspectRecordApi.exportInspectRecord(queryParams)
    download.excel(data, '检查记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
const getsubType = (item: any) => {
  if (item == 1) {
    return '全部人员提交'
  } else if (item == 5) {
    return '仅需其中一人提交'
  } else {
    return '-'
  }
}
/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})

/** 暴露方法给子组件使用 */
defineExpose({
  handleBack
})
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid #dcdfe6;
}

.text-primary {
  color: #3473ff;
}

.bg-primary {
  background-color: #3473ff;
}

.border-primary {
  border-color: #3473ff;
}

.container {
  background: #cfd9fd;
  display: flex;
  align-items: center; /* 垂直居中对齐 */
  gap: 20px; /* 图片和文字之间的间距 */
  max-width: 800px;
  margin: 0 auto;
  padding: 5px;
  border: 1px solid #ddd; /* 可选边框 */
  margin-bottom: 5px;
}

.image {
  width: 50px; /* 图片宽度 */
  height: 50px; /* 图片高度 */
  object-fit: cover; /* 保持图片比例 */
  border: 1px solid #ccc; /* 图片边框 */
  border-radius: 10px;
}

.text-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.text-top {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.text-bottom {
  font-size: 14px;
  color: #666;
}

.myDiv div {
  margin-top: 10px;
}

.myDiv span {
  margin-top: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: 6fr 10fr;
}
</style>
