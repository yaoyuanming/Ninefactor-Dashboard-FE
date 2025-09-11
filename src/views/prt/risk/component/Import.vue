<template>
  <div>
    <div
      ><span
        style="
          border-radius: 50%;
          height: 10px;
          width: 10px;
          background: #9a9a9a;
          display: inline-table;
        "
      ></span
      >下载模板
    </div>
    <div style="margin-left: 10px; margin-top: 10px; background: #f9f9f9; padding: 10px">
      <div>请下载导入模板，根据填写须知批量填写信息</div>
      <div>
        <el-button
          v-loading="buttonLoading"
          :disabled="buttonLoading"
          type="primary"
          @click="getFile()"
          size="small"
          style="margin-top: 10px"
        >
          下载模板文件
        </el-button>
      </div>
    </div>
    <div style="margin-top: 10px"
      ><span
        style="
          border-radius: 50%;
          height: 10px;
          width: 10px;
          background: #9a9a9a;
          display: inline-table;
        "
      ></span
      >上传文件
    </div>
    <div style="margin-left: 10px; margin-top: 10px; background: #f9f9f9; padding: 10px">
      <div style="margin-bottom: 10px">上传填写好的列表文件</div>
      <div>
        <el-upload
          class="upload-demo"
          drag
          :http-request="handleUpload"
          multiple
          v-loading="uploadLoding"
        >
          <div class="el-icon--upload">
            <el-image :src="img" style="height: 40px; width: 40px" />
          </div>
          <div class="el-upload__text"> 可直接将文件拖拽到此处上传，或 <em>点击上传</em></div>
          <div class="el-upload__text"> 仅支持格式：xlsx/xls</div>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import img from '@/assets/imgs/prt/file.png'
import { ref, reactive, defineProps, defineEmits, withDefaults } from 'vue'
import download from '@/utils/download'

interface FormData {
  url: string
  uploadUrl: string
  fileName: string
  checkList: string[]
  returnJson: string
}

const props = withDefaults(
  defineProps<{
    modelValue: FormData
  }>(),
  {
    modelValue: () => ({
      url: '',
      uploadUrl: '',
      returnJson: '',
      fileName: '',
      checkList: []
    })
  }
)
const emit = defineEmits(['update:modelValue', 'submit', 'reset'])

const formData = reactive<FormData>({
  url: props.modelValue.url,
  uploadUrl: props.modelValue.uploadUrl,
  fileName: props.modelValue.fileName,
  returnJson: props.modelValue.returnJson,
  checkList: props.modelValue.checkList
})
watch(
  formData,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

import { RiskApi } from '@/api/import'

let buttonLoading = ref(false)
const getFile = async () => {
  //   下载文件
  buttonLoading.value = true
  const data = await RiskApi.getTemplate(formData.url)
  download.excel(data, formData.fileName)
  buttonLoading.value = false
}
let uploadLoding = ref(false)
const handleUpload = async (file: any) => {
  try{
    uploadLoding.value = true
    const res = await RiskApi.uploadTemplate(file.file, formData.uploadUrl)
    formData.returnJson = res.data
    emit('submit', formData.returnJson)
  }finally {
    uploadLoding.value = false
  }
}
</script>

<style scoped></style>
