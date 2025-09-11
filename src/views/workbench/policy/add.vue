<template>
  <div class="policy-add-container">
    <div class="header">
      <div class="left">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </div>
      </div>
      <div class="center">添加文件</div>
      <div class="right">
        <el-button type="primary" @click="submitForm">保存</el-button>
      </div>
    </div>

    <div class="form-container">
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <el-form-item label="文件名称" prop="title" class="required-label">
          <el-input v-model="formData.title" placeholder="请输入" class="input-width" />
        </el-form-item>

        <el-form-item label="发布部门" prop="publisherId" class="required-label">
          <el-tree-select
            v-model="formData.publisherId"
            :data="deptList"
            :props="defaultProps"
            check-strictly
            node-key="id"
            placeholder="请选择部门"
            class="input-width"
            @change="handleDeptChange"
          />
        </el-form-item>

        <el-form-item label="政策文件可见范围" prop="visibility" class="required-label">
          <el-radio-group v-model="formData.visibility">
            <el-radio :label="1">公开可见</el-radio>
            <el-radio :label="2">仅本单位可见</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            type="textarea"
            placeholder="请输入"
            :rows="4"
            class="input-width"
          />
        </el-form-item>

        <el-form-item label="上传附件" class="required-label">
          <UploadFile
            v-model="uploadFiles"
            :file-type="['pdf', 'doc', 'docx']"
            :file-size="10"
            :limit="5"
            :is-show-tip="true"
            class="upload-area"
            @update:model-value="handleUploadChange"
          />
          <div v-if="isUploaded && formData.filePaths.length > 0" class="file-list-info success">
            已选择 {{ formData.filePaths.length }} 个文件
          </div>
          <div v-else class="file-list-info warning">
            请上传附件
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { getSimpleDeptList } from '@/api/system/dept'
import { createPolicyDocument } from '@/api/workbenches/policy'
import type { FileSaveVO, DocumentSaveReqVO } from '@/api/workbenches/policy'
import { uploadFile } from '@/api/infra/file'
import { handleTree, defaultProps } from '@/utils/tree'
import { UploadFile } from '@/components/UploadFile'

const router = useRouter()
const formRef = ref()
const deptList = ref<any[]>([])
const uploadFiles = ref<string[]>([])
const isUploaded = ref(false)

// 表单数据
const formData = reactive<DocumentSaveReqVO>({
  title: '',
  filePaths: [],
  publisherId: undefined as unknown as number,
  publisherName: '',
  visibility: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  title: [{ required: true, message: '请输入文件名称', trigger: 'blur' }],
  publisherId: [{ required: true, message: '请选择发布部门', trigger: 'change' }],
  visibility: [{ required: true, message: '请选择可见范围', trigger: 'change' }]
}

// 获取部门列表
const getDeptList = async () => {
  try {
    const res = await getSimpleDeptList()
    // 将部门数据转换为树形结构
    deptList.value = handleTree(res || [])
    
    // 如果有部门数据，默认选择第一个
    if (deptList.value.length > 0 && deptList.value[0].children && deptList.value[0].children.length > 0) {
      formData.publisherId = deptList.value[0].children[0].id
      formData.publisherName = deptList.value[0].children[0].name
    }
  } catch (error) {
    // 错误处理
  }
}

// 监听部门选择变化
const handleDeptChange = (deptId: number) => {
  // 递归查找选中的部门
  const findDept = (list: any[], id: number): any => {
    for (const item of list) {
      if (item.id === id) {
        return item
      }
      if (item.children && item.children.length > 0) {
        const found = findDept(item.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  const selectedDept = findDept(deptList.value, deptId)
  if (selectedDept) {
    formData.publisherName = selectedDept.name
  }
}

// 监听上传文件变化
const handleUploadChange = (fileUrls: string | string[]) => {
  if (!fileUrls || (Array.isArray(fileUrls) && fileUrls.length === 0)) {
    formData.filePaths = []
    isUploaded.value = false
    return
  }
  
  isUploaded.value = true
  
  if (typeof fileUrls === 'string') {
    updateFilePaths([fileUrls])
  } else {
    updateFilePaths(fileUrls)
  }
}

// 更新文件路径
const updateFilePaths = (urls: string[]) => {
  if (!urls || urls.length === 0) {
    formData.filePaths = []
    return
  }
  
  formData.filePaths = urls.map(url => {
    const fileName = url.substring(url.lastIndexOf('/') + 1)
    const fileType = fileName.substring(fileName.lastIndexOf('.') + 1)
    return {
      fileName,
      filePath: url,
      fileSize: 0,
      fileType
    }
  })
}

// 监听uploadFiles变化
watch(uploadFiles, (newVal) => {
  if (!newVal || (Array.isArray(newVal) && newVal.length === 0)) {
    isUploaded.value = false
    formData.filePaths = []
    return
  }
  
  isUploaded.value = true
  
  if (Array.isArray(newVal)) {
    updateFilePaths(newVal)
  } else if (typeof newVal === 'string') {
    updateFilePaths([newVal])
  }
}, { deep: true })

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      if (!isUploaded.value || formData.filePaths.length === 0) {
        ElMessage.error('请上传附件')
        return
      }
      
      try {
        await createPolicyDocument(formData)
        ElMessage.success('保存成功')
        goBack()
      } catch (error) {
        // 错误处理
      }
    }
  })
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  getDeptList()
})
</script>

<style lang="scss" scoped>
.policy-add-container {
  background-color: #f5f7fa;
  min-height: 100vh;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 48px;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;

  .left {
    width: 80px;
  }

  .center {
    font-size: 16px;
    font-weight: bold;
    flex: 1;
    text-align: center;
  }

  .right {
    width: 80px;
    display: flex;
    justify-content: flex-end;
  }

  .back-btn {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #606266;
    font-size: 14px;

    .el-icon {
      margin-right: 4px;
    }

    &:hover {
      color: #409eff;
    }
  }
}

.form-container {
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin: 10px;

  .input-width {
    width: 100%;
    max-width: 600px;
  }

  .required-label {
    :deep(.el-form-item__label) {
      &::before {
        content: '*';
        color: #f56c6c;
        margin-right: 4px;
      }
    }
  }

  .upload-area {
    width: 100%;
    max-width: 600px;
  }
  
  .file-list-info {
    margin-top: 4px;
    font-size: 12px;
    
    &.success {
      color: #67c23a;
    }
    
    &.warning {
      color: #e6a23c;
    }
  }
}
</style>
