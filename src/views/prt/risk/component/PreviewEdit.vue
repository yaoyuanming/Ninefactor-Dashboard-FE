<template>
  <div>
    <el-form
      label-position="top"
      ref="ruleFormRef"
      style="max-width: 600px"
      :model="formData"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      status-icon
    >
      <el-form-item label="风险点名称" prop="riskName">
        <el-input v-model="formData.riskName" placeholder="" readonly disabled />
      </el-form-item>
      <el-form-item label="风险等级" prop="riskLevelLabel">
        <el-input v-model="riskLevelLabel" placeholder="" readonly disabled />
      </el-form-item>
      <el-form-item label="责任岗位" prop="respPostId">
        <el-select v-model="formData.respPostId" placeholder="请选择" @change="setRespPostName">
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="(item, index) in postlist"
            :key="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="责任人" prop="respUserId">
        <el-select v-model="formData.respUserId" placeholder="请选择" @change="setRespUserName" multiple>
          <el-option
            :label="item.nickname"
            :value="item.id"
            v-for="(item, index) in userlist"
            :key="index"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="责任人联系电话" prop="respUserPhone">
        <el-input v-model="formData.respUserPhone" placeholder="" />
      </el-form-item>
      <el-form-item label="公安电话" prop="publicPhone">
        <el-input v-model="formData.publicPhone" placeholder="" />
      </el-form-item>
      <el-form-item label="消防救援" prop="fireRescue">
        <el-input v-model="formData.fireRescue" placeholder="" />
      </el-form-item>
      <el-form-item label="医疗救护" prop="medical">
        <el-input v-model="formData.medical" placeholder="" />
      </el-form-item>
      <el-form-item label="应急救援电话" prop="rescuePhone">
        <el-input v-model="formData.rescuePhone" placeholder="" />
      </el-form-item>
      <el-form-item label="重要提示" prop="importantNote">
        <el-input v-model="formData.importantNote" placeholder="" />
      </el-form-item>
      <el-form-item label="主要事故诱因">
        <el-input
          v-model="formData.accidentTrigger"
          placeholder=""
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="可能造成的事故类型">
        <el-input
          v-model="formData.accidentType"
          placeholder=""
          type="textarea"
          :rows="5"
          disabled
        />
      </el-form-item>
      <el-form-item label="风险控制措施及应急处置措施">
        <el-input v-model="formData.measure" placeholder="" type="textarea" :rows="5" disabled />
      </el-form-item>
      <el-form-item label="安全警示标识" required />
      <el-form-item label="警告" required>
        <el-checkbox-group v-model="formData.warnSigns">
          <el-checkbox
            :label="item.path"
            :value="item.path"
            class="image-checkbox"
            v-for="(item, index) in warnsignWarnList"
            :key="index"
          >
            <el-image :src="item.url" class="checkbox-image" />
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="禁止" required>
        <el-checkbox-group v-model="formData.prohibitSigns">
          <el-checkbox
            :label="item.path"
            :value="item.path"
            class="image-checkbox"
            v-for="(item, index) in warnsignForbidList"
            :key="index"
          >
            <el-image :src="item.url" class="checkbox-image" />
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="指令" required>
        <el-checkbox-group v-model="formData.instructionSigns">
          <el-checkbox
            :value="item.path"
            :label="item.path"
            class="image-checkbox"
            v-for="(item, index) in warnsignInstructList"
            :key="index"
          >
            <el-image :src="item.url" class="checkbox-image" />
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'
import { DICT_TYPE, getIntDictOptions, getDictLabel } from '@/utils/dict'

interface FormData {
  riskName: string
  respPostName: string
  respUserName: string
  riskLevel: number
  accidentTrigger: string
  accidentType: string
  measure: boolean
  publicPhone: string
  fireRescue: string
  medical: string
  rescuePhone: string
  respPostId: string
  respUserId: string
  importantNote: string
  respUserPhone: string
  checkList: any[]
  instructionSigns: []
}

const rules = reactive<FormRules<FormData>>({
  riskName: [{ required: true, message: '请输入', trigger: 'change' }],
  respPostName: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  respUserName: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  riskLevel: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  accidentTrigger: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  accidentType: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  measure: [
    {
      type: 'array',
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  publicPhone: [
    {
      required: true,
      message: '请输入',
      trigger: 'change'
    }
  ],
  fireRescue: [{ required: true, message: '请输入', trigger: 'blur' }],
  medical: [{ required: true, message: '请输入', trigger: 'blur' }],
  rescuePhone: [{ required: true, message: '请输入', trigger: 'blur' }],
  respPostId: [{ required: true, message: '请输入', trigger: 'blur' }],
  respUserId: [{ required: true, message: '请输入', trigger: 'blur' }],
  importantNote: [{ required: true, message: '请输入', trigger: 'blur' }],
  respUserPhone: [{ required: true, message: '请输入', trigger: 'blur' }],
  checkList: [{ required: true, message: '请输入', trigger: 'blur' }]
})

interface Props {
  modelValue?: Partial<FormData>
  postlist?: []
  userlist?: []
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})
const riskLevelLabel = computed(() => {
  return getDictLabel(DICT_TYPE.RISKLEVEL, formData.riskLevel)
})
const emit = defineEmits(['submit', 'reset', 'update:modelValue'])
// 使用计算属性或 watch 来处理数据同步
const formData = reactive<FormData>({
  ...props.modelValue
})
// 当 formData 变化时触发更新
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)
const setRespPostName = (val) => {
  postlist.value.forEach((i) => {
    if (i.id == val) {
      formData.respPostName = i.name
    }
  })
}
const setRespUserName = (val) => {
  userlist.value.forEach((i) => {
    if (i.id == val) {
      formData.respUserName = i.nickname
    }
  })
}
const ruleFormRef = ref<FormInstance>()
let postlist = ref(props.postlist)
let userlist = ref(props.userlist)

const submitForm = async (): Promise<{
  state: boolean
  data: FormData | null
}> => {
  if (!ruleFormRef.value) return { state: false, data: null }
  return new Promise((resolve) => {
    ruleFormRef.value?.validate((valid) => {
      if (valid) {
        console.log('formData:', formData)
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
import * as FileApi from '@/api/infra/file'

const warnsignWarnList = ref([]) //警告 warnsign_warn
const warnsignForbidList = ref([]) //禁止 warnsign_forbid
const warnsignInstructList = ref([]) //指令 warnsign_instruct
const getImageList = async () => {
  warnsignWarnList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_warn'
  })
  warnsignForbidList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_forbid'
  })
  warnsignInstructList.value = await FileApi.getFileList({
    bizType: 'infra_file_biz_warnsign',
    bizTypeSec: 'warnsign_instruct'
  })
}
/** 初始化 */
onMounted(async () => {
  await getImageList()
})
// 暴露方法给父组件
defineExpose({
  validate: submitForm
})
</script>

<style scoped>
.demo-formData {
  margin: 0 auto;
}

.image-checkbox {
  position: relative;
  display: inline-block;
  margin-right: 20px;
  height: auto !important; /* 覆盖默认高度 */
  padding-left: 0 !important; /* 移除默认左边距 */
}

/* 图片样式 */
.checkbox-image {
  width: 100px;
  height: 100px;
  display: block;
  border: 1px solid #eee;
  border-radius: 4px;
}

/* 将默认复选框移到图片右上角 */
.image-checkbox :deep(.el-checkbox__input) {
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 1;
}

/* 复选框选中样式 */
.image-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
