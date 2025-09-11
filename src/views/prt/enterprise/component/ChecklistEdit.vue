<template>
  <el-drawer
    v-model="dialogVisible"
    title="检查任务分配"
    width="500"
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
        <el-form-item label="检查清单名称" prop="inspectName">
          <el-input v-model="formData.inspectName" placeholder="请输入检查清单名称" />
        </el-form-item>
        <div>
          <div class="label-container">
            <span class="left-align"
              ><span style="color: var(--el-color-danger); padding-right: 5px">*</span
              >检查人员</span
            >
          </div>
        </div>
        <el-form-item label="" prop="inspectUsers">
          <!--        multiple-->
          <el-select v-model="formData.inspectUsers" placeholder="请选择" multiple>
            <el-option
              :label="item.nickname"
              :value="item.id"
              v-for="(item, index) in userList"
              :key="index"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="检查任务提交方式" prop="submitType">
          <el-radio-group v-model="formData.submitType" size="large">
            <el-radio-button label="任意一人提交即可" value="5" />
            <el-radio-button label="全部人员提交" value="1" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="检查频次" prop="inspectFrqType">
          <el-radio-group v-model="formData.inspectFrqType" size="large">
            <el-radio-button label="循环检查" value="2" />
            <el-radio-button label="一次性检查" value="1" />
          </el-radio-group>
        </el-form-item>
        <div v-if="formData.inspectFrqType == '2'">
          <el-card shadow="never">
            <el-form-item label="" prop="cycleFrqType">
              <el-radio-group v-model="formData.cycleFrqType" size="large">
                <el-radio-button label="按小时" value="2" />
                <el-radio-button label="按天" value="3" />
                <el-radio-button label="按月" value="6" />
                <el-radio-button label="按年" value="9" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="" prop="cycleFrqNumber">
              <el-input v-model="formData.cycleFrqNumber" placeholder="请输入检查时间间隔">
                <template #append>{{ getTips() }}/1次</template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <div>{{ getDescribe() }}</div>
            </el-form-item>
            <div v-if="formData.cycleFrqType == '2' || formData.cycleFrqType == '3'">
              <el-form-item label="检查任务分配时间设置" prop="cycleFrqTimeType">
                <el-radio-group v-model="formData.cycleFrqTimeType" size="large">
                  <el-radio-button label="自定义" value="1" />
                  <el-radio-button label="工作日/节假日" value="2" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="" v-if="formData.cycleFrqTimeType == '1'" prop="cycleFrqTimes">
                <el-checkbox-group v-model="formData.cycleFrqTimes">
                  <el-checkbox value="1" name="1"> 周一</el-checkbox>
                  <el-checkbox value="2" name="2"> 周二</el-checkbox>
                  <el-checkbox value="3" name="3"> 周三</el-checkbox>
                  <el-checkbox value="4" name="4"> 周四</el-checkbox>
                  <el-checkbox value="5" name="5"> 周五</el-checkbox>
                  <el-checkbox value="6" name="6"> 周六</el-checkbox>
                  <el-checkbox value="7" name="7"> 周日</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="" v-if="formData.cycleFrqTimeType == '2'" prop="cycleFrqTimes">
                <el-checkbox-group v-model="formData.cycleFrqTimes">
                  <el-checkbox value="8" name="8"> 工作日</el-checkbox>
                  <el-checkbox value="9" name="9"> 周末及节假日</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </div>
          </el-card>
          <el-form-item label="检查任务时间设置" style="margin-top: 20px" required />
          <el-card shadow="never" style="margin-top: -20px; margin-bottom: 20px">
            <el-form-item label="指定时间" prop="isImmediate">
              <div>
                <el-radio-group v-model="formData.isImmediate" size="large">
                  <el-radio label="立即生效" value="1" />
                </el-radio-group>
                <div>保存后，检查清单将立即生效，并按设定频次周期循环自动生成任务</div>
              </div>
            </el-form-item>
            <el-form-item label="" prop="isImmediate">
              <div>
                <el-radio-group v-model="formData.isImmediate" size="large">
                  <el-radio :label="setTitle()" value="0">
                    {{ setTitle() }}
                    <el-date-picker
                      v-if="formData.cycleFrqType != '6' && formData.cycleFrqType != '9'"
                      value-format="x"
                      v-model="formData.startTime"
                      :type="getDateType()"
                      placeholder="选择日期"
                      :disabled="formData.isImmediate != '0'"
                      style="width: 200px; margin-left: 20px"
                    />
                  </el-radio>
                </el-radio-group>
                <div v-if="formData.cycleFrqType == '6'">
                  保存后，检查清单将在次月1日“0点”的生效，并按设定周期环生成任务
                </div>
                <div v-if="formData.cycleFrqType == '9'">
                  保存后，检查清单将在次年1月1日“0点”的生效，并按设定周期环生成任务
                </div>
              </div>
            </el-form-item>
          </el-card>
          <el-card shadow="never">
            <el-form-item label="结束时间">
              <el-radio-group v-model="formData.validType" size="large">
                <el-radio label="指定时间" value="5">
                  指定时间
                  <el-date-picker
                    value-format="x"
                    :disabled="formData.validType != '5'"
                    v-model="formData.endTime"
                    :type="formData.cycleFrqType == '2' ? 'datetime' : 'date'"
                    placeholder="选择日期"
                    style="width: 200px; margin-left: 20px"
                  />
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="">
              <div>保存后，检查清单将按设定结束时间的生效，并停止生成检查任务</div>
            </el-form-item>
            <el-form-item label="" prop="validType">
              <el-radio-group v-model="formData.validType" size="large">
                <el-radio label="长期有效" value="1" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="">
              <div>保存后，检查清单将长期有效</div>
            </el-form-item>
          </el-card>
        </div>
        <div v-if="formData.inspectFrqType == '1'">
          <el-form-item label="检查任务时间设置" style="margin-top: 20px" />
          <el-card shadow="never" style="margin-top: -20px">
            <el-form-item label="指定时间" prop="isImmediate">
              <div>
                <el-radio-group v-model="formData.isImmediate" size="large">
                  <el-radio label="立即生效" value="1" />
                  <el-radio :label="setTitle()" value="0">
                    {{ setTitle() }}
                    <el-date-picker
                      v-if="formData.cycleFrqType != '6' && formData.cycleFrqType != '9'"
                      value-format="x"
                      :disabled="formData.isImmediate != '0'"
                      v-model="formData.startTime"
                      :type="getDateType()"
                      placeholder="选择日期"
                      style="width: 200px; margin-left: 20px"
                    />
                  </el-radio>
                </el-radio-group>
                <div>保存后，检查清单将立即生效，并按设定频次周期循环自动生成任务</div>
              </div>
            </el-form-item>
          </el-card>
        </div>
      </el-form>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose(ruleFormRef)">取消</el-button>
        <el-button type="primary" @click="submitForm()"> 保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script lang="ts" setup>
import * as UserApi from '@/api/system/user'
import { ref, reactive,  defineEmits } from 'vue'
import type { FormInstance, FormRules, FormProps } from 'element-plus'
import { DangerRectApi } from '@/api/prt/dangerRect'

const labelPosition = ref<FormProps['labelPosition']>('top')

interface FormData {
  inspectName: String
  validType: String
  startTime: String
  endTime: String
  inspectUsers: Number
  submitType: String
  inspectFrqType: String
  cycleFrqType: String
  cycleFrqNumber: String
  cycleFrqTimeType: String
  cycleFrqTimes: any[]
  isImmediate: String
  id: any
  test1: any
}

/** 初始化 **/
onMounted(() => {})
const getTips = () => {
  if (formData.value.cycleFrqType == '2') {
    return '小时'
  } else if (formData.value.cycleFrqType == '3') {
    return '天'
  } else if (formData.value.cycleFrqType == '6') {
    return '月'
  } else {
    return '年'
  }
}
const emit = defineEmits(['submit', 'reset', 'validated', 'update:modelValue'])

let formData = ref<FormData>({
  inspectName: '',
  validType: '',
  startTime: '',
  endTime: '',
  inspectUsers: '',
  submitType: '',
  inspectFrqType: '',
  cycleFrqType: '',
  cycleFrqNumber: '',
  cycleFrqTimeType: '',
  cycleFrqTimes: [],
  isImmediate: '',
  id: '',
  test1: false
})
const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules<FormData>>({
  inspectName: [{ required: true, message: '请输入', trigger: 'blur' }],
  inspectUsers: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  submitType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  inspectFrqType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  cycleFrqTimeType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ]
})

let dialogVisible = ref(false)
const handleClose = async (formEl) => {
  if (!formEl) return
  formEl.resetFields()
  dialogVisible.value = false
}
const getDateType = () => {
  let e = formData.value.cycleFrqType
  if (e == '2') {
    return 'datetime'
  } else if (e == '3') {
    return 'date'
  } else if (e == '6') {
    return 'date'
  } else if (e == '9') {
    return 'date'
  } else {
    return 'datetime'
  }
}
const setTitle = (e) => {
  e = formData.value.cycleFrqType
  if (e == 2 || e == 3) {
    return '定时生效'
  } else if (e == 6) {
    return '次月生效'
  } else if (e == 9) {
    return '次年生效'
  } else {
    return '定时生效'
  }
}
const getDescribe = () => {
  if (formData.value.cycleFrqType == '2') {
    return '“小时”单位周期按每小时段的00-59分计算；例，若设定的“1小时/1次”，则任务周期时间为“08:00-08:59”，若设定的为“2小时/1次”，则任务周期时间为“08:00-09:59”,以此类推；'
  } else if (formData.value.cycleFrqType == '3') {
    return (
      '“天”单位周期按自然天的起止时间计算；例，若设定的“1天/1次”，则任务周期时间为每天的“00:00-23:59”，若设定的为“2天/1次”，则\n' +
      '任务周期时间为“开始日期的00:00-第二天的23:59”，以此类推；'
    )
  } else if (formData.value.cycleFrqType == '6') {
    return (
      '“月”单位周期按每自然月份起止日期计算；例，若设定的“1月/1次”，则任务周期时间为每月的“1日的00:00-最后一天的23:59”，若设定的\n' +
      '为“2月/1次”，则任务周期时间为“开始日期月份1日的00:00-第二月份最后一天的23:59”，以此类推；'
    )
  } else {
    return '“年”单位周期按年的起止日期计算；即每年的1月1日00:00-12月31日23:59；'
  }
}
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const submitForm = async () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value?.validate(async (valid) => {
    if (valid) {
      loading.value = true
      // 请求分配任务接口
      try {
        let form = JSON.parse(JSON.stringify(formData.value))
        if (form != null) {
          if(form.cycleFrqTimes != null){
            form.cycleFrqTimes = form.cycleFrqTimes.join(',')
          }
        }
        if (form.inspectUsers != null) {
          form.inspectUsers = form.inspectUsers.toString()
        }
        form.id = formId
        await DangerRectApi.createAssignTask(form)
        message.success(t('common.createSuccess'))
        emit('submit', form) // 使用组件内的 ruleForm
        dialogVisible.value = false
      } finally {
        loading.value = false
      }
    }
  })
}

let userList = ref<UserApi.UserVO>()

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
  const data = await UserApi.getSimpleUserList(queryParams)
  userList.value = data
}
let loading = ref(false)
let formId = ''
const open = async (id) => {
  // 请求获取任务接口
  formId = id
  loading.value = true
  try {
    getUserLIst()
    formData.value = await DangerRectApi.getTaskById(id)
    if (formData.value == null) {
      formData.value = {
        test1: false
      }
    } else {
      if (formData.value != null) {
        formData.value.submitType = formData.value.submitType.toString()
        formData.value.inspectFrqType = formData.value.inspectFrqType.toString()
        formData.value.cycleFrqType = formData.value.cycleFrqType.toString()
        formData.value.cycleFrqTimeType = formData.value.cycleFrqTimeType.toString()
        formData.value.cycleFrqTimes = formData.value.cycleFrqTimes.split(',')
        formData.value.isImmediate = formData.value.isImmediate.toString()
        formData.value.validType = formData.value.validType.toString()
        if(formData.value.inspectUsers!= null){
          formData.value.inspectUsers.split(',').forEach((item) => {
            formData.value.inspectUsers.push(Number(item))
          })
        }
      }
    }
    dialogVisible.value = true
  } finally {
    loading.value = false
    dialogVisible.value = true
  }
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
