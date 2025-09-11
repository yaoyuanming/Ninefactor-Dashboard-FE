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
          <span class="ml-10px text-16px truncate"> 隐患详情 </span>
        </div>
        <div class="flex items-center gap-2">
          <el-button @click="openDialog()" v-if="list?.rectConditionType != undefined && list.rectConditionType < 50"
            >整改完成录入
          </el-button>
        </div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px" v-loading="loading">
        <el-row :gutter="12">
          <el-col :span="8">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 基本信息</div>
              <div class="myDiv grid-container">
                <div> 隐患清单单据编号:</div>
                <span>{{ list?.dangerRectCode }}</span>
                <div> 整改状态:</div>
                <span>{{
                  getDictLabel(DICT_TYPE.RECT_CONDITION_TYPE, list?.rectConditionType)
                }}</span>
                <div> 隐患来源:</div>
                <span>{{ getDictLabel(DICT_TYPE.DANGER_SOURCE, list?.dangerSource) }}</span>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 检查与整改信息</div>
              <div class="myDiv grid-container">
                <div> 检查人员:</div>
                <span>{{ list?.inspectUserName }}</span>
                <div> 检查日期:</div>
                <span>
                  {{ dateFormatter2(null, {} as any, list?.inspectTime) }}
                </span>
                <div> 责任部门:</div>
                <span>{{ list?.respDeptName }}</span>
                <div> 整改责任人:</div>
                <span>{{ list?.rectChargeUserName }}</span>
                <div> 整改期限:</div>
                <span>{{dateFormatter2(null, {} as any, list?.timeLimit)  }}</span>
              </div>
            </el-card>
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 关联检查清单信息</div>
              <div class="myDiv grid-container">
                <div> 检查清单单据编号:</div>
                <span>{{ list?.dangerRectCode }}</span>
                <div> 单据类型:</div>
                <span>{{ getDictLabel(DICT_TYPE.INSPECT_LIST_CAT, list?.inspectListCat) }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="10">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 隐患信息</div>
              <div class="myDiv">
                <div> 隐患描述</div>
                <div> {{ list?.dangerDesc }}</div>
                <div>
                  <el-row>
                    <el-col :span="12"> 隐患位置</el-col>
                    <el-col :span="12">隐患等级</el-col>
                    <el-col :span="12">{{ list?.dangerAddress }}</el-col>
                    <el-col :span="12"
                      >{{ getDictLabel(DICT_TYPE.DANGER_LEVEL, list?.dangerLevel) }}
                    </el-col>
                  </el-row>
                </div>
                <div> 隐患图片</div>
                <div>
                  <div v-if="list?.dangerUrl != null">
                    <el-image
                      v-for="(item, key) in list?.dangerUrl.split(',')"
                      :key="key"
                      :src="item"
                      :preview-src-list="list?.dangerUrl.split(',')"
                      style="width: 100px; height: 100px; margin-right: 10px"
                      :initial-index="key"
                    />
                  </div>
                </div>
              </div>
            </el-card>
            <el-card shadow="never" v-if="list?.rectConditionType == 50">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 整改完成信息</div>
              <div class="myDiv">
                <div>
                  <el-row>
                    <el-col :span="12"> 整改完成日期</el-col>
                    <el-col :span="12"> 整改完成情况</el-col>
                    <el-col :span="12">
                      {{ dateFormatter2(null, {} as any, list?.rectCompleteTime) }}
                    </el-col>
                    <el-col :span="12"> {{ list?.rectCompletionState }}</el-col>
                  </el-row>
                </div>
                <div> 隐患整改后图片</div>
                <div v-if="list?.rectCompleteUrl != null">
                  <el-image
                    v-for="(item, key) in list?.rectCompleteUrl.split(',')"
                    :key="key"
                    :src="item"
                    :preview-src-list="list?.rectCompleteUrl.split(',')"
                    style="width: 100px; height: 100px; margin-right: 10px"
                    :initial-index="key"
                  />
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="never">
              <div style="border-left: 4px solid blue; padding-left: 5px;font-weight: bold;"> 节点跟踪</div>
              <div style="margin-top: 10px; padding-left: 10px">
                <el-timeline style="max-width: 600px">
                  <el-timeline-item
                    :timestamp="item.evtStateName"
                    placement="top"
                    v-for="(item, index) in list?.eventList"
                    :key="index"
                  >
                    <div class="grid-container">
                      <div>操作人员：</div>
                      <div>{{ item.operatorName }}</div>
                      <div>操作时间：</div>
                      <div>{{ dateFormatter(null, {} as any, item.createTime) }}</div>
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
  <!-- 表单弹窗：添加/修改 -->
  <InspectRecordEnter ref="formRef" @success="getList" />
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import InspectRecordEnter from './inspectRecordEnter.vue'
import {dateFormatter, dateFormatter2} from '@/utils/formatTime'

const formRef = ref()
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
const props = defineProps<{
  id: string // 流程实例的编号
  taskId?: string // 任务编号
  activityId?: string //流程活动编号，用于抄送查看
}>()
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
}
const openDialog = () => {
  formRef.value.open('update', list.value)
}
/** 初始化 */
onMounted(async () => {
  getList()
})
import { DangerRectApi } from '@/api/prt/dangerRect'
import { DICT_TYPE, getDictLabel,getIntDictOptions } from '@/utils/dict'

/** 查询详情 */
let loading = ref(false)
interface EventApi {
  evtStateName:string
  operatorName:string
  createTime:string
}
interface listApi{
  rectConditionType:number
  dangerRectCode:string
  inspectUserName:string
  inspectTime:string
  respDeptName:string
  dangerSource:string
  rectChargeUserName:string
  rectCompleteTime:string
  inspectListCat:string
  dangerAddress:string
  dangerLevel:string
  dangerUrl:string
  dangerDesc:string
  rectCompletionState:string
  rectCompleteUrl:string
  eventList: EventApi[]
}
let list = ref<listApi>()
const getList = async () => {
  loading.value = true
  if(props.id != null){
    try {
      list.value = await DangerRectApi.getDangerRect(props.id)
    } finally {
      loading.value = false
    }
  }else{
    try {
      list.value = await DangerRectApi.getDangerRect(route.query.id)
    } finally {
      loading.value = false
    }
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
  font-size: 14px;
}

.myDiv span {
  margin-top: 10px;
  font-size: 14px;
}

.grid-container {
  display: grid;
  grid-template-columns: 6fr 10fr;
}
.grid-container div{
  font-size: 14px;
}
</style>
