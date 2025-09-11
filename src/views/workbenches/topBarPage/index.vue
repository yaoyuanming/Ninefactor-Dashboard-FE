<template>
  <ContentWrap :body-style="{ paddingTop: '5px',paddingBottom: '0px'}" class="!mb-0">
    <!-- 搜索工作栏 -->
    <el-tabs v-model="activeName" class="demo-tabs" @tab-change="handleChange">
      <el-tab-pane label="事项申请" name="1" >
        <template #label>
          <div>事项申请 <el-badge v-if="formCount.count1 > 0" value="1" class="ml-1" type="danger" is-dot/></div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="待办事项" name="2">
        <template #label>
          <div>待办事项 <el-badge v-if="formCount.count2 > 0"  value="1" class="ml-1" type="danger" is-dot/></div>
        </template>
      </el-tab-pane>
      <el-tab-pane label="消息通知" name="3"  >
        <template #label>
          <div>消息通知 <el-badge v-if="formCount.count3 > 0" value="1" class="ml-1" type="danger" is-dot/></div>
        </template>
      </el-tab-pane>
    </el-tabs>
  </ContentWrap>
  <div v-if="activeName == '1'">
    <CreatePage />
  </div>
  <div v-if="activeName == '2'" style="margin-top: -6px;">
    <MatterPage />
  </div>
  <div v-if="activeName == '3'" style="margin-top: -6px;">
    <Message />
  </div>
</template>

<script setup lang="ts">
import MatterPage from '@/views/workbenches/topBarPage/matterPage.vue'
import CreatePage from './create/index.vue'
import Message from '@/views/workbenches/topBarPage/message/message.vue'
import {useAppStore} from "@/store/modules/app";
const appStore = useAppStore()
const getTag = computed(() => appStore.getWorkTag)
let activeName = ref(getTag||'1')
const handleChange = (item) => {
  appStore.setWorkTag(item)
}
import * as TodoTaskWorkAPI from '@/api/bpm/topBarPage'
let formCount = ref({
  count1:0,
  count2:0,
  count3:0,
})
import * as NotifyMessageApi from '@/api/system/notify/message'
// 获得未读消息数
const getUnreadCount = async () => {
  formCount.value.count3 = await NotifyMessageApi.getUnreadNotifyMessageCount()
}
const getCount = async () => {
  try {
    formCount.value.count2 = await TodoTaskWorkAPI.getCount({})
    console.log(formCount.value)
  } finally {
  }
}
let pollInterval = null

onMounted(() => {
  // 立即调用一次
  getCount()
  getUnreadCount()
  // 设置轮询，例如每5秒一次
  pollInterval = setInterval(() => {
    getCount()
    getUnreadCount()
  }, 10000) // 5000毫秒 = 5秒
})

// 记得在组件卸载时清除定时器
onUnmounted(() => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
})
</script>
