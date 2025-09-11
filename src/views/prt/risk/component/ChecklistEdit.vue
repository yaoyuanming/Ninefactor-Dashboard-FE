<template>
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
            ><span style="color: var(--el-color-danger); padding-right: 5px">*</span>检查人员</span
          >
          <span class="right-align"
            ><el-checkbox v-model="formData.test1" @change="setInspectUsers()" />同管控责任人</span
          >
        </div>
      </div>
      <el-form-item label="" prop="inspectUsers">
        <el-select v-model="formData.inspectUsers" placeholder="请选择" multiple>
          <el-option
            :label="item.nickname"
            :value="item.id"
            v-for="(item, index) in userlist"
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
      <div v-if="formData.inspectFrqType == 2">
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
          <div v-if="formData.cycleFrqType == 2 || formData.cycleFrqType == 3">
            <el-form-item label="检查任务分配时间设置" prop="cycleFrqTimeType">
              <el-radio-group v-model="formData.cycleFrqTimeType" size="large">
                <el-radio-button label="自定义" value="1" />
                <el-radio-button label="工作日/节假日" value="2" />
              </el-radio-group>
            </el-form-item>
            <el-form-item label="" v-if="formData.cycleFrqTimeType == 1" prop="cycleFrqTimes">
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
            <el-form-item label="" v-if="formData.cycleFrqTimeType == 2" prop="cycleFrqTimes">
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
<!--            1：长期 5：自定义日期-->
            <el-radio-group v-model="formData.validType" size="large">
              <el-radio label="指定时间" value="5">
                指定时间
                <el-date-picker
                  value-format="x"
                  :disabled="formData.validType != '5'"
                  v-model="formData.endTime"
                  :type="getDateType()"
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
      <div v-if="formData.inspectFrqType == 1">
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
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'

const labelPosition = ref<FormProps['labelPosition']>('top')

interface FormData {
  inspectName: String
  validType: String
  startTime: String
  endTime: String
  inspectUsers: String
  submitType: String
  inspectFrqType: String
  cycleFrqType: String
  cycleFrqNumber: String
  cycleFrqTimeType: String
  cycleFrqTimes: any[]
  isImmediate: String
  id: any
}

interface Props {
  modelValue?: Partial<FormData>
  userlist?: any[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
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
    isImmediate: ''
  })
})
const setTitle = (e) => {
  e = formData.cycleFrqType
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
  if (formData.cycleFrqType == '2') {
    return '“小时”单位周期按每小时段的00-59分计算；例，若设定的“1小时/1次”，则任务周期时间为“08:00-08:59”，若设定的为“2小时/1次”，则任务周期时间为“08:00-09:59”,以此类推；'
  } else if (formData.cycleFrqType == '3') {
    return (
      '“天”单位周期按自然天的起止时间计算；例，若设定的“1天/1次”，则任务周期时间为每天的“00:00-23:59”，若设定的为“2天/1次”，则\n' +
      '任务周期时间为“开始日期的00:00-第二天的23:59”，以此类推；'
    )
  } else if (formData.cycleFrqType == '6') {
    return (
      '“月”单位周期按每自然月份起止日期计算；例，若设定的“1月/1次”，则任务周期时间为每月的“1日的00:00-最后一天的23:59”，若设定的\n' +
      '为“2月/1次”，则任务周期时间为“开始日期月份1日的00:00-第二月份最后一天的23:59”，以此类推；'
    )
  } else {
    return '“年”单位周期按年的起止日期计算；即每年的1月1日00:00-12月31日23:59；'
  }
}
const getTips = () => {
  if (formData.cycleFrqType == '2') {
    return '小时'
  } else if (formData.cycleFrqType == '3') {
    return '天'
  } else if (formData.cycleFrqType == '6') {
    return '月'
  } else {
    return '年'
  }
}
const getDateType = () => {
  let e = formData.cycleFrqType
  if (e == 2) {
    return 'datetime'
  } else if (e == 3) {
    return 'date'
  } else if (e == 6) {
    return 'date'
  } else if (e == 9) {
    return 'date'
  } else {
    return 'datetime'
  }
}
let userlist = ref(props.userlist)

const emit = defineEmits(['submit', 'reset', 'validated', 'update:modelValue'])

// 使用计算属性或 watch 来处理数据同步
const formData = reactive<FormData>({
  inspectName: props.modelValue.inspectName || '',
  id: props.modelValue.id || '',
  validType: props.modelValue.validType || '',
  startTime: props.modelValue.startTime || '',
  endTime: props.modelValue.endTime || '',
  inspectUsers: props.modelValue.inspectUsers || '',
  submitType: props.modelValue.submitType || '',
  inspectFrqType: props.modelValue.inspectFrqType || '', // 默认循环检查
  cycleFrqType: props.modelValue.cycleFrqType || '',
  cycleFrqNumber: props.modelValue.cycleFrqNumber || '',
  cycleFrqTimeType: props.modelValue.cycleFrqTimeType || '',
  cycleFrqTimes: props.modelValue.cycleFrqTimes || [],
  isImmediate: props.modelValue.isImmediate , // 默认立即生效
  inspectUsers1: props.modelValue.inspectUsers1 || '', // 默认立即生效
  respUserName1: props.modelValue.respUserName1 || '' // 默认立即生效
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
  ],
})

const submitForm = async (): Promise<{
  state: boolean
  data: FormData | null
}> => {
  if (!ruleFormRef.value) return { state: false, data: null }
  return new Promise((resolve) => {
    ruleFormRef.value?.validate((valid) => {
      if (valid) {
        emit('submit', formData) // 使用组件内的 ruleForm
        resolve({
          state: true,
          data: formData
        })
      } else {
        resolve({
          state: false,
          data: null
        })
      }
    })
  })
}

// 当 formData 变化时触发更新
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)
const setInspectUsers = () => {
  console.log('formData.test1', formData.test1)
  if (formData.test1) {
    console.log('formData.inspectUsers', formData)
    formData.inspectUsers = formData.inspectUsers1
    formData.respUserName = formData.respUserName1
  }
}
// 暴露方法给父组件
defineExpose({
  validate: submitForm
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
