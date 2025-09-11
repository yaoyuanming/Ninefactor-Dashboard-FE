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
          <span class="ml-10px text-16px truncate"> 检查记录详情 </span>
        </div>
        <div class="flex items-center gap-2"></div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px" v-loading="loading">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 检查记录信息</div>
              <div class="myDiv grid-container">
                <div> 检查记录编号：</div>
                <span>{{ formData?.inspectRecordCode }}</span>
                <div> 单据状态：</div>
                <span>{{ getDictLabel(DICT_TYPE.INSPECT_STATUS, formData?.inspectStatus) }}</span>
                <div> 本轮检查有效起止时间：</div>
                <span
                  >{{ dateFormatter(null, null, formData?.validStartTime) }} -
                  {{ dateFormatter(null, null, formData?.validEndTime) }}</span
                >
                <div> 检查时间：</div>
                <span>{{ dateFormatter(null, null, formData?.inspectTime) }}</span>
                <div> 检查人：</div>
                <span>{{ formData?.inspectUserName }}</span>
                <div> 检查结果：</div>
                <span
                  :class="{
                    'success-class': formData?.inspectResult == 10
                  }"
                  >{{ getDictLabel(DICT_TYPE.INSPECT_RESULT, formData?.inspectResult) }}
                </span>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 检查清单信息</div>
              <div class="myDiv grid-container">
                <div> 检查清单名称：</div>
                <span>{{ formData?.inspectName }}</span>
                <div> 检查清单单据编号：</div>
                <span>{{ formData?.inspectCode }}</span>
                <div> 单据类型：</div>
                <span
                  >{{ getDictLabel(DICT_TYPE.INSPECT_LIST_CAT, formData?.inspectListCat) }}
                </span>
                <div> 检查类型：</div>
                <span>{{ formData?.inspectType == 5 ? '按人员检查' : '按岗位检查' }} </span>
                <div> 风险点名称：</div>
                <span>{{ formData?.riskName }}</span>
                <div> 风险单元：</div>
                <span>{{ formData?.riskUnitName }}</span>
                <div> 风险点类型：</div>
                <span>{{ getDictLabel(DICT_TYPE.RISKTYPE, formData?.riskType) }} </span>
                <div> 责任部门：</div>
                <span>{{ formData?.respDeptName }}</span>
                <div> 责任岗位：</div>
                <span>{{ formData?.respPostName }}</span>
                <div> 管控责任人：</div>
                <span>{{ formData?.respUserName }}</span>
                <div> 检查人员：</div>
                <span>{{ formData?.inspectUserName }}</span>
                <div> 检查任务提交方式：</div>
                <span>{{ formData?.submitType == '1' ? '全部人员提交' : '仅需其中一人提交' }}</span>
                <div> 检查频次类别：</div>
                <span>{{ formData?.inspectFrqType == 1 ? '一次性' : '循环检查' }}</span>
                <div> 检查任务时间：</div>
                <span>{{ getTime() }}</span>
                <div> 创建时间：</div>
                <span>{{ dateFormatter(null, null, formData?.createTime) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="18">
            <el-card shadow="never">
              <el-row>
                <el-col :span="12">
                  <div> 检查结果详情</div>
                </el-col>
                <el-col :span="12" style="text-align: right" v-if="formData?.inspectResult == 10">
                  <el-button type="text" style="color: blue" @click="openDialog()">
                    查看关联隐患清单
                  </el-button>
                </el-col>
              </el-row>

              <div style="margin-top: 10px; padding-left: 10px">
                <table
                  style="
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #000;
                    line-height: 30px;
                  "
                >
                  <tr style="border: 1px solid #000">
                    <td colspan="6" style="text-align: center">检查项目</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #000">序号</td>
                    <td style="border: 1px solid #000; width: 25%">检查项目</td>
                    <td style="border: 1px solid #000">检查标准</td>
                    <td style="border: 1px solid #000">检查结果</td>
                  </tr>
                  <tr v-for="(item, key) in formData?.inspectRecordItemList" :key="key">
                    <td style="border: 1px solid #000">{{ key + 1 }}</td>
                    <td style="border: 1px solid #000">{{ item.inspectItemName }}</td>
                    <td style="border: 1px solid #000">{{ item.inspectStandard }}</td>
                    <td
                      style="border: 1px solid #000"
                      v-if="item.inspectResultType != null"
                      :class="{
                        'success-class': item.inspectResultType == '0'
                      }"
                      >{{ item.inspectResultType == 1 ? '符合标准' : '不符合标准' }}
                    </td>
                    <td style="border: 1px solid #000" v-else></td>
                  </tr>
                </table>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <Dialog v-model="dialogVisible" title="查看关联隐患清单">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="date" label="隐患清单单据编号" width="180" />
      <el-table-column prop="date" label="整改状态" width="180" />
      <el-table-column prop="date" label="隐患描述" width="180" />
      <el-table-column prop="date" label="隐患图片" width="180" />
      <el-table-column prop="date" label="隐患等级" width="180" />
      <el-table-column prop="date" label="隐患位置" width="180" />
    </el-table>
  </Dialog>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { DICT_TYPE, getDictLabel, getStrDictOptions } from '@/utils/dict'
import { dateFormatter, dateFormatter2 } from '@/utils/formatTime'

const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
let dialogVisible = ref(false) //弹窗控制
let tableData = ref([])
/**
 * 打开弹窗
 */
const openDialog = () => {
  dialogVisible.value = true
  //   请求接口  赋值
}
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
  // router.push({ name: 'InspectrecordIndex' })
}
let loading = ref(false)
let formData = ref<InspectRecordVO>()
/** 查询详情 */
import { InspectRecordApi, InspectRecordVO } from '@/api/prt/inspectrecord'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

const getTime = (val) => {
  if (formData.value?.validType == 1) {
    return dateFormatter2(null, null, formData.value?.startTime) + ' 至 ' + '长期有效'
  } else {
    return (
      dateFormatter2(null, null, formData.value?.startTime) +
      ' 至 ' +
      dateFormatter2(null, null, formData.value?.endTime)
    )
  }
}
const getList = async () => {
  loading.value = true
  try {
    formData.value = await InspectRecordApi.getInspectRecord(route.query.id)
  } finally {
    loading.value = false
  }
}
/** 初始化 */
onMounted(async () => {
  getList()
})
// 1：待检查 5：已检查 15：已作废
let inspectStatusList = [
  { label: '待检查', value: 1 },
  { label: '已检查', value: 5 },
  { label: '已作废', value: 15 }
]
// 检查结果*（1：正常 10：异常 15：逾期未检 ）（检查记录信息）
let inspectResultList = [
  { label: '正常', value: 1 },
  { label: '异常', value: 10 },
  { label: '逾期未检', value: 15 }
]
// 检查单类别*（1：企业日常检查单 5：企业专项检查单 8：政府专项检查单）（检查单表冗余字段）
let inspectListCatList = [
  { label: '企业日常检查单', value: 1 },
  { label: '企业专项检查单', value: 5 },
  { label: '政府专项检查单', value: 8 }
]
// 风险点类型*（风险点表冗余字段）（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）（风险点表冗余字段）
let riskTypeList = getIntDictOptions(DICT_TYPE.RISKTYPE)
// 检查类型*（5：按人员检查 10：按岗位检查）（检查任务表冗余字段）
let inspectTypeList = [
  { label: '按人员检查', value: 5 },
  { label: '按岗位检查', value: 10 }
]
// 	检查任务提交方式*（1：全部人员提交 5：仅需其中一人提交）（检查任务表冗余字段）
let submitTypeList = [
  { label: '全部人员提交', value: 1 },
  { label: '仅需其中一人提交', value: 5 }
]
// 	检查频次*（1：一次性 2：循环检查）（检查任务表冗余字段）
let inspectFrqTypeList = [
  { label: '一次性', value: 1 },
  { label: '循环检查', value: 2 }
]
/** 添加组件挂载后的代码 */
const getValue = (item: any, type: number) => {
  if (type == 1) {
    inspectStatusList.forEach((i) => {
      if (i.value === item) {
        return i.label
      }
    })
  } else if (type == 2) {
    inspectResultList.forEach((i) => {
      if (i.value === item) {
        return i.label
      }
    })
  } else if (type == 3) {
    inspectListCatList.forEach((i) => {
      if (i.value === item) {
        return i.label
      }
    })
  } else if (type == 4) {
    riskTypeList.forEach((i) => {
      if (i.value === item) {
        return i.label
      }
    })
  } else if (type == 5) {
    //   检查频次  比如3小时/1次
    if (formData?.inspectFrqType == 2) {
      let inspectFrq = ''
      inspectFrqTypeUnitList.forEach((i) => {
        if (i.value === formData?.cycleFrqType) {
          inspectFrq = i.label
        }
      })
      return `${formData?.cycleFrqNumber}${inspectFrq}/1次`
    } else if (formData?.inspectFrqType == 1) {
      return '一次性'
    }
  }
}
// 循环频次单位*（2：按小时 3：按天 6：按月 9：按年）（检查任务表冗余字段）
let inspectFrqTypeUnitList = [
  { label: '按小时', value: 2 },
  { label: '按天', value: 3 },
  { label: '按月', value: 6 },
  { label: '按年', value: 9 }
]
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

.success-class {
  color: red;
}
</style>
