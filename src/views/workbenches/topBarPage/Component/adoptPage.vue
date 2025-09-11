<template>
  <div style="margin-top: 50px">
    <el-row v-loading="processInstanceLoading">
      <el-col :offset="6">
        <MyExtend :items="MyContent" />
      </el-col>
    </el-row>
    <el-row>
      <Adopt ref="adoptRef" @submit="getApprovalDetail" />
    </el-row>
  </div>
  <!-- 固定在底部的按钮 -->
  <div  class="buttons">
    <el-button @click="open(1)" v-if="MyContent?.isShowAdoptApproval == 1" type="primary">
      采纳审批
    </el-button>
    <el-button @click="open(2)" v-if="MyContent?.isShowAllocationRectification == 1" type="primary">
      分配整改任务
    </el-button>
  </div>
</template>
<script setup lang="ts">
import Adopt from './adopt.vue'

let adoptRef = ref()
import MyExtend from '@/views/workbenches/topBarPage/Component/detail/Extend.vue'

let processInstanceLoading = ref(false)
// const message = useMessage() // 消息弹窗
const props = defineProps<{
  id: string // 流程实例的编号
  taskId?: string // 任务编号
  activityId?: string //流程活动编号，用于抄送查看
}>()
let MyContent = ref()
import { RecordApi } from '@/api/prt/hiddenDanger'

/** 获取审批详情 */
const getApprovalDetail = async () => {
  processInstanceLoading.value = true
  try {
    MyContent.value = await RecordApi.getRecord(props.id)
  } finally {
    processInstanceLoading.value = false
  }
}
onMounted(async () => {
  await getApprovalDetail()
})
const open = (type: number) => {
  adoptRef.value.open(props.id, type)
}
</script>
<style scoped lang="scss">
.buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 10px 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}
</style>
