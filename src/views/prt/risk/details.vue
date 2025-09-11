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
          <span class="ml-10px text-16px truncate"> 详情 </span>
        </div>
        <div class="w-2000px flex items-center justify-end gap-2">
          <el-button type="danger" @click="handleDelete()"> 删除风险点</el-button>
          <el-button type="primary" plain @click="openForm()"> 编辑风险点</el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px" v-loading="loading">
        <el-row :gutter="12">
          <el-col :span="6">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 基本信息</div>
              <div style="padding-left: 10px" class="myDiv">
                <div> 风险点名称：{{ ruleForm?.riskName }}</div>
                <div> 风险单元：{{ ruleForm?.riskUnitName }}</div>
                <div> 风险点类型：{{ getDictLabel(DICT_TYPE.RISKTYPE, ruleForm?.riskType) }}</div>
                <div> 责任部门：{{ ruleForm?.respDeptName }}</div>
                <div> 责任岗位：{{ ruleForm?.respPostName }}</div>
                <div> 管控责任人：{{ ruleForm?.respUserName }}</div>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 风险等级</div>
              <div style="padding-left: 10px" class="myDiv">
                <div>
                  风险定级方式：{{ ruleForm?.gradingMethod == 1 ? '企业自主定级' : 'LSR评估定级' }}
                </div>
                <div>
                  整体风险等级：{{ getDictLabel(DICT_TYPE.OVERALLRISK, ruleForm?.overallRisk) }}
                </div>
                <div> 管控层级：{{ getLeve(ruleForm?.controlLevel) }}</div>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 检查频次</div>
              <div style="padding-left: 10px" class="myDiv">
                <div> 检查清单名称：{{ ruleForm?.inspectFrequency?.inspectName }}</div>
                <div> 检查人员：{{ ruleForm?.inspectFrequency?.inspectUserName }}</div>
                <div>
                  检查任务提交方式：{{
                    ruleForm?.inspectFrequency?.submitType == '1'
                      ? '全部人员提交'
                      : '仅需其中一人提交'
                  }}
                </div>
                <div>
                  检查频次类别：{{
                    ruleForm?.inspectFrequency?.inspectFrqType == 1 ? '一次性' : '循环检查'
                  }}
                </div>
                <div v-if="ruleForm?.inspectFrequency?.inspectFrqType != 1">
                  检查频次： {{ getInspectFrq() }}
                </div>
                <div v-if="ruleForm?.inspectFrequency?.inspectFrqType != 1">
                  检查任务分配时间：{{
                    getCycleFrqTimes(ruleForm?.inspectFrequency?.cycleFrqTimes)
                  }}
                </div>
                <div> 检查任务时间：{{ getTime(ruleForm?.inspectFrequency) }}</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="18">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 危险有害因素辨识</div>
              <div style="padding-left: 10px; margin-top: 10px">
                <el-table :data="ruleForm?.riskFactorsList" style="width: 100%">
                  <el-table-column prop="riskFactorsName" label="危险有害因素" />
                  <el-table-column prop="accidentType" label="可能造成的事故类型">
                    <template #default="scope">
                      {{ getControlType(scope.row.accidentType) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="controlMeasures" label="管控措施" />
                  <el-table-column prop="inspectItemName" label="检查项目" />
                  <el-table-column prop="inspectStandard" label="检查标准" />
                </el-table>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import {dateFormatter, dateFormatter2} from '@/utils/formatTime'
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
const getTips = (val) => {
  if (val == 1) {
    return '小时'
  } else if (val == 2) {
    return '天'
  } else if (val == 3) {
    return '月'
  } else if (val == null) {
    return ''
  } else {
    return '年'
  }
}
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  // router.push({ name: 'PrtRiskIndex' })
  router.go(-1)
}
import { RiskApi, RiskVO } from '@/api/prt/risk'

const ruleForm = ref<RiskVO>()
let RiskLeveList = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
let strList = [
  {
    key: 1,
    name: '周一'
  },
  {
    key: 2,
    name: '周二'
  },
  {
    key: 3,
    name: '周三'
  },
  {
    key: 4,
    name: '周四'
  },
  {
    key: 5,
    name: '周五'
  },
  {
    key: 6,
    name: '周六'
  },
  {
    key: 7,
    name: '周天'
  },
  {
    key: 8,
    name: '工作日'
  },
  {
    key: 9,
    name: '周末及节假日'
  }
]
const getTime = (val) => {
  if(ruleForm.value?.inspectFrequency?.validType == 1){
    return dateFormatter2(null,null,ruleForm.value?.inspectFrequency?.startTime) + " 至 " +"长期有效"
  }else{
    return dateFormatter2(null,null,ruleForm.value?.inspectFrequency?.startTime) + " 至 " + dateFormatter2(null,null,ruleForm.value?.inspectFrequency?.endTime)
  }
}
const getCycleFrqTimes = (val) => {
  let str = []
  if (val != null) {
    val.split(',').forEach((i) => {
      strList.forEach((o) => {
        if (o.key == i) {
          str.push(o.name)
        }
      })
    })
    return str.toString()
  }
}
const getInspectFrq = () => {
  console.log('ruleForm.value.inspectFrequency', ruleForm.value?.inspectFrequency)
  if (ruleForm.value?.inspectFrequency?.inspectFrqType == 1) {
    return '一次性'
  } else {
    if (ruleForm.value?.inspectFrequency?.cycleFrqType == 2) {
      return ruleForm.value?.inspectFrequency.cycleFrqNumber + '小时/1次'
    }
    if (ruleForm.value?.inspectFrequency?.cycleFrqType == 3) {
      return ruleForm.value?.inspectFrequency.cycleFrqNumber + '天/1次'
    }
    if (ruleForm.value?.inspectFrequency?.cycleFrqType == 6) {
      return ruleForm.value?.inspectFrequency.cycleFrqNumber + '月/1次'
    }
    if (ruleForm.value?.inspectFrequency?.cycleFrqType == 9) {
      return ruleForm.value?.inspectFrequency.cycleFrqNumber + '年/1次'
    }
  }
}
const getLeve = (val) => {
  let str = ''
  if (RiskLeveList.value.list != null) {
    RiskLeveList.value.list.forEach((i) => {
      if (val == i.id) {
        str = i.controlLevel
      }
    })
    return str
  }
  return '-'
}
import * as RiskLevelApi from '@/api/prt/risklevel'

let loading = ref(false)
/** 初始化 */
onMounted(async () => {
  // 获取管控层级
  loading.value = true
  RiskLeveList.value = await RiskLevelApi.RiskLevelApi.getRiskLevelPage(queryParams)
  ruleForm.value = await RiskApi.getRisk(route.query.id)
  loading.value = false
})
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
//编辑风险点
const openForm = () => {
  router.push({
    name: 'risklistEdit',
    query: { id: route.query.id }
  })
}
const getControlType = (val) => {
  let str = []
  val.split(',').forEach((o) => {
    str.push(getDictLabel(DICT_TYPE.ACCIDENT_TYPE, o))
  })
  return str.toString()
}
/** 删除按钮操作 */
const handleDelete = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await RiskApi.deleteRisk(route.query.id)
    message.success(t('common.delSuccess'))
    handleBack()
    // 刷新列表
  } catch {}
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

.myDiv div {
  margin-top: 10px;
}
</style>
