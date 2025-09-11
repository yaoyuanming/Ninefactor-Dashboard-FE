<template>
  <el-form
    :label-position="labelPosition"
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="formData"
    :rules="rules"
    label-width="auto"
    class="demo-formData"
    :size="formSize"
    status-icon
  >
    <el-form-item label="检查清单名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入检查清单名称" />
    </el-form-item>
    <el-form-item label="" prop="region">
      <template #label> 检查人员 <span style="float: right">同管控责任人</span></template>
      <el-select v-model="formData.region" placeholder="请选择">
        <el-option label="Zone one" value="shanghai" />
        <el-option label="Zone two" value="beijing" />
      </el-select>
    </el-form-item>
    <el-form-item label="检查任务提交方式" prop="location1">
      <el-radio-group v-model="formData.location1" size="large">
        <el-radio-button label="任意一人提交即可" value="1" />
        <el-radio-button label="全部人员提交" value="2" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="检查频次">
      <el-radio-group v-model="formData.location1" size="large">
        <el-radio-button label="循环检查" value="1" />
        <el-radio-button label="一次性检查" value="2" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="">
      <el-radio-group v-model="formData.location1" size="large">
        <el-radio-button label="按小时" value="1" />
        <el-radio-button label="按天" value="2" />
        <el-radio-button label="按月" value="3" />
        <el-radio-button label="按年" value="4" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="">
      <el-input v-model="formData.date1" placeholder="请输入检查时间间隔">
        <template #append>小时/1次</template>
      </el-input>
    </el-form-item>
    <el-form-item label="检查任务分配时间设置" prop="count">
      <el-radio-group v-model="formData.count" size="large">
        <el-radio-button label="自定义" value="1" />
        <el-radio-button label="工作日/节假日" value="2" />
      </el-radio-group>
    </el-form-item>
    <el-form-item label="">
      <el-checkbox-group v-model="formData.type">
        <el-checkbox value="1" name="type"> 周一</el-checkbox>
        <el-checkbox value="2" name="type"> 周二</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="">
      <el-checkbox-group v-model="formData.type">
        <el-checkbox value="1" name="type"> 工作日</el-checkbox>
        <el-checkbox value="2" name="type"> 周末及节假日</el-checkbox>
      </el-checkbox-group>
    </el-form-item>
    <el-form-item label="检查任务时间设置" required>
      <!--      <div>生效时间</div>-->
      <div>
        <el-radio-group v-model="formData.location1" size="large">
          <el-radio label="立即生效" value="1" />
          <el-radio label="定时生效" value="2">
            自定义
            <el-date-picker
              v-model="formData.date2"
              type="datetime"
              placeholder="选择日期"
              style="width: 200px"
            />
          </el-radio>
        </el-radio-group>
      </div>
      <div>结束时间</div>
      <el-radio-group v-model="formData.location1" size="large">
        <el-radio label="指定时间" value="1" />
        <el-radio label="长期有效" value="2" />
      </el-radio-group>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'

const labelPosition = ref<FormProps['labelPosition']>('top')

interface FormData {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  location1: string
  type: string[]
  resource: string
  desc: string
}

interface Props {
  initialData?: Partial<FormData>
  size?: ComponentSize
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    name: '',
    region: '',
    count: '',
    date1: '',
    date2: '',
    delivery: false,
    location: '',
    location1: '',
    type: [],
    resource: '',
    desc: ''
  }),
  size: 'default'
})

const emit = defineEmits(['submit', 'reset', 'validated'])

const formSize = ref<ComponentSize>(props.size)
const ruleFormRef = ref<FormInstance>()
const formData = reactive<FormData>({
  name: props.initialData.name || '',
  region: props.initialData.region || '',
  count: props.initialData.count || '',
  date1: props.initialData.date1 || '',
  date2: props.initialData.date2 || '',
  delivery: props.initialData.delivery || false,
  location: props.initialData.location || '',
  location1: props.initialData.location1 || '',
  type: props.initialData.type || [],
  resource: props.initialData.resource || '',
  desc: props.initialData.desc || ''
})

const locationOptions = ['Home', 'Company', 'School']

const rules = reactive<FormRules<FormData>>({
  name: [
    { required: true, message: 'Please input Activity name', trigger: 'blur' },
    { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' }
  ],
  region: [
    {
      required: true,
      message: 'Please select Activity zone',
      trigger: 'change'
    }
  ],
  count: [
    {
      required: true,
      message: 'Please select Activity count',
      trigger: 'change'
    }
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a date',
      trigger: 'change'
    }
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: 'Please pick a time',
      trigger: 'change'
    }
  ],
  location: [
    {
      required: true,
      message: 'Please select a location',
      trigger: 'change'
    }
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: 'Please select at least one activity type',
      trigger: 'change'
    }
  ],
  resource: [
    {
      required: true,
      message: 'Please select activity resource',
      trigger: 'change'
    }
  ],
  desc: [{ required: true, message: 'Please input activity form', trigger: 'blur' }]
})

const options = Array.from({ length: 10000 }).map((_, idx) => ({
  value: `${idx + 1}`,
  label: `${idx + 1}`
}))

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


const resetForm = () => {
  if (!ruleFormRef.value) return
  ruleFormRef.value.resetFields()
  emit('reset')
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
</style>
