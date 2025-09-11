<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center px-20px"
      >
        <!-- 左侧标题 -->
        <div class="w-200px flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" />
          <span class="ml-10px text-16px truncate">
            {{ formData.id ? '编辑风险单元' : '新增风险单元' }}
          </span>
        </div>
        <div class="w-200px flex items-center justify-end gap-2"></div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-form
          :label-position="labelPosition"
          ref="formRef"
          :model="formData"
          :rules="rules"
          label-width="auto"
          class="demo-formData"
          :size="formSize"
          status-icon
          v-loading="formLoading"
        >
          <el-form-item label="风险单元名称" prop="riskUnitName">
            <el-input v-model="formData.riskUnitName" placeholder="请输入风险单元名称" />
          </el-form-item>
          <el-form-item label="固有风险等级" prop="riskLevel">
            <el-select v-model="formData.riskLevel">
              <el-option label="低风险" value="2" />
              <el-option label="一般风险" value="5" />
              <el-option label="较大风险" value="8" />
              <el-option label="重大风险" value="10" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <Map
              style="width: 100%; height: 800px"
              :initialData="formData"
              ref="MapRef"
              v-if="mapState"
            />
          </el-form-item>
          <el-form-item>
            <div style="text-align: right">
              <el-button @click="resetForm(formRef)">取消</el-button>
              <el-button @click="submitForm" type="primary" :disabled="formLoading"
                >确 定
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import type { ComponentSize, FormInstance, FormRules, FormProps } from 'element-plus'
import Map from './map.vue'

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
const router = useRouter() // 路由
// 地图
const MapRef = ref()
const mapInitDate = {
  id: undefined,
  deptId: undefined,
  riskUnitName: undefined,
  riskPoint: '[]',
  riskLevel: undefined
}
//表单
const labelPosition = ref<FormProps['labelPosition']>('top')
const mapState = ref(false)

interface RuleForm {
  id: number
  riskPoint: string
  region: string
  count: string
  date1: string
  date2: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
}

const formSize = ref<ComponentSize>('default')
const formRef = ref<FormInstance>()
const formData = ref({
  id: undefined,
  deptId: undefined,
  riskUnitName: undefined,
  riskPoint: '[]',
  riskLevel: undefined
})

const rules = reactive<FormRules<RuleForm>>({
  riskPoint: [{ required: true, message: 'Please input Activity name', trigger: 'blur' }],
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
import { RiskUnitApi, RiskUnitVO } from '@/api/prt/riskunit'
// const submitForm = async (formEl: FormInstance | undefined) => {
//
//   console.log('form', form)
//   if (!formEl) return
//   await formEl.validate((valid, fields) => {
//     if (valid) {
//       console.log('submit!')
//     } else {
//       console.log('error submit!', fields)
//     }
//   })
// }
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化
const formType = ref('create')
const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as RiskUnitVO
    let form = await MapRef.value.validate()
    console.log('form', form)
    data.riskPoint = form.data
    if (formType.value === 'create') {
      await RiskUnitApi.createRiskUnit(data)
      message.success(t('common.createSuccess'))
      // 先删除当前页签
      delView(unref(router.currentRoute))
      // 跳转到列表页
      router.push({ name: 'PrtRiskunitIndex' })
    } else {
      await RiskUnitApi.updateRiskUnit(data)
      message.success(t('common.updateSuccess'))
      // 先删除当前页签
      delView(unref(router.currentRoute))
      // 跳转到列表页
      router.push({ name: 'PrtRiskunitIndex' })
    }
  } finally {
    formLoading.value = false
  }
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
  handleBack()
}

/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  router.go(-1)
  // 跳转到列表页
  // router.push({ name: 'PrtRiskunitIndex' })
}

/** 初始化 */
onMounted(async () => {
  if (route.query.id) {
    formType.value = 'edit'
    const data = await RiskUnitApi.getRiskUnit((route.query.id))
    formData.value = data
    formData.value.riskLevel = data.riskLevel.toString()
    formData.value.riskPoint = data.riskPoint
    mapState.value = true
  } else {
    mapState.value = true
  }
})

/** 添加组件卸载前的清理代码 */
onBeforeUnmount(() => {})

/** 暴露方法给子组件使用 */
defineExpose({
  handleBack
})
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid #dcdfe6;
}

.text-primary {
  color: #3473ff;
}

.bg-primary {
  background-color: #3473ff;
}

.border-primary {
  border-color: #3473ff;
}
</style>
