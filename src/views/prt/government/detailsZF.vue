<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center px-20px"
      >
        <!-- 左侧标题 -->
        <div class="w-200px flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" />
          <span class="ml-10px text-16px truncate"> 政府专项检查清单详情 </span>
        </div>
        <div class="w-200px flex items-center justify-end gap-2">
          <!--          <el-button @click="openDialog()">任务分配</el-button>-->
          <!--          <el-button>编辑</el-button>-->
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px" v-loading="loading">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 基本信息</div>
              <div class="myDiv grid-container">
                <div> 专项检查任务：</div>
                <span>{{ formData?.inspectName }}</span>
                <div> 专项任务描述：</div>
                <span>{{ formData?.inspectTarget }}</span>
                <div> 发布单位：</div>
                <span>{{ formData?.govAgencyName }}</span>
                <div> 发布时间：</div>
                <span>{{ dateFormatter2(null, {} as any, formData?.uploadTime) }}</span>
                <div> 开始时间：</div>
                <span>{{ dateFormatter2(null, {} as any, formData?.startTime) }}</span>
                <div> 结束时间：</div>
                <span>{{ dateFormatter2(null, {} as any, formData?.endTime) }}</span>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px; margin-bottom: 10px">
                附件
              </div>
              <div>
                <div
                  style="padding: 5px; border-radius: 7px; margin-bottom: 10px"
                  class="grid-container2"
                  v-for="(item, index) in formData?.uploadAnnexList"
                  :key="index"
                >
                  <div>{{ item?.name }}</div>
                  <div>
                    <el-link type="primary" :underline="false" @click.prevent="downloadFile(item)">
                      <Icon icon="ep:download" class="mr-5px" />
                    </el-link>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="18">
            <el-card shadow="never">
              <div>
                <div>专项检查排查概况</div>
                <div>
                  <div class="container">
                    <div class="grid">
                      <!-- 第1行 -->
                      <div class="cell">
                        <div class="label">隐患总数</div>
                        <div
                          v-if="
                            !isNaN(formData?.generalDangerNum + formData?.majorDangerNum)
                          "
                          class="value"
                          >{{ formData?.generalDangerNum + formData?.majorDangerNum }}
                        </div>
                        <div v-else>0</div>
                      </div>
                      <div class="cell">
                        <div class="label">一般隐患</div>
                        <div class="value" v-if="formData?.generalDangerNum != null">
                          {{ formData?.generalDangerNum }}
                        </div>
                        <div class="value" v-else>0</div>
                      </div>
                      <div class="cell">
                        <div class="label">重大隐患</div>
                        <div class="value" v-if="formData?.majorDangerNum != null">
                          {{ formData?.majorDangerNum }}
                        </div>
                        <div class="value" v-else>0</div>
                      </div>
                      <div class="cell">
                        <div class="label">未整改</div>
                        <div class="value" v-if="formData?.notRectifiedNum != null">
                          {{ formData?.notRectifiedNum }}
                        </div>
                        <div class="value" v-else>0</div>
                      </div>
                      <div class="cell">
                        <div class="label">已整改</div>
                        <div class="value" v-if="formData?.rectifiedNum != null">
                          {{ formData?.rectifiedNum }}
                        </div>
                        <div class="value" v-else>0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <el-tabs class="demo-tabs" v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="未整改" name="1" />
                <el-tab-pane label="已整改" name="2" />
              </el-tabs>
              <ContentWrap>
                <!-- 搜索工作栏 -->
                <el-form
                  class="-mb-15px"
                  :model="queryParams"
                  ref="queryFormRef"
                  :inline="true"
                  label-width="68px"
                >
                  <el-form-item label="单据编号" prop="deptId">
                    <el-input
                      v-model="queryParams.deptId"
                      placeholder="请输入单据编号"
                      clearable
                      @keyup.enter="getList"
                      class="!w-240px"
                    />
                  </el-form-item>
                  <el-form-item label="隐患等级" prop="dangerLevel">
                    <el-select
                      @change="getList"
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
                      @change="getList"
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
                    <el-button type="success" plain @click="handleExport" :loading="exportLoading">
                      <Icon icon="ep:download" class="mr-5px" />
                      导出
                    </el-button>
                    <el-button type="primary" @click="openPage('hazardInvestigationEdit')">
                      <Icon icon="ep:download" class="mr-5px" />
                      录入隐患
                    </el-button>
                  </el-form-item>
                </el-form>
                <div
                  >整改期限说明：<span style="color: red">红色</span> 表示已经超过整改期限；<span
                    style="color: orange"
                    >橙色</span
                  >
                  表示离整改期限不到10天；<span style="color: green">绿色</span>
                  表示离整改期限大于10天；
                </div>
                <el-table
                  v-loading="tableloading"
                  :data="list"
                  :stripe="true"
                  :show-overflow-tooltip="true"
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
                        :src="row.dangerUrl"
                        :preview-src-list="[row.dangerUrl.split(',')]"
                        preview-teleported
                        fit="cover"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="隐患等级" align="center" prop="dangerLevel" width="80px">
                    <template #default="scope">
                      {{ getDictLabel(DICT_TYPE.DANGER_LEVEL, scope.row.dangerLevel) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="隐患来源" align="center" prop="dangerSource" width="80px">
                    <template #default="scope">
                      {{ getDictLabel(DICT_TYPE.DANGER_SOURCE, scope.row.dangerSource) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="隐患位置"
                    align="center"
                    prop="dangerAddress"
                    width="80px"
                  />
                  <el-table-column
                    label="整改责任人"
                    align="center"
                    prop="rectChargeUserName"
                    width="100px"
                  />
                  <el-table-column
                    label="检查日期"
                    align="center"
                    prop="inspectTime"
                    :formatter="dateFormatter2"
                  />
                  <el-table-column
                    label="整改状态"
                    align="center"
                    prop="rectConditionType"
                    width="80px"
                  >
                    <template #default="scope">
                      {{ getDictLabel(DICT_TYPE.RECT_CONDITION_TYPE, scope.row.rectConditionType) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    label="整改期限"
                    align="center"
                    prop="timeLimit"
                    :formatter="dateFormatter2"
                    width="80px"
                  />
                  <el-table-column label="操作" align="center" min-width="160px" fixed="right">
                    <template #default="scope">
                      <el-button link @click="handldetails(scope.row.id, 1)"> 详情</el-button>
                      <el-button link @click="handldetails(scope.row.id, 2)"> 任务分配</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </ContentWrap>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <ChecklistEdit ref="ChecklistEditRef" @submit="getList" />
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { dateFormatter2 } from '@/utils/formatTime'
import ChecklistEdit from '@/views/prt/enterprise/component/ChecklistEdit.vue'
import * as JobApi from '@/api/infra/job'
import download from '@/utils/download'
import { InspectRespAPI } from '@/api/prt/inspect'

const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
const downloadFile = async (item) => {
  const url = item.urls
  const filename = item.name // 自定义文件名
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('下载失败:', error)
  }
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
const queryParams = reactive({
  pageNo: 1,
  id: '',
  pageSize: 10,
  conditionType: '1',
  termType: '1',
  deptId: undefined,
  riskUnitName: undefined,
  riskPoint: undefined,
  riskLevel: undefined,
  dangerLevel: undefined,
  createTime: []
})

const ChecklistEditRef = ref()
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'GovernmentInspectList' })
}
const queryFormRef = ref() // 搜索的表单
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
const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的加载中
const list = ref([]) // 列表的加载中
// 跳转详情
const handldetails = (id: number, type: number) => {
  if (type == 1) {
    //   打开详情
    router.push({
      name: 'inspectRecordDetailsGZ',
      query: {
        id: id,
        type: 'ZF'
      }
    })
  } else {
    ChecklistEditRef.value.open(id)
  }
}
let activeName = ref('1')
const handleClick = (val: any) => {
  if (val.index == 0) {
    queryParams.conditionType = '1'
  } else {
    queryParams.conditionType = '2'
  }
  getList()
}
import * as RiskLevelApi from '@/api/prt/risklevel'

let RiskLeveList = ref<RiskLevelApi.RiskVO[]>([])
const getRiskLeveList = async () => {
  let myList = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams)
  if (myList.list != null) {
    myList.list.forEach((item: any) => {
      const myData = { value: item.id, label: item.controlLevel } as RiskLevelApi.RiskVO
      RiskLeveList.value.push(myData)
    })
  }
}
import { DangerRectApi } from '@/api/prt/dangerRect'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

/** 查询列表 */
let tableloading = ref(false)
const getList = async () => {
  tableloading.value = true
  try {
    if (route.query.id != null) {
      const data = await DangerRectApi.getDangerRectPage(queryParams)
      list.value = data.list
      total.value = data.total
    }
  } finally {
    tableloading.value = false
  }
}

interface formDataApi {
  inspectName: string
  inspectTarget: string
  govAgencyName: string
  uploadTime: string
  startTime: string
  endTime: string
  notRectifiedNum: number
  rectifiedNum: string
  uploadAnnexList: []
  generalDangerNum: number
  majorDangerNum: number
}

let formData = ref<formDataApi>()
/** 初始化 */
onMounted(async () => {
  try {
    loading.value = true
    // 获取层级
    await getRiskLeveList()
    if (route.query.id != null) {
      queryParams.id = String(route.query.id || '')
      await getList()
      formData.value = await InspectRespAPI.getInspect((route.query.id))
    }
  } finally {
    loading.value = false
  }
})

/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})

/** 暴露方法给子组件使用 */
defineExpose({
  handleBack
})
const openPage = (value) => {
  router.push({
    name: value
  })
}

const message = useMessage() // 消息弹窗
let exportLoading = ref(false) //导出按钮控制

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await JobApi.exportJob(queryParams)
    download.excel(data, '定时任务.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}
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

.container {
  font-family: Arial, sans-serif;
  width: 100%;
  margin: 20px auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr; /* 1、3、5列宽度相同，2、4列宽度是前者的2倍 */
  gap: 10px; /* 列间距 */
}

.cell {
  background: #f9f9f9;
  padding: 12px;
  border: 1px solid #ddd;
  text-align: center;
}

.label {
  font-weight: bold;
  color: #333;
}

.value {
  font-size: 1.2em;
  color: #000;
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

.grid-container2 {
  display: grid;
  background: #e2e7f9;
  grid-template-columns: 10fr 1fr;
}
</style>
