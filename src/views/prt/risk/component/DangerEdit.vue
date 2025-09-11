<template>
  <el-form
    ref="ruleFormRef"
    style="max-width: 600px"
    :model="formData"
    :rules="rules"
    label-width="auto"
    class="demo-formData"
    :size="formSize"
    status-icon
  >
    <el-form-item label="危险有害因素" prop="riskFactorsName">
      <el-input v-model="formData.riskFactorsName" placeholder="请输入危险有害因素" />
    </el-form-item>
    <el-form-item label="可能造成的事故类型" prop="accidentType">
      <el-select v-model="formData.accidentType" placeholder="请选择事故类型（可多选）" multiple>
        <el-option
          :label="item.label"
          :value="item.value"
          v-for="(item, key) in getIntDictOptions(DICT_TYPE.ACCIDENT_TYPE)"
          :key="key"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="管控措施类型" prop="controlType">
      <el-select v-model="formData.controlType">
        <el-option
          :label="item.label"
          :value="item.value"
          v-for="(item, key) in getIntDictOptions(DICT_TYPE.CONTROL_TYPE)"
          :key="key"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="管控措施" prop="controlMeasures">
      <el-input
        v-model="formData.controlMeasures"
        placeholder="请输入管控措施"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
    <el-form-item label="检查项目" prop="inspectItemName">
      <el-input
        v-model="formData.inspectItemName"
        placeholder="请输入检查项目"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
    <el-form-item label="检查标准" prop="inspectStandard">
      <el-input
        v-model="formData.inspectStandard"
        placeholder="请输入检查标准"
        type="textarea"
        :rows="3"
      />
    </el-form-item>
    <el-form-item>
      <el-button @click="resetForm()">取消</el-button>
      <el-button type="primary" @click="submitForm()"> 保存</el-button>
    </el-form-item>
  </el-form>
</template>
<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface FormData {
  inspectItemName: any
  controlType: any
  riskFactorsName: any
  accidentType: any
  controlMeasures: any
  inspectStandard: any
}

interface Props {
  initialData?: Partial<FormData>
  size?: ComponentSize
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({
    inspectItemName: '',
    controlType: '',
    riskFactorsName: '',
    accidentType: [],
    controlMeasures: '',
    inspectStandard: ''
  }),
  size: 'default'
})

const emit = defineEmits(['submit', 'reset'])

const formSize = ref<ComponentSize>(props.size)
const ruleFormRef = ref<FormInstance>()
const formData = reactive<FormData>({
  inspectItemName: props.initialData.inspectItemName || '',
  controlType: props.initialData.controlType || '',
  riskFactorsName: props.initialData.riskFactorsName || '',
  accidentType: props.initialData.accidentType || [],
  controlMeasures: props.initialData.controlMeasures || '',
  inspectStandard: props.initialData.inspectStandard || ''
})
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

const rules = reactive<FormRules<FormData>>({
  riskFactorsName: [{ required: true, message: '请输入', trigger: 'change' }],
  inspectItemName: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  controlType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  accidentType: [
    {
      required: true,
      message: '请选择',
      trigger: 'change'
    }
  ],
  controlMeasures: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  inspectStandard: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ]
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
