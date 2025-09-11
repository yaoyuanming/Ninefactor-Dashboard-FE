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
          <span class="ml-10px text-16px truncate"> 企业日常检查清单详情 </span>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="openDialog()">任务分配</el-button>
          <el-button @click="handleEdit()">导出风险管控清单</el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px" v-loading="loading">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 基本信息</div>
              <div class="myDiv">
                <div class="container">
                  <!-- 左边图片 -->
<!--                  <div>场所</div>-->
                  <!-- 右边文字 -->
                  <div class="text-content">
                    <div class="text-top">场所</div>
                    <div class="text-bottom">
                      <p>风险单元：{{ formData?.riskUnitName }}</p>
                    </div>
                  </div>
                </div>
                <div class="grid-container">
                  <div> 检查清单名称：</div>
                  <span>{{ formData?.inspectName }}</span>
                  <div> 检查清单单据编号：</div>
                  <span>{{ formData?.inspectCode }}</span>
                  <div> 风险等级：</div>
                  <span>{{ getDictLabel(DICT_TYPE.OVERALLRISK, formData?.overallRisk) }}</span>
                  <div> 管控层级：</div>
                  <span>{{ getValue(formData?.controlLevel, 1) }}</span>
                  <div> 管控部门：</div>
                  <span>{{ formData?.respDeptName }}</span>
                  <div> 管控责任人：</div>
                  <span>{{ formData?.respUserName }}</span>
                  <div> 创建时间：</div>
                  <span>{{ dateFormatter2(null,{} as any,formData?.createTime) }}</span>
                </div>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px"> 检查清单信息</div>
              <div class="myDiv grid-container">
                <div> 检查人员：</div>
                <span>{{ formData?.inspectUserName }}</span>
                <div> 检查任务提交方式：</div>
                <span>{{ getsubType(formData?.submitType) }}</span>
                <div> 检查频次：</div>
                <span>{{ formData?.frequency }}</span>
                <div> 检查任务生效时间：</div>
                <span>{{ dateFormatter(null,{} as any,formData?.startTime) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="16">
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
              </el-tabs>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <ChecklistEdit ref="ChecklistEditRef" @submit="init" />
</template>

<script lang="ts" setup>
import { dateFormatter2,dateFormatter } from '@/utils/formatTime'
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'

const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由

/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.push({ name: 'EnterpriseInspectionList' })
}
const activeName = ref('1')
const handleClick = (tab: any) => {
  console.log(tab.label)
}
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10
})

import * as RiskLevelApi from '@/api/prt/risklevel'

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
const getValue = (item: any, type: number) => {
  if (type == 1) {
    RiskLeveList.value.forEach((i) => {
      if (i.value === item) {
        return i.label
      }
    })
  }
}
import { InspectRespAPI } from '@/api/prt/inspect'
import ChecklistEdit from '@/views/prt/enterprise/component/ChecklistEdit.vue'

const ChecklistEditRef = ref()
//  打开任务分配弹窗
const openDialog = () => {
  ChecklistEditRef.value.open(route.query.id)
}
const formData = ref()
const loading = ref(false)
const getsubType = (item: any) => {
  if (item == 1) {
    return '全部人员提交'
  } else if (item == 5) {
    return '仅需其中一人提交'
  } else {
    return '-'
  }
}
const init = async () => {
  try {
    loading.value = true
    if (route.query.id != null) {
      formData.value = await InspectRespAPI.getInspect((route.query.id))
    }
  } finally {
    loading.value = false
  }
}
/** 初始化 */
onMounted(async () => {
  await getRiskLeveList()
  init()
})

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
