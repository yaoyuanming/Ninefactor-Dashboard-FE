<template>
  <div class="notice-create-container">
    <!-- 顶部操作区 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <el-button class="back-btn" circle @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="back-text" @click="goBack">返回</span>
        <span class="divider"></span>
        <span class="page-title">新建通知</span>
      </div>
      <div class="top-bar-right">
        <el-button v-if="activeStep === 1" @click="activeStep--">上一步</el-button>
        <el-button v-if="activeStep === 0" type="primary" @click="handleNextStep">下一步</el-button>
        <el-button v-if="activeStep === 1" @click="handleSave(false)" :loading="saving">保存草稿</el-button>
        <el-button v-if="activeStep === 1" type="primary" @click="handleSave(true)" :loading="publishing">发布</el-button>
      </div>
    </div>
    <!-- 步骤一 -->
    <div v-if="activeStep === 0" class="main-content">
      <div class="left-panel step1-left">
        <el-form label-width="60px" label-position="top">
          <el-form-item label="标题">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="紧急程度" class="urgent-row">
            <el-radio-group v-model="form.urgency">
              <el-radio-button label="普通" />
              <el-radio-button label="紧急" />
            </el-radio-group>
          </el-form-item>
        </el-form>
      </div>
      <div class="right-panel step1-right">
        <div class="notice-receive-area">
          <!-- 政府单位 -->
          <div class="receive-panel">
            <div class="panel-title">政府单位</div>
            <div class="panel-content">
              <div class="panel-tree">
                <el-tree
                  ref="deptTreeRef"
                  :data="deptTreeData"
                  show-checkbox
                  node-key="id"
                  :props="{ label: 'name', children: 'children' }"
                  @check="handleDeptCheck"
                  check-strictly
                  style="height: 400px; overflow: auto;"
                />
              </div>
              <div class="panel-selected">
                <div class="selected-title">已选单位 ({{ selectedDeptList.length }})</div>
                <div class="selected-list">
                  <div v-for="item in selectedDeptList" :key="item.id" class="selected-item">
                    {{ item.name }}
                    <el-icon @click="removeDept(item)"><Close /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- 管辖企业 -->
          <div class="receive-panel">
            <div class="panel-title">管辖企业</div>
            <div class="panel-content">
              <div class="panel-tree">
                <el-tree
                  ref="companyTreeRef"
                  :data="companyTreeData"
                  show-checkbox
                  node-key="id"
                  :props="{ label: 'enterpriseName', children: 'children' }"
                  @check="handleCompanyCheck"
                  check-strictly
                  style="height: 400px; overflow: auto;"
                />
              </div>
              <div class="panel-selected">
                <div class="selected-title">已选企业 ({{ selectedCompanyList.length }})</div>
                <div class="selected-list">
                  <div v-for="item in selectedCompanyList" :key="item.id" class="selected-item">
                    {{ item.enterpriseName }}
                    <el-icon @click="removeCompany(item)"><Close /></el-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 步骤二 -->
    <div v-if="activeStep === 1" class="main-content step2-vertical">
      <div class="content-section">
        <el-form label-width="60px" label-position="top" style="width: 100%;">
          <el-form-item label="内容" style="width: 100%;">
            <div style="width: 100%;">
              <QuillEditor
                v-model:content="form.content"
                contentType="html"
                style="min-height: 300px; width: 100%;"
                placeholder="请输入内容"
              />
            </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="upload-section">
        <div class="upload-title">附件上传</div>
        <UploadFile
          :model-value="getFilePathsArray(form.attachment)"
          :limit="5"
          :file-size="50"
          :file-type="['rar', 'zip', 'doc', 'docx', 'pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'xls', 'xlsx']"
          @update:model-value="handleFileUpload"
          class="custom-upload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { noticeReceiveCompanyPage, noticeCreate } from '@/api/workbenches/notice'
import { getCompanyPage } from '@/api/enterpriseArchives'
import { Close } from '@element-plus/icons-vue'
import { getSimpleDeptList } from '@/api/system/dept'
import { useUserStore } from '@/store/modules/user'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
  import { QuillEditor } from '@vueup/vue-quill'
   import '@vueup/vue-quill/dist/vue-quill.snow.css'

const activeStep = ref(0)
const form = ref({
  title: '',
  urgency: '普通',
  content: '',
  attachment: '' // 附件地址
})

// 加载状态
const saving = ref(false)
const publishing = ref(false)

// 用户信息
const userStore = useUserStore()

const router = useRouter()
const goBack = () => {
  router.back()
}

const companyList = ref<any[]>([])
const loadingCompany = ref(false)
const selectedCompanyIds = ref<any[]>([])

const loadCompanyList = async () => {
  loadingCompany.value = true
  try {
    const res = await getCompanyPage({ pageNo: '1', pageSize: '100' })
    if (res && res.list) {
      companyList.value = res.list
      // 企业数据是平级的，直接使用原始数据，不需要转换为树结构
      companyTreeData.value = res.list
    }
  } catch (e) {
    ElMessage.error('加载企业数据失败')
  } finally {
    loadingCompany.value = false
  }
}

const companyTreeData = ref<any[]>([])
const companyTreeRef = ref()

const handleCompanyCheck = () => {
  selectedCompanyList.value = companyTreeRef.value.getCheckedNodes()
}
const removeCompany = (item: any) => {
  companyTreeRef.value.setChecked(item.id, false, true)
  handleCompanyCheck()
}

const selectedCompanyList = ref<any[]>([])

function toTree(list, idKey = 'id', parentKey = 'parentId') {
  const map = {}
  const roots = []
  list.forEach(item => {
    map[item[idKey]] = { ...item, children: [] }
  })
  list.forEach(item => {
    const parentId = item[parentKey]
    if (parentId && parentId !== '0' && map[parentId]) {
      map[parentId].children.push(map[item[idKey]])
    } else {
      roots.push(map[item[idKey]])
    }
  })
  return roots
}

const deptTreeData = ref<any[]>([])
const deptTreeRef = ref()
const selectedDeptList = ref<any[]>([])

const loadDeptTree = async () => {
  try {
    const res = await getSimpleDeptList()
    if (res && Array.isArray(res)) {
      deptTreeData.value = toDeptTree(res)
    }
  } catch (e) {
    ElMessage.error('加载部门树失败')
  }
}

// 部门列表转树
function toDeptTree(list: any[]) {
  const map: Record<string, any> = {}
  const roots: any[] = []
  list.forEach(item => {
    map[item.id] = { ...item, children: [] }
  })
  list.forEach(item => {
    if (item.parentId && item.parentId !== 0 && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id])
    } else {
      roots.push(map[item.id])
    }
  })
  return roots
}

const handleDeptCheck = () => {
  selectedDeptList.value = deptTreeRef.value.getCheckedNodes()
}
const removeDept = (item: any) => {
  deptTreeRef.value.setChecked(item.id, false, true)
  handleDeptCheck()
}

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
  form.value.attachment = filePaths.join(',')
  console.log('附件地址更新:', form.value.attachment)
}


// 验证标题
const validateTitle = () => {
  if (!form.value.title || form.value.title.trim() === '') {
    ElMessage.error('请输入通知标题')
    return false
  }
  return true
}

// 验证内容
const validateContent = () => {
  if (!form.value.content || form.value.content.trim() === '') {
    ElMessage.error('请输入通知内容')
    return false
  }
  return true
}

// 验证选择的单位和企业
const validateSelection = () => {
  // 验证至少选择一个单位或企业
  if ((!selectedDeptList.value || selectedDeptList.value.length === 0) && 
      (!selectedCompanyList.value || selectedCompanyList.value.length === 0)) {
    ElMessage.error('请至少选择一个接收单位或企业')
    return false
  }

  return true
}

// 下一步验证（验证标题 + 选择的单位和企业）
const handleNextStep = () => {
  if (validateTitle() && validateSelection()) {
    activeStep.value++
  }
}

// 保存或发布
const handleSave = async (isPublish: boolean) => {
  // 验证标题
  if (!validateTitle()) {
    return
  }

  // 验证内容
  if (!validateContent()) {
    return
  }

  // 验证选择
  if (!validateSelection()) {
    return
  }

  try {
    if (isPublish) {
      publishing.value = true
    } else {
      saving.value = true
    }

    // 构建提交数据
    const user = userStore.getUser
    const submitData = {
      title: form.value.title.trim(),
      content: form.value.content.trim(),
      publisherId: user.id,
      publisherName: user.username,
      publisherDeptId: user.deptId,
      publisherDeptName: user.deptName,
      urgencyLevel: form.value.urgency === '紧急' ? 2 : 1,
      status: isPublish ? 1 : 0, // 0-未发布，1-已发布
      isPublish: isPublish,
      attachment: form.value.attachment, // 附件地址
      recordDepts: selectedDeptList.value.map(dept => dept.id).join(','),
      recordCompanyIds: selectedCompanyList.value.map(company => company.id).join(',')
    }

    console.log('提交数据:', submitData)
    console.log('附件地址:', submitData.attachment)

    // 调用创建接口
    await noticeCreate(submitData)

    ElMessage.success(isPublish ? '发布成功' : '保存成功')

    // 返回列表页
    router.back()

  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(isPublish ? '发布失败，请重试' : '保存失败，请重试')
  } finally {
    if (isPublish) {
      publishing.value = false
    } else {
      saving.value = false
    }
  }
}

onMounted(() => {
  loadCompanyList()
  loadDeptTree()
})
</script>

<style scoped lang="scss">
.notice-create-container {
  position: relative;
  min-height: 100vh;
}
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  margin-bottom: 16px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.top-bar-left {
  display: flex;
  align-items: center;
}
.back-btn {
  margin-right: 6px;
  font-size: 18px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.back-text {
  margin-right: 16px;
  font-size: 18px;
  cursor: pointer;
  user-select: none;
}
.divider {
  width: 2px;
  height: 32px;
  background: #e0e0e0;
  margin-right: 16px;
}
.page-title {
  font-size: 16px;
 
}
.top-bar-right {
  display: flex;
  gap: 12px;
}
.main-content {
  display: flex;
  height: calc(100vh - 120px);
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}
.left-panel, .right-panel {
  transition: width 0.2s;
}
.step1-left {
  width: 340px;
  min-width: 220px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}
.step1-right {
  flex: 1 1 0;
  min-width: 400px;
  padding: 0 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
  height: 100%;
  min-height: 100%;
}
.step2-left {
  width: calc(100% - 300px);
  min-width: 400px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
}
.step2-right {
  width: 260px;
  min-width: 200px;
  padding: 0 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: #fff;
}

// 第二步上下布局样式
.step2-vertical {
  flex-direction: column !important;
  padding: 24px;
  gap: 24px;

  .content-section {
    width: 100%;
    background: #fafbfc;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
    padding: 20px;

    .el-form {
      width: 100%;
    }

    .el-form-item {
      margin-bottom: 0;
    }

    .el-textarea {
      width: 100%;
    }
  }
}
.panel-title {
  font-weight: bold;
  margin: 16px 0 12px 0;
}
.company-list {
  min-height: 220px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafbfc;
  padding: 8px;
  margin-bottom: 8px;
  max-height: 300px;
  overflow-y: auto;
}
.selected-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.selected-item {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 14px;
}
.selected-item .el-icon {
  margin-left: 8px;
  cursor: pointer;
}
.tree-select-placeholder {
  background: #fafafa;
  border: 1px dashed #d9d9d9;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
}
.upload-section {
  margin-top: 0;
  width: 100%;
  background: #fafbfc;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 20px;

  .upload-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  .custom-upload {
    width: 100%;

    // 优化文件列表显示
    :deep(.el-upload-list) {
      max-width: 100%;

      .el-upload-list__item {
        max-width: 100%;
        position: relative;
        margin-bottom: 8px;

        .el-upload-list__item-name {
          max-width: calc(100% - 80px); // 为操作按钮留出空间
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          vertical-align: middle;
          padding-right: 10px;
          word-break: break-all;
        }

        .el-upload-list__item-status-label {
          position: absolute;
          right: 30px;
          top: 50%;
          transform: translateY(-50%);
        }

        .el-upload-list__item-delete {
          position: absolute;
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }

    // 优化上传按钮区域
    :deep(.el-upload) {
      width: 100%;

      .el-upload-dragger {
        width: 100%;
        height: 100px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        background-color: #fafafa;

        .el-upload__text {
          font-size: 14px;
          color: #666;
        }

        .el-upload__tip {
          font-size: 12px;
          color: #999;
          margin-top: 8px;
        }
      }
    }
  }
}
.left-panel .el-form-item {
  align-items: center !important;
}
.left-panel .el-form-item__label {
  line-height: 32px;
  padding-right: 8px;
  min-width: 60px;
  text-align: right;
}
.left-panel .el-radio-group {
  vertical-align: middle;
}
.urgent-row .el-form-item__content {
  display: block;
  margin-top: 4px;
}
.urgent-row .el-radio-group {
  margin-left: 0;
}
.notice-receive-area {
  display: flex;
  gap: 10px;
  height: 100%;
  flex: 1;
  
  .receive-panel {
    flex: 1;
    width: 50%;
    background: #fafbfc;
    border-radius: 8px;
    padding: 20px;
    min-width: 300px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    
    .panel-title {
      font-weight: bold;
      margin-bottom: 16px;
      color: #333;
    }
    
    .panel-content {
      display: flex;
      gap: 24px;
      flex: 1;
      
      .panel-tree {
        flex: 1;
        width: 50%;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        padding: 16px;
        display: flex;
        flex-direction: column;
      }
      
      .panel-selected {
        width: 50%;
        min-width: 200px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        padding: 16px;
        display: flex;
        flex-direction: column;
        
        .selected-title {
          font-size: 14px;
          margin-bottom: 12px;
          color: #333;
        }
        
        .selected-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        
        .selected-item {
          display: flex;
          align-items: center;
          background: #f5f5f5;
          border-radius: 4px;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #e4e7ed;
        }
        
        .selected-item .el-icon {
          margin-left: 8px;
          cursor: pointer;
          color: #999;
          
          &:hover {
            color: #f56c6c;
          }
        }
      }
    }
  }
}
</style>