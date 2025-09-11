<template>
  <ContentWrap>
    <div class="mx-auto">
      <!-- 头部导航栏 -->
      <div
        class="absolute top-0 left-0 right-0 h-50px bg-white border-bottom z-10 flex items-center justify-between px-20px"
      >
        <!-- 左侧标题 -->
        <div class="flex items-center overflow-hidden">
          <Icon icon="ep:arrow-left" class="cursor-pointer flex-shrink-0" @click="handleBack" />
          <span class="ml-10px text-16px truncate"> 新增隐患速记 </span>
        </div>
        <div class="flex items-center gap-2"></div>
      </div>
      <!-- 主体内容 -->
      <div class="mt-50px">
        <el-row>
          <el-col :span="12" :offset="6">
            <div>
              <el-form
                label-position="top"
                ref="formRef"
                v-loading="formLoading"
                :model="formData"
                :rules="formRules"
                label-width="160px"
              >
                <el-form-item label="隐患图片" prop="dangerUrlBack">
                  <UploadImgs v-model="formData.dangerUrlBack"/>
                </el-form-item>
                <el-form-item label="隐患描述" prop="dangerDesc">
                  <el-input
                    v-model="formData.dangerDesc"
                    placeholder="请输入"
                    type="text"
                  />
                </el-form-item>
                <el-form-item label="隐患位置" prop="dangerAddress">
                  <el-input
                    v-model="formData.dangerAddress"
                    placeholder="请输入"
                    type="text"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button @click="handleBack">取 消</el-button>
                  <el-button :disabled="formLoading" type="primary" @click="submitForm"
                  >确 定
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </ContentWrap>
</template>
<script lang="ts" setup>
import { RecordApi } from '@/api/prt/hiddenDanger'
defineOptions({ name: 'SystemOAuth2ClientForm' })
const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formData = ref({
  id: undefined,
  dangerUrlBack: undefined,
  dangerUrl: undefined,
  dangerDesc: undefined,
  dangerAddress: undefined,
  processDefinitionKey: undefined, //流程定义的标识（即流程模型中的流程标识，表act_re_model、act_re_procdef中的KEY_）,示例值(leave)
})
const formRules = reactive({
  dangerDesc: [{ required: true, message: '请输入', trigger: 'change' }],
  dangerAddress: [{ required: true, message: '请输入', trigger: 'change' }],
  dangerUrlBack: [{ required: true, message: '请上传', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

// /** 打开弹窗 */
// const open = async (type: string, id?: number) => {
//
// }
// defineExpose({ open }) // 提供 open 方法，用于打开弹窗
/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
import { InspectRespAPI } from '@/api/prt/inspect'

const submitForm = async () => {
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  // route.query.baseProcessDefinitionKey  获取路由上的baseProcessDefinitionKey
  try {
    const data = JSON.parse(JSON.stringify(formData.value))
    data.dangerUrl = data.dangerUrlBack.toString()
    delete data.dangerUrlBack
    // 获取路由数据
    if (route.query.id != null) {
      await InspectRespAPI.updateInspect(data)
      message.success(t('common.updateSuccess'))
      handleBack()
    } else {
      data.processDefinitionKey = route.query.baseProcessDefinitionKey
      await RecordApi.createRecord(data)
      message.success(t('common.createSuccess'))
      handleBack()
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
})
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'


const { delView } = useTagsViewStore() // 视图操作
const route = useRoute() // 路由
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
<style scoped>
.grid-container {
  background: #f9f9f9;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
</style>
