<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        v-if="props.id == null"
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center justify-between px-20px"
      >
        <!-- 左侧标题 -->
        <div class="flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack"/>
          <span class="ml-10px text-16px truncate"> 整改完成录入 </span>
        </div>
        <div class="flex items-center gap-2"></div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-form
          label-position="top"
          ref="formRef"
          v-loading="formLoading"
          :model="formData"
          :rules="formRules"
          label-width="160px"
        >
          <el-form-item label="整改完成日期" prop="rectCompleteTime">
            <el-date-picker
              v-model="formData.rectCompleteTime"
              placeholder="选择日期"
              type="date"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="整改完成情况" prop="rectCompletionState">
            <el-input
              v-model="formData.rectCompletionState"
              placeholder="请输入整改完成情况"
              type="textarea"
              :rows="5"
            />
          </el-form-item>
          <el-form-item
            label="整改完成后图片 （仅支持jpg、png格式文件上传，且不超过100M）"
            prop="rectCompleteUrl"
          >
            <UploadImgs v-model="formData.rectCompleteUrl" :fileSize="100"/>
          </el-form-item>
        </el-form>
        <div>
          <el-button :disabled="formLoading" type="primary" @click="submitForm" v-loading="formLoading">确 定</el-button>
          <el-button @click="resetForm()">取 消</el-button>
        </div>
      </div>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import {useTagsViewStore} from '@/store/modules/tagsView'

defineOptions({name: 'SystemOAuth2ClientForm'})
const props = defineProps<{
  id: string // 流程实例的编号
  taskId?: string // 任务编号
  activityId?: string //流程活动编号，用于抄送查看
}>()
const {t} = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('整改完成录入') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  rectCompleteTime: undefined,
  rectCompletionState: undefined,
  rectCompleteUrl: undefined
})
const formRules = reactive({
  rectCompleteTime: [{required: true, message: '请输入', trigger: 'blur'}],
  rectCompletionState: [{required: true, message: '请输入', trigger: 'blur'}],
  rectCompleteUrl: [{required: true, message: '请上传', trigger: 'blur'}]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, row?: any) => {
  dialogVisible.value = true
  dialogTitle.value = '整改完成录入'
  formData.value.id = row.id
  console.log(type)
}
defineExpose({open}) // 提供 open 方法，用于打开弹窗
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
import {DangerRectApi} from '@/api/prt/dangerRect'
import {useRouter} from 'vue-router'
import {defineEmits} from "vue";

const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = JSON.parse(JSON.stringify(formData.value))
    data.id = props.id
    // if (formType.value === 'create') {
    data.rectCompleteUrl = data.rectCompleteUrl.join(',')
    await DangerRectApi.completeInput(data)
    dialogVisible.value = false
    message.success(t('common.createSuccess'))
    emit('success') // 使用组件内的 ruleForm
    // } else {
    //   await ClientApi.updateOAuth2Client(data)
    //   message.success(t('common.updateSuccess'))
    // }
    resetForm()
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
    rectCompleteTime: undefined,
    rectCompletionState: undefined,
    rectCompleteUrl: undefined
  }
  formRef.value?.resetFields()
  dialogVisible.value = false
}
const {delView} = useTagsViewStore() // 视图操作
const router = useRouter() // 路由
/** 返回列表页 */
const handleBack = () => {
  // 先删除当前页签
  delView(unref(router.currentRoute))
  // 跳转到列表页
  router.go(-1)
  // router.push({ name: 'EnterpriseInspectionList' })
}
</script>
