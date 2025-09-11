<template>
  <div class="checklist-add-container">
    <!-- 顶部操作栏 -->
    <div class="top-action-bar">
      <div class="left-actions">
        <el-button @click="handleBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <div class="action-divider"></div>
        <span class="action-text">
          新增
        </span>
      </div>

    </div>

    <el-card class="form-card" shadow="never">
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
            :props="{
              checkStrictly: true
            }"
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
            :file-type="['xls', 'xlsx']"
            @update:model-value="handleFileUpload"
          />
          <el-button link type="primary" @click="downloadTemplate">下载模板</el-button>
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
            保存
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { createInspectCheck, type InspectCheckSaveReqVO } from '@/api/supervisoryInspect/checklist'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import axios from 'axios'
import { saveAs } from 'file-saver'
import { categoryData } from 'element-china-category-data'

const route = useRoute()
const router = useRouter()

// 获取路由参数
const checklistType = route.params.type as string

// 根据类型计算页面标题和占位符
const pageTitle = computed(() => {
  const titles = {
    industrySector: '添加行业领域检查清单',
    special: '添加专项检查清单',
    majorHiddenDangers: '添加重大隐患检查清单'
  }
  return titles[checklistType] || '添加检查清单'
})

const namePlaceholder = computed(() => {
  const placeholders = {
    industrySector: '请输入行业领域检查清单名称',
    special: '请输入专项检查清单名称',
    majorHiddenDangers: '请输入重大隐患检查清单名称'
  }
  return placeholders[checklistType] || '请输入检查清单名称'
})

// 根据路由类型计算 checkType 值
const getCheckTypeValue = () => {
  const typeMap = {
    industrySector: 1,        // 行业领域
    special: 2,               // 专项
    majorHiddenDangers: 3     // 重大隐患
  }

  const checkType = typeMap[checklistType] || 1
  console.log('路由参数 checklistType:', checklistType, '-> checkType:', checkType)

  return checkType
}

// 表单数据
const formData = reactive({
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

// 处理文件上传（组件在 limit=1 时会回传字符串，这里同时兼容数组/字符串）
const handleFileUpload = (filePaths: string[] | string) => {
  formData.filePath = Array.isArray(filePaths) ? filePaths.join(',') : (filePaths || '')
  // 触发该字段校验，清除“请上传检查清单文件”的提示
  nextTick(() => {
    formRef.value?.validateField('filePath')
  })
}

// 下载模板
const TEMPLATE_URL = '/templates/checklist-template.xlsx'
const downloadTemplate = () => {
  const a = document.createElement('a')
  a.href = TEMPLATE_URL
  a.download = '检查清单模板.xlsx'
  a.click()
}

// 表单验证规则
const formRules = {
  checkName: [
    { required: true, message: '请输入检查清单名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  industryType: [
    { required: true, message: '请选择适用行业类型', trigger: 'change' }
  ],
  filePath: [
    { required: true, message: '请上传检查清单文件', trigger: 'change' }
  ]
}

const formRef = ref()
const loading = ref(false)

// 提交表单
const handleSubmit = async () => {
  
  try {
    // 统一使用表单校验；当校验失败时给出明确提示并中止提交
    const valid = await formRef.value?.validate().catch((fields: Record<string, any>) => {
      const order = ['checkName', 'industryType', 'filePath']
      let msg = '请完善表单信息'
      let fieldToScroll = ''
      for (const key of order) {
        if (fields?.[key]?.[0]?.message) {
          msg = fields[key][0].message
          fieldToScroll = key
          break
        }
      }
      if (!fieldToScroll) {
        const anyKey = Object.keys(fields || {})[0]
        if (anyKey && fields[anyKey]?.[0]?.message) {
          msg = fields[anyKey][0].message
          fieldToScroll = anyKey
        }
      }
      formRef.value?.scrollToField?.(fieldToScroll)
      ElMessage.error(msg)
      return false
    })
    if (!valid) return
    loading.value = true

    // 构建提交数据
    const submitData: InspectCheckSaveReqVO = {
      checkName: formData.checkName,
      checkType: formData.checkType,
      // 行业类型：提交为逗号分隔的字符串，例如 "E,49"
      industryType: Array.isArray(formData.industryType)
        ? formData.industryType.filter((s: any) => String(s).trim() !== '').join(',')
        : String(formData.industryType || ''),
      isDisplayed: formData.isDisplayed,
      filePath: formData.filePath,
      remark: formData.remark
    }

    // 调试：提交前打印数据
    console.log('提交数据:', submitData)

    // 调用创建接口
    await createInspectCheck(submitData)
    ElMessage.success('保存成功')
    handleCancel()
  } catch (error) {
    console.error('保存失败:', error)

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
  console.log('检查清单类型:', checklistType)
  console.log('路由参数:', route.params)
  console.log('formData.checkType:', formData.checkType)
})
</script>

<style scoped>
.checklist-add-container {
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

.center-info {
  display: flex;
  align-items: center;
}

.char-count {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
}

.right-actions {
  display: flex;
  align-items: center;
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

:deep(.el-form-item) {
  width: 100%;
  max-width: 600px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  white-space: nowrap;
}

:deep(.el-textarea__inner) {
  font-family: 'Courier New', monospace;
}

.upload-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}
</style> 