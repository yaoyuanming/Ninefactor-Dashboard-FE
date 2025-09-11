<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="部门ID（企业ID）" prop="deptId">
        <el-input v-model="formData.deptId" placeholder="请输入部门ID（企业ID）" />
      </el-form-item>
      <el-form-item label="检查记录编号（检查记录信息）" prop="inspectRecordCode">
        <el-input v-model="formData.inspectRecordCode" placeholder="请输入检查记录编号（检查记录信息）" />
      </el-form-item>
      <el-form-item label="检查状态*（1：待检查 5：已检查 15：已作废）（检查记录信息）" prop="inspectStatus">
        <el-radio-group v-model="formData.inspectStatus">
          <el-radio value="1">请选择字典生成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="检查结果*（1：正常 10：异常 15：逾期未检 ）（检查记录信息）" prop="inspectResult">
        <el-input v-model="formData.inspectResult" placeholder="请输入检查结果*（1：正常 10：异常 15：逾期未检 ）（检查记录信息）" />
      </el-form-item>
      <el-form-item label="本次有效检查开始时间（检查记录信息）" prop="validStartTime">
        <el-date-picker
          v-model="formData.validStartTime"
          type="date"
          value-format="x"
          placeholder="选择本次有效检查开始时间（检查记录信息）"
        />
      </el-form-item>
      <el-form-item label="本次有效检查结束时间（检查记录信息）" prop="validEndTime">
        <el-date-picker
          v-model="formData.validEndTime"
          type="date"
          value-format="x"
          placeholder="选择本次有效检查结束时间（检查记录信息）"
        />
      </el-form-item>
      <el-form-item label="检查任务ID（检查任务表冗余字段）" prop="inspectTaskId">
        <el-input v-model="formData.inspectTaskId" placeholder="请输入检查任务ID（检查任务表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查类型*（5：按人员检查 10：按岗位检查）（检查任务表冗余字段）" prop="inspectType">
        <el-select v-model="formData.inspectType" placeholder="请选择检查类型*（5：按人员检查 10：按岗位检查）（检查任务表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查人员ID/岗位ID（多条采用英文逗号隔开）（检查任务表冗余字段）" prop="inspectUsers">
        <el-input v-model="formData.inspectUsers" placeholder="请输入检查人员ID/岗位ID（多条采用英文逗号隔开）（检查任务表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查任务提交方式*（1：全部人员提交 5：仅需其中一人提交）（检查任务表冗余字段）" prop="submitType">
        <el-select v-model="formData.submitType" placeholder="请选择检查任务提交方式*（1：全部人员提交 5：仅需其中一人提交）（检查任务表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查频次*（1：一次性 2：循环检查）（检查任务表冗余字段）" prop="inspectFrqType">
        <el-select v-model="formData.inspectFrqType" placeholder="请选择检查频次*（1：一次性 2：循环检查）（检查任务表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="循环频次单位*（2：按小时 3：按天 6：按月 9：按年）（检查任务表冗余字段）" prop="cycleFrqType">
        <el-select v-model="formData.cycleFrqType" placeholder="请选择循环频次单位*（2：按小时 3：按天 6：按月 9：按年）（检查任务表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="循环频次（说明：一、'循环频次单位'为'按小时'，则逾期需根据前一次检查时间进行时间间隔判断（如前一次检查时间为07:01，则本次检查逾期时间为08:01）；二、'循环频次单位'非'按小时'，则逾期根据对应时间结束点判断（如'1天/1次'，则每次检查逾期时间为每日0点））（检查任务表冗余字段）" prop="cycleFrqNumber">
        <el-input v-model="formData.cycleFrqNumber" placeholder="请输入循环频次（说明：一、'循环频次单位'为'按小时'，则逾期需根据前一次检查时间进行时间间隔判断（如前一次检查时间为07:01，则本次检查逾期时间为08:01）；二、'循环频次单位'非'按小时'，则逾期根据对应时间结束点判断（如'1天/1次'，则每次检查逾期时间为每日0点））（检查任务表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查任务时间分配类型*（1：自定义 2：工作日/节假日）" prop="cycleFrqTimeType">
        <el-select v-model="formData.cycleFrqTimeType" placeholder="请选择检查任务时间分配类型*（1：自定义 2：工作日/节假日）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查任务时间分配*（1：周一...8：工作日 9：周末及节假日）（英文逗号隔开）" prop="cycleFrqTimes">
        <el-input v-model="formData.cycleFrqTimes" placeholder="请输入检查任务时间分配*（1：周一...8：工作日 9：周末及节假日）（英文逗号隔开）" />
      </el-form-item>
      <el-form-item label="检查单ID（检查单表冗余字段）" prop="inspectId">
        <el-input v-model="formData.inspectId" placeholder="请输入检查单ID（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查单名称（检查单表冗余字段）" prop="inspectName">
        <el-input v-model="formData.inspectName" placeholder="请输入检查单名称（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查单编号（检查单表冗余字段）" prop="inspectCode">
        <el-input v-model="formData.inspectCode" placeholder="请输入检查单编号（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查单类别*（1：企业日常检查单 5：企业专项检查单 8：政府专项检查单）（检查单表冗余字段）" prop="inspectListCat">
        <el-input v-model="formData.inspectListCat" placeholder="请输入检查单类别*（1：企业日常检查单 5：企业专项检查单 8：政府专项检查单）（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查内容*（1：按项目 2：按风险点）（检查单表冗余字段）" prop="inspectItemType">
        <el-select v-model="formData.inspectItemType" placeholder="请选择检查内容*（1：按项目 2：按风险点）（检查单表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查目标（检查单表冗余字段）" prop="inspectTarget">
        <el-input v-model="formData.inspectTarget" placeholder="请输入检查目标（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="政府专项检查单类型*（1：行业领域 2：专项检查 3：重大隐患 4：主体责任）（检查单表冗余字段）" prop="govInspectListType">
        <el-select v-model="formData.govInspectListType" placeholder="请选择政府专项检查单类型*（1：行业领域 2：专项检查 3：重大隐患 4：主体责任）（检查单表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="上传部门名称（行政部门）（'政府专项检查单'时才有值）（检查单表冗余字段）" prop="govAgencyName">
        <el-input v-model="formData.govAgencyName" placeholder="请输入上传部门名称（行政部门）（'政府专项检查单'时才有值）（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="上传部门编号（'政府专项检查单'时才有值）（检查单表冗余字段）" prop="govAgencyCode">
        <el-input v-model="formData.govAgencyCode" placeholder="请输入上传部门编号（'政府专项检查单'时才有值）（检查单表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查单有效周期*（1：长期 5：自定义日期）（检查单表冗余字段）" prop="validType">
        <el-select v-model="formData.validType" placeholder="请选择检查单有效周期*（1：长期 5：自定义日期）（检查单表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="检查单有效开始时间（检查单表冗余字段）" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="date"
          value-format="x"
          placeholder="选择检查单有效开始时间（检查单表冗余字段）"
        />
      </el-form-item>
      <el-form-item label="检查单有效结束时间（检查单表冗余字段）" prop="endTime">
        <el-date-picker
          v-model="formData.endTime"
          type="date"
          value-format="x"
          placeholder="选择检查单有效结束时间（检查单表冗余字段）"
        />
      </el-form-item>
      <el-form-item label="风险点ID（风险点表冗余字段）" prop="riskId">
        <el-input v-model="formData.riskId" placeholder="请输入风险点ID（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="风险点名称（风险点表冗余字段）" prop="riskName">
        <el-input v-model="formData.riskName" placeholder="请输入风险点名称（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="固有风险*（风险点表冗余字段）" prop="inherentRisk">
        <el-input v-model="formData.inherentRisk" placeholder="请输入固有风险*（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="现实风险*（风险点表冗余字段）" prop="existingRisk">
        <el-input v-model="formData.existingRisk" placeholder="请输入现实风险*（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="风险点类型*（风险点表冗余字段）（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）（风险点表冗余字段）" prop="riskType">
        <el-select v-model="formData.riskType" placeholder="请选择风险点类型*（风险点表冗余字段）（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）（风险点表冗余字段）">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="管控层级*（2：单位 3：部门 4：岗位）（风险点表冗余字段）" prop="controlLevel">
        <el-input v-model="formData.controlLevel" placeholder="请输入管控层级*（2：单位 3：部门 4：岗位）（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="责任部门id（风险点表冗余字段）" prop="respDeptId">
        <el-input v-model="formData.respDeptId" placeholder="请输入责任部门id（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="责任部门名称（风险点表冗余字段）" prop="respDeptName">
        <el-input v-model="formData.respDeptName" placeholder="请输入责任部门名称（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="风险单元id（风险单元表冗余字段）" prop="riskUnitId">
        <el-input v-model="formData.riskUnitId" placeholder="请输入风险单元id（风险单元表冗余字段）" />
      </el-form-item>
      <el-form-item label="风险单元名称（风险单元表冗余字段）" prop="riskUnitName">
        <el-input v-model="formData.riskUnitName" placeholder="请输入风险单元名称（风险单元表冗余字段）" />
      </el-form-item>
      <el-form-item label="管控负责人id（风险点表冗余字段）" prop="respUserId">
        <el-input v-model="formData.respUserId" placeholder="请输入管控负责人id（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="管控负责人姓名（风险点表冗余字段）" prop="respUserName">
        <el-input v-model="formData.respUserName" placeholder="请输入管控负责人姓名（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="监管人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）" prop="supervisorUser">
        <el-input v-model="formData.supervisorUser" placeholder="请输入监管人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="监管人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）" prop="supervisorUserName">
        <el-input v-model="formData.supervisorUserName" placeholder="请输入监管人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="验收人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）" prop="inspectorUser">
        <el-input v-model="formData.inspectorUser" placeholder="请输入验收人员ID组（多条采用英文逗号隔开）（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="验收人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）" prop="inspectorUserName">
        <el-input v-model="formData.inspectorUserName" placeholder="请输入验收人员姓名（多条采用英文逗号隔开）（风险点表冗余字段）" />
      </el-form-item>
      <el-form-item label="检查人员ID组（多条采用英文逗号隔开）（检查权限人员）" prop="inspectUserIds">
        <el-input v-model="formData.inspectUserIds" placeholder="请输入检查人员ID组（多条采用英文逗号隔开）（检查权限人员）" />
      </el-form-item>
      <el-form-item label="检查人员ID（检查记录信息）（提交检查结果人员）" prop="inspectUserId">
        <el-input v-model="formData.inspectUserId" placeholder="请输入检查人员ID（检查记录信息）（提交检查结果人员）" />
      </el-form-item>
      <el-form-item label="检查人员姓名（检查记录信息）" prop="inspectUserName">
        <el-input v-model="formData.inspectUserName" placeholder="请输入检查人员姓名（检查记录信息）" />
      </el-form-item>
      <el-form-item label="检查时间（即检查上报时间）（检查记录信息）" prop="inspectTime">
        <el-date-picker
          v-model="formData.inspectTime"
          type="date"
          value-format="x"
          placeholder="选择检查时间（即检查上报时间）（检查记录信息）"
        />
      </el-form-item>
      <el-form-item label="佐证材料url" prop="supportInfoUrl">
        <el-input v-model="formData.supportInfoUrl" placeholder="请输入佐证材料url" />
      </el-form-item>
      <el-form-item label="佐证材料url名称" prop="supportInfoUrlName">
        <el-input v-model="formData.supportInfoUrlName" placeholder="请输入佐证材料url名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { InspectRecordApi, InspectRecordVO } from '@/api/prt/inspectrecord'

/** 检查记录 表单 */
defineOptions({ name: 'InspectRecordForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  deptId: undefined,
  inspectRecordCode: undefined,
  inspectStatus: undefined,
  inspectResult: undefined,
  validStartTime: undefined,
  validEndTime: undefined,
  inspectTaskId: undefined,
  inspectType: undefined,
  inspectUsers: undefined,
  submitType: undefined,
  inspectFrqType: undefined,
  cycleFrqType: undefined,
  cycleFrqNumber: undefined,
  cycleFrqTimeType: undefined,
  cycleFrqTimes: undefined,
  inspectId: undefined,
  inspectName: undefined,
  inspectCode: undefined,
  inspectListCat: undefined,
  inspectItemType: undefined,
  inspectTarget: undefined,
  govInspectListType: undefined,
  govAgencyName: undefined,
  govAgencyCode: undefined,
  validType: undefined,
  startTime: undefined,
  endTime: undefined,
  riskId: undefined,
  riskName: undefined,
  inherentRisk: undefined,
  existingRisk: undefined,
  riskType: undefined,
  controlLevel: undefined,
  respDeptId: undefined,
  respDeptName: undefined,
  riskUnitId: undefined,
  riskUnitName: undefined,
  respUserId: undefined,
  respUserName: undefined,
  supervisorUser: undefined,
  supervisorUserName: undefined,
  inspectorUser: undefined,
  inspectorUserName: undefined,
  inspectUserIds: undefined,
  inspectUserId: undefined,
  inspectUserName: undefined,
  inspectTime: undefined,
  supportInfoUrl: undefined,
  supportInfoUrlName: undefined,
})
const formRules = reactive({
  inspectStatus: [{ required: true, message: '检查状态*（1：待检查 5：已检查 15：已作废）（检查记录信息）不能为空', trigger: 'blur' }],
  inspectTaskId: [{ required: true, message: '检查任务ID（检查任务表冗余字段）不能为空', trigger: 'blur' }],
})
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
      formData.value = await InspectRecordApi.getInspectRecord(id)
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
    const data = formData.value as unknown as InspectRecordVO
    if (formType.value === 'create') {
      await InspectRecordApi.createInspectRecord(data)
      message.success(t('common.createSuccess'))
    } else {
      await InspectRecordApi.updateInspectRecord(data)
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
    inspectRecordCode: undefined,
    inspectStatus: undefined,
    inspectResult: undefined,
    validStartTime: undefined,
    validEndTime: undefined,
    inspectTaskId: undefined,
    inspectType: undefined,
    inspectUsers: undefined,
    submitType: undefined,
    inspectFrqType: undefined,
    cycleFrqType: undefined,
    cycleFrqNumber: undefined,
    cycleFrqTimeType: undefined,
    cycleFrqTimes: undefined,
    inspectId: undefined,
    inspectName: undefined,
    inspectCode: undefined,
    inspectListCat: undefined,
    inspectItemType: undefined,
    inspectTarget: undefined,
    govInspectListType: undefined,
    govAgencyName: undefined,
    govAgencyCode: undefined,
    validType: undefined,
    startTime: undefined,
    endTime: undefined,
    riskId: undefined,
    riskName: undefined,
    inherentRisk: undefined,
    existingRisk: undefined,
    riskType: undefined,
    controlLevel: undefined,
    respDeptId: undefined,
    respDeptName: undefined,
    riskUnitId: undefined,
    riskUnitName: undefined,
    respUserId: undefined,
    respUserName: undefined,
    supervisorUser: undefined,
    supervisorUserName: undefined,
    inspectorUser: undefined,
    inspectorUserName: undefined,
    inspectUserIds: undefined,
    inspectUserId: undefined,
    inspectUserName: undefined,
    inspectTime: undefined,
    supportInfoUrl: undefined,
    supportInfoUrlName: undefined,
  }
  formRef.value?.resetFields()
}
</script>
