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
          <el-tab-pane label="待我处理" name="1">
            <template #label>
              <el-badge
                :show-zero="false"
                :value="formCount.count1 > 0 ? formCount.count1 : ''"
                class="item"
              >
                <div>待我处理</div>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="我已处理" name="2">
            <template #label>
              <el-badge :value="formCount.count2 > 0 ? formCount.count2 : ''" class="item">
                <div>我已处理</div>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="抄送我的" name="3">
            <template #label>
              <el-badge :value="formCount.count3 > 0 ? formCount.count3 : ''" class="item">
                <div>抄送我的</div>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="我创建的" name="4">
            <template #label>
              <el-badge :value="formCount.count4 > 0 ? formCount.count4 : ''" class="item">
                <div>我创建的</div>
              </el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
        <!--        <el-form :inline="true" class="demo-form-inline">-->
        <!--          <el-form-item>-->
        <!--            <el-input-->
        <!--              @keydown.enter="handleQuery"-->
        <!--              v-model="queryParams.name"-->
        <!--              placeholder="请输入流程任务名称"-->
        <!--            />-->
        <!--          </el-form-item>-->
        <el-space wrap style="margin-bottom: 10px">
          <el-select
            clearable
            @change="handleQuery"
            v-model="queryParams.category"
            placeholder="流程分类"
            style="width: 115px"
          >
            <el-option
              :label="item.label"
              :value="item.value"
              v-for="(item, index) in getIntDictOptions(DICT_TYPE.BPM_TODO_CATEGORY)"
              :key="index"
            />
          </el-select>
          <el-select
            clearable
            v-model="queryParams.test1"
            placeholder="请选择"
            style="width: 115px"
          >
            <el-option label="创建时间" value="1" />
            <el-option label="截止时间" value="2" />
          </el-select>
          <el-date-picker
            style="width: 230px"
            v-if="queryParams.test1 != null && queryParams.test1 != ''"
            v-model="date1"
            type="daterange"
            placeholder="请选择"
            @change="handleQuery"
            value-format="x"
          />
        </el-space>
        <!--        </el-form>-->
        <div v-loading="loading" style="height: 592px; overflow-y: auto">
          <div v-if="total < 1" style="text-align: center; width: 100%">暂无数据</div>
          <el-card
            v-else
            shadow="hover"
            v-for="(item, key) in list"
            :key="key"
            @click="getMatter(item)"
            class="hover:bg-gray-100 transition-colors duration-200"
          >
            <el-row>
              <el-col :span="20">
                <el-image
                  :src="item.icon != null ? item.icon : icon"
                  style="height: 14px; width: 14px"
                />
                <span
                  style="margin-left: 5px; font-weight: bold; font-size: 14px; margin-bottom: 15px"
                  >{{ item?.processInstance?.name }}</span
                >
                <span style="margin-left: 5px" v-if="item.bizTags != null">
                  <el-tag
                    size="small"
                    style="margin-right: 5px; background: #1f7aff"
                    v-for="(item2, index3) in item.bizTags.split(',')"
                    :key="index3"
                  >
                    {{ item2 }}</el-tag
                  >
                </span>
              </el-col>
              <el-col
                :span="4"
                style="text-align: right"
                v-if="item.workType == '1' || item.workType == '2'"
              >
                <el-tag v-if="item.status != null">
                  {{ getDictLabel(DICT_TYPE.BPM_TASK_STATUS, item.status) }}
                </el-tag>
              </el-col>
              <el-col :span="4" style="text-align: right" v-else>
                <el-tag v-if="item.status != null">
                  {{
                    getDictLabel(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS, item.processInstance.status)
                  }}
                </el-tag>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="20">
                <div class="flex-container">
                  <div
                    style="margin-left: 18px; font-size: 14px; padding-bottom: 1px"
                    v-for="(item1, index4) in item?.processInstance?.basicContent"
                    :key="index4"
                    class="flex-item"
                  >
                    {{ item1.key }}：{{ item1.value }}
                    <span
                      v-if="
                        index4 % 2 !== 1 &&
                        index4 !== item?.processInstance?.basicContent.length - 1
                      "
                      class="separator"
                    >
                      |
                    </span>
                  </div>
                </div>
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
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'
import { defineAsyncComponent, ref, shallowRef } from 'vue'
import icon from '@/assets/imgs/workbenches/to-do.png'

let matterActive = ref('1') //待办事项
import * as TodoTaskWorkAPI from '@/api/bpm/topBarPage'

let test01 = ref({
  id: '1',
  taskId: '2',
  formSetting: {
    taskFormType: '',
    taskFormPathType: ''
  },
  activityId: '3'
})
const handleQuery = () => {
  queryParams.createTime = ''
  queryParams.dueTime = ''
  if (queryParams.test1 == '1') {
    queryParams.createTime = date1.value
  } else if (queryParams.test1 == '2') {
    queryParams.dueTime = date1.value
  }
  getList()
}
const handleClick = (e) => {
  queryParams.workType = Number(e.index) + 1
  getList()
}
// const copyText = (text) => {
//   navigator.clipboard.writeText(text).then(() => {
//     ElMessage.success('复制成功')
//   })
// }
let date1 = ref()
let queryParams = reactive({
  pageNo: 1,
  category: '',
  inspectListCat: 1,
  pageSize: 10,
  createTime: '',
  dueTime: '',
  test1: '',
  workType: 1
})
let isShow = ref(false)
let formLoading = ref(false)
// const router = useRouter() // 路由
// 动态导入组件（路径可以是变量）
let AsyncPublicDetail = shallowRef(null)
const getMatter = async (item) => {
  AsyncPublicDetail = shallowRef(null)
  console.log(item)
  // 测试
  // router.push("workbenches/topBarPage/matterComponents/index")
  try {
    formLoading.value = true
    test01.value = item
    if (test01.value?.formSetting?.taskFormType != '20') {
      console.log('!20')
      isShow.value = true
      AsyncPublicDetail = defineAsyncComponent(
        () => import('@/views/workbenches/topBarPage/Component/detail/index.vue')
        // () => import('@/views/workbenches/topBarPage/Component/detail/index.vue') //测试
      )
      test01.value = {
        id: item.processInstance.id,
        taskId: item.id
      }
    } else if (test01.value?.formSetting?.taskFormType == '20') {
      console.log('20')
      ImportPage(item)
    }
  } finally {
    formLoading.value = false
  }
}
const ImportPage = (item) => {
  isShow.value = true
  if (
    item.formSetting.taskFormCustomPath == '@/views/workbenches/topBarPage/Component/adoptPage.vue'
  ) {
    test01.value = {
      id: item.processInstance.businessKey
    }
    // AsyncPublicDetail = defineAsyncComponent(
    //   () => import(/* @vite-import-ignore */ item.formSetting.taskFormCustomPath)
    // );
    // 跳转到自定义页面
    AsyncPublicDetail = defineAsyncComponent(
      () => import('@/views/workbenches/topBarPage/Component/adoptPage.vue')
      // () => import('@/views/prt/hazardInvestigation/detailsGZ.vue')
    )
  }
  else if(item.formSetting.taskFormCustomPath == "/workbenches/topBarPage/matterComponents/rectificationInput"){
    test01.value = {
      id: item.processInstance.businessKey
    }
    // 跳转到自定义页面
    AsyncPublicDetail = defineAsyncComponent(
      () => import('@/views/workbenches/topBarPage/matterComponents/rectificationInput.vue')
    )
  }
}
// 请求接口
// const { t } = useI18n() // 国际化
// const message = useMessage() // 消息弹窗

let total = ref(0)
let loading = ref(false)

interface BasicContent {
  key: string
  value: string
}

interface ProcessInstance {
  name: string
  dueTime: string
  status: string
  basicContent: BasicContent[]
}

interface TaskPageReqVO {
  icon: string
  processInstance: ProcessInstance
  workType: string
  bizTags: string
  status: string
  createTime: string
  dueTime: string
}

let list = ref<TaskPageReqVO[]>([])
import * as TaskApi from '@/api/bpm/task'
// import { useRouter } from 'vue-router'

/** 查询列表 */
const getList = async () => {
  loading.value = true
  list.value = []
  try {
    const data = await TaskApi.getTaskPage(queryParams)
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
  getList()
  getCount()
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
  gap: 1px; /* 调整间距 */
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
