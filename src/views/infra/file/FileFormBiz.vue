<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="data"
      :rules="formRules"
    >
      <el-form-item label="文件业务类型" prop="bizType">
        <el-select
          v-model="data.bizType"
          placeholder="请选择业务类型"
        >
          <el-option
            v-for="dictType in getDictTypeOptions(DICT_CATEGORY.INFRA_FILE_BIZ_TYPE)"
            :key="dictType.type"
            :label="dictType.name"
            :value="dictType.type"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="二级业务类型" prop="bizTypeSec">
        <el-select
          v-model="data.bizTypeSec"
          placeholder="请选择二级业务类型"
        >
          <el-option
            v-for="dict in getDictOptions(DICT_TYPE.INFRA_FILE_BIZ_WARNSIGN)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-upload
        ref="uploadRef"
        v-model:file-list="fileList"
        v-if="!data.id"
        :action="uploadUrl"
        :auto-upload="false"
        :data="data"
        :disabled="formLoading"
        :limit="1"
        :on-change="handleFileChange"
        :on-error="submitFormError"
        :on-exceed="handleExceed"
        :on-success="submitFormSuccess"
        :http-request="httpRequest"
        accept=".jpg, .png, .gif, .xls, .xlsx"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip" style="color: red">
            提示：仅允许导入 jpg、png、gif、xls、xlsx 格式文件！
          </div>
        </template>
      </el-upload>
    <el-form-item>
<!--    <template #footer>-->
      <el-button :disabled="formLoading" type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
<!--    </template>-->
    </el-form-item>
    </el-form>
  </Dialog>
</template>
<script lang="ts" setup>
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { DICT_CATEGORY, DICT_TYPE, getDictOptions, getDictTypeOptions } from '@/utils/dict'
import * as FileApi from '@/api/infra/file'
import {CommonStatusEnum} from "@/utils/constants";

defineOptions({ name: 'InfraFileForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const fileList = ref([]) // 文件列表
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const data = ref({
  id: undefined,
  path: '',
  bizType: null,
  bizTypeSec: null
})
const formRules = reactive({
  bizType: [{ required: true, message: '文件业务类型不能为空', trigger: 'blur' }],
  bizTypeSec: [{ required: true, message: '文件二级业务类型不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const uploadRef = ref()

const { uploadUrl, httpRequest } = useUpload()

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
      data.value = await FileApi.getFile(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 处理上传的文件发生变化 */
const handleFileChange = (file) => {
  data.value.path = file.name
}

/** 提交表单 */
const submitFileForm = async () => {
  console.log("-------------------")
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  if (!data.value.id) { // 新增
    if (fileList.value.length == 0) {
      message.error('请上传文件')
      return
    }
    unref(uploadRef)?.submit()
    dialogVisible.value = false
  } else { // 修改
    console.log(data.value)
    await FileApi.updateFile(data.value)
    unref(uploadRef)?.submit()
    dialogVisible.value = false
    message.success(t('common.updateSuccess'))
  }
}

/** 文件上传成功处理 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitFormSuccess = () => {
  // 清理
  dialogVisible.value = false
  formLoading.value = false

  if (!data.value.id) { // 新增
    unref(uploadRef)?.clearFiles()
    // 提示成功，并刷新
    message.success(t('common.createSuccess'))
  } else { // 修改
    message.success(t('common.updateSuccess'))
  }
  emit('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = () => {
  data.value = {
    id: undefined,
    path: '',
    bizType: null,
    bizTypeSec: null
  } as any
  // 重置上传状态和文件
  formLoading.value = false
  uploadRef.value?.clearFiles()
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}
</script>
