<template>
  <el-drawer
    v-model="dialogVisible"
    :title="type == 1 ? '采纳审批' : '分配整改任务'"
    width="700"
    @close="handleClose(ruleFormRef)"
  >
    <div>
      <el-form
        :label-position="labelPosition"
        ref="ruleFormRef"
        :model="formData"
        :rules="rules"
        label-width="auto"
        status-icon
      >
        <div v-if="type == 1">
          <el-form-item label="审批" prop="isAdopt">
            <el-radio-group v-model="formData.isAdopt" size="large">
              <el-radio label="同意采纳" value="1" />
              <el-radio label="不同意采纳" value="0" />
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="formData.isAdopt == '1' ? '同意采纳' : '不同意采纳'">
            <el-input
              v-model="formData.approvalOpinion"
              :placeholder="formData.isAdopt == '1' ? '请输入同意采纳理由' : '请输入不同意采纳理由'"
              :rows="5"
              type="textarea"
            />
          </el-form-item>
          <el-form-item label="检查类型" prop="dangerLevel" v-if="formData.isAdopt == '1'">
            <el-segmented v-model="formData.dangerLevel" :options="inspectionTypeOptions">
              <template #default="scope">
                <div>{{ getValue(scope.item) }}</div>
              </template>
            </el-segmented>
          </el-form-item>
        </div>
        <div v-else>
          <el-form-item label-width="0px">
            <div style="padding: 3px; background: #f9f9f9; width: 100%">
              隐患整改任务分配后，请前往【隐患排查治理台账】查看隐患整改情况
            </div>
          </el-form-item>
          <el-form-item label="责任部门" prop="respDeptId">
            <el-tree-select
              @node-click="respDeptIdChange"
              :check-strictly="true"
              node-key="id"
              v-model="formData.respDeptId"
              :data="treelist"
              :render-after-expand="false"
              style="width: 100%"
              :props="defaultProps"
            />
          </el-form-item>
          <el-form-item label="管控责任人" prop="rectChargeUserId">
            <el-select
              v-model="formData.rectChargeUserId"
              placeholder="请选择"
              @change="setRespUserName"
            >
              <el-option
                :label="item.nickname"
                :value="item.id"
                v-for="(item, index) in userlist"
                :key="index"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="整改期限" prop="rectCompleteTime">
            <el-date-picker
              style="width: 100%"
              v-model="formData.rectCompleteTime"
              type="date"
              placeholder="选择日期时间"
              value-format="x"
            />
          </el-form-item>
        </div>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm(1)" v-loading="loading" :disabled="loading">
          保存
        </el-button>
        <el-button
          type="primary"
          @click="submitForm(2)"
          v-loading="loading"
          :disabled="loading"
          v-if="type == 1 && formData.isAdopt == '1'"
        >
          保存并分配整改任务
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import { ref, reactive, defineEmits } from 'vue'
import type { FormInstance, FormRules, FormProps } from 'element-plus'
// import { DangerRectApi } from '@/api/prt/dangerRect'

const inspectionTypeOptions = [5, 10]
const getValue = (item) => {
  if (item == 5) {
    return '一般隐患'
  } else {
    return '重大隐患'
  }
}
const labelPosition = ref<FormProps['labelPosition']>('top')

interface FormData {
  isAdopt: String
  rectCompleteTime: any
  rectChargeUserId: String
  respDeptId: String
  dangerLevel: String
  approvalOpinion: String
  respDeptName: String
  endTime: any
  id: any
  rectChargeUserName: String
}

const respDeptIdChange = (val) => {
  formData.value.respDeptName = val.name
}
const setRespUserName = (val) => {
  userlist.value.forEach((i) => {
    if (i.id == val) {
      formData.value.rectChargeUserName = i.nickname
    }
  })
}
const treelist = ref<any[]>([])
let deptList = ref([])
/** 查询部门列表 */
const getList = async () => {
  try {
    const data = await DeptApi.getDeptPage(queryParams)
    deptList.value = JSON.parse(JSON.stringify(data))
    treelist.value = handleTree(data)
  } finally {
  }
}
/** 初始化 **/
onMounted(() => {
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 30)
  formData.value.endTime = futureDate
  getList()
  getUserLIst()
})
const emit = defineEmits(['submit', 'reset', 'validated', 'update:modelValue'])

let formData = ref<FormData>({
  isAdopt: '',
  rectCompleteTime: '',
  rectChargeUserId: '',
  respDeptId: '',
  dangerLevel: '',
  endTime: '',
  rectChargeUserName: '',
  respDeptName: '',
  approvalOpinion: '',
  id: ''
})
const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<FormData>>({
  isAdopt: [{ required: true, message: '请选择', trigger: 'change' }]
})

let dialogVisible = ref(false)
const handleClose = async (formEl) => {
  if (isAdoptY.value == 1) {
    if (!formEl) return
    formData.value = {
      isAdopt: '',
      rectCompleteTime: '',
      rectChargeUserId: '',
      respDeptId: '',
      dangerLevel: '',
      endTime: '',
      rectChargeUserName: '',
      respDeptName: '',
      approvalOpinion: '',
      id: ''
    }
    formEl.resetFields()
    dialogVisible.value = false
    return
  }
  if (flag.value && type.value == 2) {
    type.value = 1
    return
  }
  if (!formEl) return
  formData.value = {
    isAdopt: '',
    rectCompleteTime: '',
    rectChargeUserId: '',
    respDeptId: '',
    dangerLevel: '',
    endTime: '',
    rectChargeUserName: '',
    respDeptName: '',
    approvalOpinion: '',
    id: ''
  }
  formEl.resetFields()
  dialogVisible.value = false
}
let flag = ref(false)
import { RecordApi } from '@/api/prt/hiddenDanger'

let isAdoptY = ref(0)
const message = useMessage() // 消息弹窗
const submitForm = async (tag) => {
  if (!ruleFormRef.value) return
  ruleFormRef.value?.validate(async (valid) => {
    if (valid) {
      if (tag == 2) {
        type.value = tag
        flag.value = true
      }
      console.log('type.value:', type.value, 'tag:', tag)
      // 请求分配任务接口
      loading.value = true
      try {
        let form = JSON.parse(JSON.stringify(formData.value))
        if (type.value == 1 && tag == 1) {
          console.log('1')
          await RecordApi.createdApprove(form)
          message.success('审批成功')
          emit('submit', form) // 使用组件内的 ruleForm
          dialogVisible.value = false
        } else if (tag == 2 && type.value == 2) {
          console.log('2')
          await RecordApi.createdApprove(form)
          isAdoptY.value = 1
          message.success('审批成功')
        } else if (tag == 1 && type.value == 2) {
          console.log('3')
          await RecordApi.createdAllocation(form)
          message.success('分配整改任务成功')
          emit('submit', form) // 使用组件内的 ruleForm
          dialogVisible.value = false
        }
      } finally {
        loading.value = false
      }
    }
  })
}
interface UserVO {
  id: number
  username: string
  nickname: string
}
let userlist = ref<UserVO[]>([])
import * as UserApi from '@/api/system/user'
import { defaultProps, handleTree } from '@/utils/tree'
import * as DeptApi from '@/api/system/dept'
// import { isAgreedYue } from '@/api/bpm/topBarPage'
// import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
// import { getSimpleUserList } from '@/api/system/user'

const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  username: undefined,
  mobile: undefined,
  status: undefined,
  deptId: undefined,
  createTime: []
})
const getUserLIst = async () => {
  userlist.value = await UserApi.getSimpleUserList()
}
let loading = ref(false)
// 弹窗内容
let type = ref(1)
const open = async (id, tag) => {
  formData.value.id = id
  // 请求获取任务接口
  flag.value = false
  dialogVisible.value = true
  type.value = tag
  const today = new Date()
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + 30)
  formData.value.rectCompleteTime = futureDate
  console.log('tag', tag)
  console.log('futureDate', futureDate)
}
// 暴露方法给父组件
defineExpose({
  validate: submitForm,
  open
})
</script>

<style scoped>
.demo-formData {
  margin: 0 auto;
}

:deep(.el-card__body) {
  background: #f9f9f9;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-align {
  font-size: var(--el-form-label-font-size);
  /* 可以根据需要添加样式 */
}

.right-align {
  font-size: var(--el-form-label-font-size);
  margin-left: auto; /* 将元素推向右侧 */
}
</style>
