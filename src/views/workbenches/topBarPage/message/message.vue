<template>
  <el-row :gutter="6">
    <el-col :span="7">
      <!--&lt;!&ndash;      bpm_user_task_form_path_type&ndash;&gt;-->
      <!--      路径类型：提交路径  20   详情路径  10-->
      <!--&lt;!&ndash;bpm_user_task_form_type&ndash;&gt;-->
      <!--      <hr/>-->
      <!--      表单类型：流程表单 10  业务表单 20 公共表单 0-->
      <!--      <hr/>-->
      <!--      如果formSetting.taskFormType表单类型为0,10则跳转到BpmProcessInstanceDetail这个页面-->

      <!--      如果formSetting.taskFormPathType表单路径类型-->
      <ContentWrap>
        <el-tabs v-model="matterActive" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="系统消息" name="2">
            <template #label>
              <el-badge
                :show-zero="false"
                :value="formCount.count1 > 0 ? formCount.count1 : ''"
                class="item"
              >
                <div>系统消息</div>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="通知消息" name="1">
            <template #label>
              <el-badge :value="formCount.count2 > 0 ? formCount.count2 : ''" class="item">
                <div>通知消息</div>
              </el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
        <div style="margin-bottom: 10px">
          <el-button style="color: #67a6e9" @click="setRead">标记为已读</el-button>
        </div>
        <div v-loading="loading" style="height: 592px; overflow-y: auto">
          <div v-if="total < 1" style="text-align: center; width: 100%">暂无数据</div>
          <el-card
            v-else
            shadow="never"
            v-for="(item, key) in list"
            :key="key"
            @click="getMatter(item)"
          >
            <el-row>
              <el-col :span="20">
                <el-image
                  :src="item.icon != null ? item.icon : icon"
                  style="height: 14px; width: 14px"
                />
                <span style="margin-left: 5px; font-weight: bold; font-size: 14px">{{
                  item.templateContent
                }}</span>
                <!--                <div>消息来源：{{getDictLabel(DICT_TYPE.CLIENT_TYPE, item.clientType)}}</div>-->
                <div style="margin-left: 18px; font-size: 14px">
                  <div>消息来源：{{ item.templateNickname }}</div>
                  <div>发布时间：{{ dateFormatter(null, null as any, item.createTime) }}</div>
                </div>
              </el-col>
              <el-col :span="4" style="text-align: right">
                <el-tag
                  v-if="item.readStatus == true"
                  size="small"
                  style="margin-right: 5px; background: #e99d42; color: white"
                >
                  已读
                </el-tag>
                <el-tag
                  v-if="item.readStatus == false"
                  size="small"
                  style="margin-right: 5px; background: #7bb624; color: white"
                >
                  未读
                </el-tag>
              </el-col>
            </el-row>
          </el-card>
        </div>
      </ContentWrap>
      <div>
        <ContentWrap v-if="total > 0">
          <PaginationBack
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </ContentWrap>
      </div>
    </el-col>
    <el-col :span="17">
      <ContentWrap
        :body-style="{ padding: '0px', height: '777px' }"
        class="!mb-0"
        style="overflow-y: auto; margin-top: 10px"
        v-if="isShow"
      >
        <el-row v-loading="formLoading" style="height: 100%">
          <el-col v-if="test01?.formSetting?.taskFormType != '20'">
            <AsyncPublicDetail
              style="height: 100%"
              :id="test01?.id"
              :taskId="test01?.taskId"
              :activityId="test01?.activityId"
            />
          </el-col>
        </el-row>
      </ContentWrap>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import {  dateFormatter } from '@/utils/formatTime'
// import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { defineAsyncComponent, ref } from 'vue'
import icon from '@/assets/imgs/workbenches/message.png'
// import Message from '@/views/workbenches/topBarPage/Component/Message.vue'

let matterActive = ref('2') //待办事项
import * as TodoTaskWorkAPI from '@/api/bpm/topBarPage'
import * as NotifyMessageApi from '@/api/system/notify/message'

let test01 = ref({
  id: '1',
  taskId: '2',
  formSetting: {
    taskFormType: '',
    taskFormPathType: ''
  },
  activityId: '3'
})
const handleClick = (e) => {
  queryParams.templateType = e.props.name
  getList(null)
}
// const copyText = (text) => {
//   navigator.clipboard.writeText(text).then(() => {
//     ElMessage.success('复制成功')
//   })
// }
// let date1 = ref()
let queryParams = reactive({
  pageNo: 1,
  templateType: 2,
  inspectListCat: 1,
  pageSize: 10,
  createTime: '',
  dueTime: '',
  test1: '',
  workType: 1
})
let isShow = ref(false)
let formLoading = ref(false)
// 动态导入组件（路径可以是变量）
let AsyncPublicDetail = defineAsyncComponent(() => null)
const getMatter = async (item) => {
  AsyncPublicDetail = defineAsyncComponent(() => null)
  try {
    formLoading.value = true
    test01.value = item
    ImportPage(item)
  } finally {
    formLoading.value = false
  }
}
const ImportPage = (item) => {
  isShow.value = true
  test01.value = {
    id: item.id
  }
  //   跳转到自定义页面
  AsyncPublicDetail = defineAsyncComponent(
    () => import('@/views/workbenches/topBarPage/Component/Message.vue')
  )
//   同时标记该消息为已读
  NotifyMessageApi.updateNotifyMessageRead([item.id])
  getList(1)
}
// 请求接口
// const { t } = useI18n() // 国际化
// const message = useMessage() // 消息弹窗

let total = ref(0)
let loading = ref(false)
interface NotifyMessageVO {
  icon: string
  templateContent: string
  templateNickname: string
  createTime: string
  readStatus: any
}
let list = ref<NotifyMessageVO[]>([])
// import { useRouter } from 'vue-router'
// 标记所有消息为已读
const setRead = async () => {
  await NotifyMessageApi.updateAllNotifyMessageRead()
  await getList(null)
}
/** 查询列表 */
const getList = async (val) => {
  if(val != 1){
    loading.value = true
  }
  try {
    const data = await NotifyMessageApi.getMyNotifyMessagePage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}
let formCount = ref({
  count1: 0,
  count2: 0,
  count3: 0,
  count4: 0
})
const getCount = async () => {
  try {
    formCount.value.count1 = await TodoTaskWorkAPI.getCount({ category: 1 })
    formCount.value.count2 = await TodoTaskWorkAPI.getCount({ category: 2 })
    formCount.value.count3 = await TodoTaskWorkAPI.getCount({ category: 3 })
    formCount.value.count4 = await TodoTaskWorkAPI.getCount({ category: 4 })
    console.log(formCount.value)
  } finally {
  }
}
/** 初始化 **/
onMounted(() => {
  getList(null)
  // getCount()
})
</script>
<style scoped lang="scss">
.myDiv div {
  margin-top: 10px;
}

.myDiv span {
  margin-top: 10px;
}

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

:deep(.el-card__body) {
  padding: 5px;
}

.flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* 调整间距 */
}

.flex-item {
  display: flex;
  align-items: center;
}

.separator {
  margin-left: 8px;
  color: #ccc;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
