<template>
  <div class="checklist-edit-container">
    <!-- 顶部操作栏 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">
          编辑
        </span>
      </div>
    </div>

    <el-card class="form-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="title">{{ pageTitle }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="160px"
        class="checklist-form"
      >
        <el-form-item label="检查清单名称" prop="checkName">
          <el-input
            v-model="formData.checkName"
            :placeholder="namePlaceholder"
            style="width: 400px"
            clearable
          />
        </el-form-item>

        <el-form-item label="适用行业类型" prop="industryType">
          <el-cascader
            v-model="formData.industryType"
            :options="categoryData"
            :props="{ checkStrictly: true }"
            placeholder="请选择适用行业类型"
            style="width: 400px"
            clearable
          />
        </el-form-item>

        <el-form-item label="是否在企业端展示" prop="isDisplayed">
          <el-radio-group v-model="formData.isDisplayed">
            <el-radio :label="true">是</el-radio>
            <el-radio :label="false">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检查清单内容" prop="filePath">
          <UploadFile
            :model-value="getFilePathsArray(formData.filePath)"
            :limit="1"
            :file-size="50"
            :file-type="['doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt']"
            @update:model-value="handleFileUpload"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注信息"
            style="width: 600px"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            更新
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { updateInspectCheck, getInspectCheck, type InspectCheckSaveReqVO } from '@/api/supervisoryInspect/checklist'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import { categoryData } from 'element-china-category-data'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const checklistType = route.params.type as string
const checklistId = route.params.id as string

// 根据类型计算页面标题和占位符
const pageTitle = computed(() => {
  const titles = {
    industrySector: '编辑行业领域检查清单',
    special: '编辑专项检查清单',
    majorHiddenDangers: '编辑重大隐患检查清单'
  }
  return titles[checklistType] || '编辑检查清单'
})

// 根据路由类型计算 checkType 值
const getCheckTypeValue = () => {
  const typeMap = {
    industrySector: 1,        // 行业领域
    special: 2,               // 专项
    majorHiddenDangers: 3     // 重大隐患
  }

  const checkType = typeMap[checklistType] || 1
  console.log('编辑页面 - 路由参数 checklistType:', checklistType, '-> checkType:', checkType)

  return checkType
}

const namePlaceholder = computed(() => {
  const placeholders = {
    industrySector: '请输入行业领域检查清单名称',
    special: '请输入专项检查清单名称',
    majorHiddenDangers: '请输入重大隐患检查清单名称'
  }
  return placeholders[checklistType] || '请输入检查清单名称'
})

// 表单数据
const formData = reactive({
  id: Number(checklistId),
  checkName: '',
  checkType: getCheckTypeValue(),
  industryType: [] as any[],
  isDisplayed: true,
  filePath: '',
  remark: ''
})

// 将逗号分隔的字符串转换为数组，供 UploadFile 组件使用
const getFilePathsArray = (filePaths: string): string[] => {
  if (!filePaths || filePaths.trim() === '') {
    return []
  }
  return filePaths.split(',').filter(path => path.trim() !== '')
}

// 处理文件上传
const handleFileUpload = (filePaths: string[]) => {
  // 将文件路径数组转换为逗号分隔的字符串
  formData.filePath = filePaths.join(',')
}

// 表单验证规则
const formRules = {
  checkName: [
    { required: true, message: '请输入检查清单名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  industryType: [
    { required: true, message: '请输入适用行业类型', trigger: 'blur' }
  ],
  filePath: [
    { required: true, message: '请上传检查清单文件', trigger: 'change' }
  ]
}

const formRef = ref()
const loading = ref(false)

// 获取详情数据进行回显
const getDetail = async () => {
  try {
    loading.value = true
    const response = await getInspectCheck(Number(checklistId))
    if (response) {
      // 回显数据到表单
      formData.checkName = response.checkName || ''
      formData.checkType = response.checkType || getCheckTypeValue()
      // 行业类型回显：后端返回逗号分隔字符串，例如 "A,01,011" => 转为数组
      formData.industryType = String(response.industryType || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter((s: string) => s !== '')
      formData.isDisplayed = response.isDisplayed ?? true
      formData.filePath = response.filePath || ''
      formData.remark = response.remark || ''

      console.log('编辑页面回显数据:', formData)
    }
  } catch (error) {
    console.error('获取检查清单详情失败:', error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}



// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    // 构建提交数据
    const submitData: InspectCheckSaveReqVO = {
      id: formData.id,
      checkName: formData.checkName,
      checkType: formData.checkType,
      // 行业类型：提交为逗号分隔的字符串，例如 "A,01,011"
      industryType: Array.isArray(formData.industryType)
        ? formData.industryType.join(',')
        : String(formData.industryType || ''),
      isDisplayed: formData.isDisplayed,
      filePath: formData.filePath,
      remark: formData.remark
    }

    console.log('编辑提交数据:', submitData)

    // 调用更新接口
    await updateInspectCheck(submitData)
    ElMessage.success('更新成功')
    handleCancel()
  } catch (error) {
    console.error('更新失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    loading.value = false
  }
}

// 返回
const handleBack = () => {
  router.back()
}

// 取消
const handleCancel = () => {
  router.back()
}

// 页面加载时初始化
onMounted(() => {
  console.log('检查清单类型:', checklistType, 'ID:', checklistId)
  getDetail()
})
</script>

<style scoped>
.checklist-edit-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.top-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 8px 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.left-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-divider {
  width: 1px;
  height: 16px;
  background-color: #e4e7ed;
  margin: 0 8px;
}

.action-text {
  color: #333;
  font-size: 14px;
}

.form-card {
  width: 100%;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.checklist-form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  white-space: nowrap;
}

:deep(.el-form-item) {
  width: 100%;
  max-width: 600px;
}

:deep(.el-textarea__inner) {
  font-family: 'Courier New', monospace;
}
</style> 