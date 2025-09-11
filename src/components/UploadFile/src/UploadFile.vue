<template>
  <div v-if="!disabled" class="upload-file">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="autoUpload"
      :before-upload="beforeUpload"
      :data="uploadData"
      :disabled="disabled"
      :drag="drag"
      :http-request="httpRequest"
      :limit="props.limit"
      :multiple="props.limit > 1"
      :on-error="excelUploadError"
      :on-exceed="handleExceed"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleFileSuccess"
      :show-file-list="true"
      class="upload-file-uploader"
      name="file"
    >
      <el-button type="primary" :loading="isUploading">
        <Icon icon="ep:upload-filled" />
        {{ isUploading ? '上传中...' : '选取文件' }}
      </el-button>
      <template v-if="isShowTip" #tip>
        <div style="font-size: 12px">
          大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
        </div>
        <div style="font-size: 12px">
          格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b> 的文件
        </div>
        <div v-if="isUploading" class="upload-status-tip">
          <el-icon class="is-loading" :size="18"><Loading /></el-icon>
          <strong>正在上传文件，请勿关闭页面...</strong>
        </div>
      </template>
      <template #file="row">
        <div class="flex items-center file-item">
          <span class="file-name" :title="row.file.name">{{ row.file.name }}</span>
          
          <!-- 上传状态指示器 -->
          <div class="file-status">
            <el-tag v-if="row.file.status === 'uploading'" type="warning" size="small">
              <el-icon class="is-loading"><Loading /></el-icon>
              上传中...
            </el-tag>
            <el-tag v-else-if="row.file.status === 'success'" type="success" size="small">
              已完成
            </el-tag>
            <el-tag v-else-if="row.file.status === 'fail'" type="danger" size="small">
              上传失败
            </el-tag>
          </div>
          
          <div class="file-actions">
            <el-link
              v-if="row.file.status === 'success'"
              :href="row.file.url"
              :underline="false"
              download
              target="_blank"
              type="primary"
            >
              下载
            </el-link>
            <el-button 
              link 
              type="danger" 
              @click="handleRemove(row.file)"
              :disabled="row.file.status === 'uploading'"
            > 
              删除
            </el-button>
          </div>
        </div>
      </template>
    </el-upload>
  </div>

  <!-- 上传操作禁用时 -->
  <div v-if="disabled" class="upload-file">
    <div v-for="(file, index) in fileList" :key="index" class="flex items-center file-list-item">
      <span>{{ file.name }}</span>
      <div class="ml-10px">
        <el-link :href="file.url" :underline="false" download target="_blank" type="primary">
          下载
        </el-link>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { propTypes } from '@/utils/propTypes'
import type { UploadInstance, UploadProps, UploadRawFile, UploadUserFile } from 'element-plus'
import { isString } from '@/utils/is'
import { useUpload } from '@/components/UploadFile/src/useUpload'
import { UploadFile } from 'element-plus/es/components/upload/src/upload'
import { Loading } from '@element-plus/icons-vue'

defineOptions({ name: 'UploadFile' })

const message = useMessage() // 消息弹窗
const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: propTypes.oneOfType<string | string[]>([String, Array<String>]).isRequired,
  fileType: propTypes.array.def(['doc', 'xls', 'ppt', 'txt', 'pdf']), // 文件类型, 例如['png', 'jpg', 'jpeg']
  fileSize: propTypes.number.def(5), // 大小限制(MB)
  limit: propTypes.number.def(5), // 数量限制
  autoUpload: propTypes.bool.def(true), // 自动上传
  drag: propTypes.bool.def(false), // 拖拽上传
  isShowTip: propTypes.bool.def(true), // 是否显示提示
  disabled: propTypes.bool.def(false) // 是否禁用上传组件 ==> 非必传（默认为 false）
})

// ========== 上传相关 ==========
const uploadRef = ref<UploadInstance>()
const uploadList = ref<UploadUserFile[]>([])
const fileList = ref<UploadUserFile[]>([])
const uploadNumber = ref<number>(0)
const isUploading = ref(false)

// 上传时的额外数据，包括path参数
const uploadData = ref({
  path: ''
})

const { uploadUrl, httpRequest } = useUpload()

// 文件上传之前判断
const beforeUpload: UploadProps['beforeUpload'] = (uploadFile: UploadRawFile) => {
  // 检查文件类型
  const fileType = uploadFile.name.substring(uploadFile.name.lastIndexOf('.') + 1)
  if (!props.fileType.includes(fileType)) {
    message.error(`文件类型不正确，请上传${props.fileType.join('/')}格式的文件!`)
    return false
  }
  // 检查文件大小
  if (uploadFile.size / 1024 / 1024 > props.fileSize) {
    message.error(`上传文件大小不能超过${props.fileSize}MB!`)
    return false
  }
  
  // 设置上传状态
  isUploading.value = true
  
  // 设置文件状态为上传中
  uploadFile.status = 'uploading'
  
  // 显示持久化的上传提示消息 - 设置为5分钟
  message.success('正在上传文件，请稍候...', 300000)
  
  uploadNumber.value++
  
  // 设置上传时的path参数为"原始文件名+当天日期(YYYYMMDD)"
  const name = uploadFile.name
  const dotIndex = name.lastIndexOf('.')
  const base = dotIndex > -1 ? name.substring(0, dotIndex) : name
  const ext = dotIndex > -1 ? name.substring(dotIndex) : ''
  const y = new Date().getFullYear()
  const m = String(new Date().getMonth() + 1).padStart(2, '0')
  const d = String(new Date().getDate()).padStart(2, '0')
  const dateStr = `${y}${m}${d}`
  uploadData.value.path = `${base}${dateStr}${ext}`
}
// 处理上传的文件发生变化
// const handleFileChange = (uploadFile: UploadFile): void => {
//   uploadRef.value.data.path = uploadFile.name
// }
// 文件上传成功
const handleFileSuccess: UploadProps['onSuccess'] = (res: any, uploadFile: UploadUserFile): void => {
  // 设置文件状态为成功
  uploadFile.status = 'success'
  
  message.success('上传成功')
  // 删除自身
  const index = fileList.value.findIndex((item) => item.response?.data === res.data)
  fileList.value.splice(index, 1)
  uploadList.value.push({ name: res.data, url: res.data })
  if (uploadList.value.length == uploadNumber.value) {
    fileList.value.push(...uploadList.value)
    uploadList.value = []
    uploadNumber.value = 0
    isUploading.value = false
    emitUpdateModelValue()
  }
}
// 文件数超出提示
const handleExceed: UploadProps['onExceed'] = (): void => {
  message.error(`上传文件数量不能超过${props.limit}个!`)
}
// 上传错误提示
const excelUploadError: UploadProps['onError'] = (error: any, uploadFile: UploadUserFile): void => {
  // 设置文件状态为失败
  uploadFile.status = 'fail'
  
  // 重置上传状态
  isUploading.value = false
  
  message.error('导入数据失败，请您重新上传！')
}
// 删除上传文件
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.map((f) => f.name).indexOf(file.name)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emitUpdateModelValue()
  }
}
const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  console.log(uploadFile)
}

// 监听模型绑定值变动
watch(
  () => props.modelValue,
  (val: string | string[]) => {
    if (!val) {
      fileList.value = [] // fix：处理掉缓存，表单重置后上传组件的内容并没有重置
      return
    }

    fileList.value = [] // 保障数据为空
    // 情况1：字符串
    if (isString(val)) {
      fileList.value.push(
        ...val.split(',').map((url) => ({ name: url.substring(url.lastIndexOf('/') + 1), url }))
      )
      return
    }
    // 情况2：数组
    fileList.value.push(
      ...(val as string[]).map((url) => ({ name: url.substring(url.lastIndexOf('/') + 1), url }))
    )
  },
  { immediate: true, deep: true }
)
// 发送文件链接列表更新
const emitUpdateModelValue = () => {
  // 情况1：数组结果
  let result: string | string[] = fileList.value.map((file) => file.url!)
  // 情况2：逗号分隔的字符串
  if (props.limit === 1 || isString(props.modelValue)) {
    result = result.join(',')
  }
  emit('update:modelValue', result)
}
</script>
<style lang="scss" scoped>
.upload-file-uploader {
  margin-bottom: 5px;
}

.file-item {
  width: 100%;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
}

.file-name {
  flex: 1;
  min-width: 0;
  margin-right: 12px;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  white-space: normal;
  overflow: visible;
}

.file-status {
  margin: 0 12px;
  min-width: 80px;
  text-align: center;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.upload-status-tip {
  font-size: 16px;
  color: #409eff;
  margin-top: 12px;
  padding: 12px 16px;
  background-color: #f0f9ff;
  border: 2px solid #b3d8ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
  font-weight: 500;
  animation: pulse 2s infinite;
  
  .el-icon {
    color: #409eff;
  }
  
  strong {
    color: #1d39aa;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    border-color: #b3d8ff;
  }
  50% {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
    border-color: #409eff;
  }
  100% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    border-color: #b3d8ff;
  }
}

:deep(.upload-file-list .el-upload-list__item) {
  position: relative;
  margin-bottom: 10px;
  line-height: 2;
  border: 1px solid #e4e7ed;
}

:deep(.el-upload-list__item-file-name) {
  max-width: 250px;
}

:deep(.upload-file-list .ele-upload-list__item-content) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: inherit;
}

:deep(.ele-upload-list__item-content-action .el-link) {
  margin-right: 10px;
}

.file-list-item {
  border: 1px dashed var(--el-border-color-darker);
  border-radius: 8px;
}
</style>
