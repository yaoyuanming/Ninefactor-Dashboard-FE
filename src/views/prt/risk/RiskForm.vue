<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="部门ID" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门ID" />
      </el-form-item>
      <el-form-item label="风险单元id" prop="riskUnitId">
        <el-input v-model="formData.riskUnitId" placeholder="请输入风险单元id" />
      </el-form-item>
      <el-form-item label="风险点名称" prop="riskName">
        <el-input v-model="formData.riskName" placeholder="请输入风险点名称" />
      </el-form-item>
      <el-form-item
        label="固有风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）"
        prop="inherentRisk"
      >
        <el-input
          v-model="formData.inherentRisk"
          placeholder="请输入固有风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）"
        />
      </el-form-item>
      <el-form-item
        label="现实风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）"
        prop="existingRisk"
      >
        <el-input
          v-model="formData.existingRisk"
          placeholder="请输入现实风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）"
        />
      </el-form-item>
      <el-form-item
        label="风险点类型*（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）"
        prop="riskType"
      >
        <el-select
          v-model="formData.riskType"
          placeholder="请选择风险点类型*（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="是否启用*（0：停用 1：在用）" prop="isEnable">
        <el-input v-model="formData.isEnable" placeholder="请输入是否启用*（0：停用 1：在用）" />
      </el-form-item>
      <el-form-item label="管控有效性*（0：无效，1:有效）" prop="controlEffectiveness">
        <el-input
          v-model="formData.controlEffectiveness"
          placeholder="请输入管控有效性*（0：无效，1:有效）"
        />
      </el-form-item>
      <el-form-item label="管控层级*（默认 2：单位 3：部门 4：岗位）也可自定义" prop="controlLevel">
        <el-input
          v-model="formData.controlLevel"
          placeholder="请输入管控层级*（默认 2：单位 3：部门 4：岗位）也可自定义"
        />
      </el-form-item>
      <el-form-item label="责任部门id" prop="respDeptId">
        <el-input v-model="formData.respDeptId" placeholder="请输入责任部门id" />
      </el-form-item>
      <el-form-item label="责任部门名称" prop="respDeptName">
        <el-input v-model="formData.respDeptName" placeholder="请输入责任部门名称" />
      </el-form-item>
      <el-form-item label="管控负责人id" prop="respUserId">
        <el-input v-model="formData.respUserId" placeholder="请输入管控负责人id" />
      </el-form-item>
      <el-form-item label="管控负责人姓名" prop="respUserName">
        <el-input v-model="formData.respUserName" placeholder="请输入管控负责人姓名" />
      </el-form-item>
      <el-form-item label="监管人员ID组（多条采用英文逗号隔开）（用户表ID）" prop="supervisorUser">
        <el-input
          v-model="formData.supervisorUser"
          placeholder="请输入监管人员ID组（多条采用英文逗号隔开）（用户表ID）"
        />
      </el-form-item>
      <el-form-item label="验收人员ID组（多条采用英文逗号隔开）（用户表ID）" prop="inspectorUser">
        <el-input
          v-model="formData.inspectorUser"
          placeholder="请输入验收人员ID组（多条采用英文逗号隔开）（用户表ID）"
        />
      </el-form-item>
      <el-form-item label="数据来源*（1：手动 2：风险数据库）" prop="dataSources">
        <el-input
          v-model="formData.dataSources"
          placeholder="请输入数据来源*（1：手动 2：风险数据库）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { RiskApi, RiskVO } from '@/api/prt/risk'

/** 风险点 表单 */
defineOptions({ name: 'RiskForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  deptId: undefined,
  riskUnitId: undefined,
  riskName: undefined,
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: undefined,
  isEnable: undefined,
  controlEffectiveness: undefined,
  controlLevel: undefined,
  respDeptId: undefined,
  respDeptName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  inspectorUser: undefined,
  dataSources: undefined
})
const formRules = reactive({})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await RiskApi.getRisk(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as RiskVO
    if (formType.value === 'create') {
      await RiskApi.createRisk(data)
      message.success(t('common.createSuccess'))
    } else {
      await RiskApi.updateRisk(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    deptId: undefined,
    riskUnitId: undefined,
    riskName: undefined,
    inherentRisk: undefined,
    existingRisk: undefined,
    riskType: undefined,
    isEnable: undefined,
    controlEffectiveness: undefined,
    controlLevel: undefined,
    respDeptId: undefined,
    respDeptName: undefined,
    respUserId: undefined,
    respUserName: undefined,
    supervisorUser: undefined,
    inspectorUser: undefined,
    dataSources: undefined
  }
  formRef.value?.resetFields()
}
</script>
