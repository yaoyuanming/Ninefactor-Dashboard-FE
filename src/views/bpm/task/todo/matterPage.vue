<template>
  <el-row>
    <el-col :span="24">
      <!--      路径类型：提交路径  20   详情路径  10-->
      <!--      <hr/>-->
      <!--      表单类型：流程表单 10  业务表单 20 公共表单 0-->
      <!--      <hr/>-->
      <!--      业务表单 20-->
      <!--      <hr/>-->
      <!--      则跳转到如果formSetting.taskFormCustomPath对应的path页面（自定义页面）-->
      <!--      <hr/>-->
      <!--      如果表单类型是流程表单10和公共表单0则直接使用BpmProcessInstanceDetail页面（做修改），对操作页面做自定义（按钮）-->
      <!--      <hr/>-->
      <!--      如果formSetting.taskFormPathType表单路径类型-->
      <!--      title="用户信息" message="12121"-->
      <ContentWrap style="height: 100%">
        <el-tabs v-model="matterActive" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="1待我处理" name="1">
            <template #label>
              <el-badge
                :show-zero="false"
                :value="formCount.count1 > 0 ? formCount.count1 : ''"
                class="item"
              >
                <div>待我处理1</div>
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
                <div>我已处理</div>
              </el-badge>
            </template>
          </el-tab-pane>
          <el-tab-pane label="我创建的" name="4">
            <template #label>
              <el-badge :value="formCount.count4 > 0 ? formCount.count4 : ''" class="item">
                <div>我已处理</div>
              </el-badge>
            </template>
          </el-tab-pane>
        </el-tabs>
        <el-form :inline="true" class="demo-form-inline">
          <el-form-item>
            <el-input v-model="queryParams.name" placeholder="请输入流程任务名" />
          </el-form-item>
          <el-form-item>
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
          </el-form-item>
          <el-form-item label="" prop="inspectRecordCode">
            <el-select
              clearable
              v-model="queryParams.test1"
              placeholder="请选择"
              style="width: 115px"
            >
              <el-option label="创建时间" value="1" />
              <el-option label="截止时间" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="queryParams.test1 != null && queryParams.test1 != ''">
            <el-date-picker
              v-model="date1"
              type="daterange"
              placeholder="请选择"
              @change="handleQuery"
              value-format="x"
            />
          </el-form-item>
        </el-form>
        <div v-loading="loading" style="height: 500px; overflow-y: auto">
          <el-card shadow="never" v-for="(item, key) in list" :key="key" @click="getMatter(item)">
            <el-row>
              <el-col :span="20">
                <el-image :src="item.icon" style="height: 14px; width: 14px" />
                <span style="margin-left: 5px">{{ item.name }}</span
                ><span style="margin-left: 5px" v-if="item.bizTags != null">
                  <el-tag
                    size="small"
                    style="margin-right: 5px"
                    v-for="(item2, index3) in item.bizTags.split(',')"
                    :key="index3"
                  >
                    {{ item2 }}</el-tag
                  >
                </span>
              </el-col>
              <el-col :span="4" style="text-align: right">
                <el-tag v-if="item.status == 0">待办</el-tag>
                <el-tag v-if="item.status == 1">已办</el-tag>
                <el-tag v-if="item.status == 2">已作废</el-tag>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="20">
                4324
                <!--                <div class="flex-container">-->
                <!--                  <div-->
                <!--                    v-for="(item1, index4) in item?.processInstance?.basicContent"-->
                <!--                    :key="index4"-->
                <!--                    class="flex-item"-->
                <!--                  >-->
                <!--                    {{ item1.label }}:{{ item1.value }}-->
                <!--                    <span-->
                <!--                      v-if="-->
                <!--                        index4 % 2 !== 1 &&-->
                <!--                        index4 !== item?.processInstance?.basicContent.length - 1-->
                <!--                      "-->
                <!--                      class="separator"-->
                <!--                    >-->
                <!--                      |-->
                <!--                    </span>-->
                <!--                  </div>-->
                <!--                </div>-->
              </el-col>
            </el-row>
          </el-card>
        </div>
      </ContentWrap>
      <div>
        <ContentWrap v-if="total > 0">
          <Pagination
            :total="total"
            v-model:page="queryParams.pageNo"
            v-model:limit="queryParams.pageSize"
            @pagination="getList"
          />
        </ContentWrap>
      </div>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
// import Adopt from '@/views/workbenches/topBarPage/Component/adopt.vue'

let matterActive = ref('1') //待办事项
import * as TodoTaskWorkAPI from '@/api/bpm/topBarPage'

const handleQuery = () => {
  queryParams.createTime = ''
  queryParams.dueTime = ''
  console.log('date1.value', date1.value)
  if (queryParams.test1 == '1') {
    queryParams.createTime = date1.value
  } else if (queryParams.test1 == '2') {
    queryParams.dueTime = date1.value
  }
  getList()
}
const handleClick = (e) => {
  queryParams.workType = e.index + 1
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
  name: '',
  dueTime: '',
  category: '',
  createTime: '',
  test1: '',
  matterType1: '',
  inspectListCat: 1,
  pageSize: 10,
  workType: 1
})
const { push } = useRouter() // 路由
const getMatter = async (row) => {
  // 判断页面跳转逻辑
  console.log('item', row)
  // push("/workbenches/task/done")
  if (row.formSetting?.taskFormType == 20) {
    //   则跳转到formSetting.taskFormCustomPath对应的path页面,页面为自定义页面（定制化页面）
    //   使用push跳转到自定义路径
    // 判断是否为http\https  开头的路径，如果是则跳转到对应的路径
    push(row.formSetting?.taskFormCustomPath)
  } else if (row.formSetting?.taskFormType == 0 || row.formSetting?.taskFormType == 10) {
    //   跳转到公共路径BpmProcessInstanceDetail，对页面的操作按钮做修改
    push({
      name: 'BpmProcessInstanceDetail',
      query: {
        id: row.processInstance.id,
        taskId: row.id
      }
    })
  }
}
// 请求接口
// const { t } = useI18n() // 国际化
// const message = useMessage() // 消息弹窗
let total = ref(0)
let loading = ref(false)

interface BpmTaskRespVO {
  icon: string
  name: string
  bizTags: string
  status: number
  processInstance: any
}

let list = ref<BpmTaskRespVO[]>([])
import * as TaskApi from '@/api/bpm/task'

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TaskApi.getTaskTodoPage(queryParams)
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
    formCount.value.count1 = await TodoTaskWorkAPI.getCount({ workType: 1 })
    formCount.value.count2 = await TodoTaskWorkAPI.getCount({ workType: 2 })
    formCount.value.count3 = await TodoTaskWorkAPI.getCount({ workType: 3 })
    formCount.value.count4 = await TodoTaskWorkAPI.getCount({ workType: 4 })
    console.log(formCount.value)
  } finally {
  }
}
/** 初始化 **/
onMounted(() => {
  getList()
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
</style>
