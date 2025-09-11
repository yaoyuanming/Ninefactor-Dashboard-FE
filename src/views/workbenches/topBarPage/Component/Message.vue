<template>
  <ContentWrap style="height: 100%" v-loading="processInstanceLoading">
    <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px">
      {{ MyContent?.templateContent }}
    </div>
    <div style="background: #efefef; padding: 3px 5px 5px 5px">
      <el-space wrap>
        <div>消息来源： {{ MyContent?.templateNickname }}</div>
        <div style="margin-left: 20px">
          发布时间：{{ dateFormatter(null, null as any, MyContent?.createTime) }}
        </div>
      </el-space>
    </div>
  </ContentWrap>
</template>
<script setup lang="ts">
import {  dateFormatter } from '@/utils/formatTime'

let processInstanceLoading = ref(false)
// const message = useMessage() // 消息弹窗
const props = defineProps<{
  id: string // 流程实例的编号
  taskId?: string // 任务编号
  activityId?: string //流程活动编号，用于抄送查看
}>()
let MyContent = ref()
import * as NotifyMessageApi from '@/api/system/notify/message'

/** 获取审批详情 */
const getApprovalDetail = async () => {
  processInstanceLoading.value = true
  try {
    MyContent.value = await NotifyMessageApi.getMessageById(props.id)
    //   同时标记该消息为已读接口
    await NotifyMessageApi.updateNotifyMessageRead([props.id])
  } finally {
    processInstanceLoading.value = false
  }
}
onMounted(async () => {
  await getApprovalDetail()
})
// const open = (type: number) => {
//   adoptRef.value.open(props.id, type)
// }
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
