<template>
  <el-form ref="listenerFormRef" :model="localFlowNode" label-position="top" :rules="formRules">
<!--    <el-form-item label="表单类型" prop="taskFormType">
      <el-select v-model="localFlowNode.taskFormType" placeholder="请选择表单类型">
        <el-option :value="item.value" :label="item.label"  v-for="(item,index) in getIntDictOptions(DICT_TYPE.TASK_FORM_TYPE)" :key="index"/>
      </el-select>
    </el-form-item>-->
    <el-form-item label="表单类型" prop="taskFormType" class="mb-20px">
      <el-radio-group v-model="localFlowNode.taskFormType">
        <el-radio
          v-for="dict in getIntDictOptions(DICT_TYPE.TASK_FORM_TYPE)"
          :key="dict.index"
          :value="dict.value"
        >
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>
    <!--  业务表单  -->
    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.CUSTOM" label="表单路径类型" prop="taskFormPathType">
      <el-select v-model="localFlowNode.taskFormPathType" placeholder="请选择表单类型">
        <el-option :value="item.value" :label="item.label"  v-for="(item,index) in getIntDictOptions(DICT_TYPE.TASK_FORM_PATH_TYPE)" :key="index"/>
      </el-select>
    </el-form-item>
<!--    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.CUSTOM" label="表单路径类型" prop="taskFormPathType" class="mb-20px">
      <el-radio-group v-model="localFlowNode.taskFormPathType">
        <el-radio
          v-for="dict in getIntDictOptions(DICT_TYPE.TASK_FORM_PATH_TYPE)"
          :key="dict.index"
          :value="dict.value"
        >
          {{ dict.label }}
        </el-radio>
      </el-radio-group>
    </el-form-item>-->
    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.CUSTOM" label="企业端表单路径" prop="taskFormCustomPath">
      <el-input
        v-model="localFlowNode.taskFormCustomPath"
        placeholder="请输入企业端路径(例如 '@/views/workbenches/topBarPage/Component/detail/index.vue')"
      />
    </el-form-item>
    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.CUSTOM" label="移动端表单路径" prop="taskFormCustomAppPath">
      <el-input
        v-model="localFlowNode.taskFormCustomAppPath"
        placeholder="请输入移动端路径(/bpm/oa/leave/approve)"
      />
    </el-form-item>
    <!--  流程表单  -->
    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.LOWCODE" label="流程表单" prop="taskFormId">
<!--    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.LOWCODE" label="企业端流程表单" prop="taskFormId">-->
      <el-select v-model="localFlowNode.taskFormId" clearable style="width: 100%">
        <el-option v-for="form in formList" :key="form.id" :label="form.name" :value="form.id" />
      </el-select>
    </el-form-item>
<!--    <el-form-item v-if="localFlowNode.taskFormType === BpmTaskFormType.LOWCODE" label="移动端流程表单" prop="appTaskFormId">
      <el-select v-model="localFlowNode.appTaskFormId" clearable style="width: 100%">
        <el-option v-for="form in formList" :key="form.id" :label="form.name" :value="form.id" />
      </el-select>
    </el-form-item>-->

    <!-- 表单预览 -->
    <div
      v-if="localFlowNode.taskFormType === BpmTaskFormType.LOWCODE && localFlowNode.taskFormId && formPreview.rule.length > 0"
      class="mt-20px"
    >
      <div class="flex items-center mb-15px">
        <div class="h-15px w-4px bg-[#1890ff] mr-10px"></div>
        <span class="text-15px font-bold">企业端表单预览</span>
      </div>
      <form-create
        v-model="formPreview.formData"
        :rule="formPreview.rule"
        :option="formPreview.option"
      />
    </div>
<!--    <div
      v-if="localFlowNode.taskFormType === BpmTaskFormType.LOWCODE && localFlowNode.appTaskFormId && appFormPreview.rule.length > 0"
      class="mt-20px"
    >
      <div class="flex items-center mb-15px">
        <div class="h-15px w-4px bg-[#1890ff] mr-10px"></div>
        <span class="text-15px font-bold">移动端表单预览</span>
      </div>
      <form-create
        v-model="appFormPreview.formData"
        :rule="appFormPreview.rule"
        :option="appFormPreview.option"
      />
    </div>-->
  </el-form>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { ref, computed } from 'vue'
import type { ElForm } from 'element-plus'
import {BpmTaskFormPathType, BpmTaskFormType} from "@/utils/constants";
import * as FormApi from "@/api/bpm/form";
import {setConfAndFields2} from "@/utils/formCreate";

// 数据列表
const formList = ref([])

// 2. 定义 Props 和 Emits
const props = defineProps({
  flowNode: {
    type: Object as () => SimpleFlowNode,
    required: false,
    default: () => ({})
  },
  formFieldOptions: {
    type: Object as () => FormFieldOptions,
    required: true
  },
  /*formList: {
    type: Array,
    required: true
  }*/
})

const emit = defineEmits<{
  (e: 'update:flowNode', value: SimpleFlowNode): void
}>()

// 3. 计算属性（双向绑定）
const localFlowNode = computed({
  get: () => props.flowNode,
  set: (newValue: SimpleFlowNode) => emit('update:flowNode', newValue)
})

// 4. 表单引用和验证
const listenerFormRef = ref<InstanceType<typeof ElForm>>()

const validate = async (): Promise<boolean> => {
  if (!listenerFormRef.value) return false
  try {
    await listenerFormRef.value.validate()
    return true
  } catch {
    return false
  }
}

// 表单预览数据
const formPreview = ref({
  formData: {},
  rule: [],
  option: {
    submitBtn: false,
    resetBtn: false,
    formData: {}
  }
})
// const appFormPreview = ref({
//   formData: {},
//   rule: [],
//   option: {
//     submitBtn: false,
//     resetBtn: false,
//     formData: {}
//   }
// })

const initData = async () => {
  localFlowNode.value.taskFormType = BpmTaskFormType.CUSTOM // 默认 业务表单
  localFlowNode.value.taskFormPathType = BpmTaskFormPathType.VIEW
  // 获取表单列表
  formList.value = await FormApi.getFormSimpleList()
}

// 监听表单ID变化，加载表单数据
watch(
  () => localFlowNode.value.taskFormId,
  async (newFormId) => {
    if (newFormId && localFlowNode.value.taskFormType === BpmTaskFormType.LOWCODE) {
      const data = await FormApi.getForm(newFormId)
      setConfAndFields2(formPreview.value, data.conf, data.fields)
      // 设置只读
      formPreview.value.rule.forEach((item: any) => {
        item.props = { ...item.props, disabled: true }
      })
    } else {
      formPreview.value.rule = []
    }
  },
  { immediate: true }
)

// // 监听表单ID变化，加载表单数据
// watch(
//   () => localFlowNode.value.appTaskFormId,
//   async (appTaskFormId) => {
//     if (appTaskFormId && localFlowNode.value.taskFormType === BpmTaskFormType.LOWCODE) {
//       const data = await FormApi.getForm(appTaskFormId)
//       setConfAndFields2(appFormPreview.value, data.conf, data.fields)
//       // 设置只读
//       appFormPreview.value.rule.forEach((item: any) => {
//         item.props = { ...item.props, disabled: true }
//       })
//     } else {
//       appFormPreview.value.rule = []
//     }
//   },
//   { immediate: true }
// )

// 表单校验规则
const formRules = reactive({
  taskFormType: [{ required: true, message: '请选择表单类型', trigger: 'change' }],
  taskFormPathType: [{ required: true, message: '请选择表单路径类型', trigger: 'change' }],
  taskFormCustomPath: [{ required: true, message: '请输入企业端表单路径', trigger: 'change' }],
  taskFormCustomAppPath: [{ required: true, message: '请输入移动端表单路径', trigger: 'change' }],
  taskFormId: [{ required: true, message: '流程表单不能为空', trigger: 'blur' }],
  // taskFormId: [{ required: true, message: '企业端流程表单不能为空', trigger: 'blur' }],
  // appTaskFormId: [{ required: true, message: '移动端流程表单不能为空', trigger: 'blur' }],
})
// 1. 定义类型
interface TaskFormConfig {
  taskFormType?: string
  taskFormPathType?: string
  taskFormCustomPath?: string
  taskFormCustomAppPath?: string
  taskFormId?: string
  appTaskFormId?: string
}

interface SimpleFlowNode {
  // 其他可能存在的字段...
  taskFormConfig?: TaskFormConfig
}

interface FormFieldOptions {
  // 根据实际需求定义表单选项的类型
  [key: string]: any
}

/** 初始化 */
onMounted(async () => {
  await initData()
})

defineExpose({ validate })
</script>
