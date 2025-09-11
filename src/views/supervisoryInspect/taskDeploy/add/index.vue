<template>
  <div class="task-deploy-container">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="top-bar-left">
        <el-button @click="goBack" :icon="ArrowLeft" text>
          返回
        </el-button>
        <span style="margin: 0 16px; color: #dcdfe6;">|</span>
        <span class="top-bar-title">新增专项检查</span>
      </div>
      <div class="top-bar-right">
        <el-button v-if="activeStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="activeStep < 1" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-if="activeStep === 1" type="success" @click="submitForm">保存</el-button>
      </div>
    </div>

    <!-- 步骤条和内容区 -->
    <div class="content-area">
      <el-steps :active="activeStep" finish-status="success" align-center>
        <el-step title="填写任务基本信息" />
        <el-step title="添加检查任务" />
      </el-steps>

      <!-- 第一步表单调整 -->
      <div v-show="activeStep === 0" class="step-content">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" label-position="top">
          <el-form-item label="任务标题" prop="taskTitle">
            <el-input v-model="form.taskTitle" maxlength="50" show-word-limit placeholder="请输入任务标题" />
          </el-form-item>
          <el-form-item label="任务描述" prop="taskDescription">
            <el-input 
              v-model="form.taskDescription" 
              type="textarea" 
              maxlength="500" 
              show-word-limit 
              placeholder="请输入任务描述" 
            />
          </el-form-item>
          <el-form-item label="任务类型" prop="taskType">
            <el-select v-model="form.taskType" placeholder="请选择任务类型">
              <el-option label="专家指导" value="专项检查" />
              <el-option label="专项检查" value="专项检查" />
            </el-select>
          </el-form-item>

          <el-form-item label="检查开始日期" prop="inspectionStartTime">
            <el-date-picker 
              v-model="form.inspectionStartTime" 
              type="date" 
              placeholder="选择开始日期"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item label="检查结束日期" prop="inspectionEndTime">
            <el-date-picker 
              v-model="form.inspectionEndTime" 
              type="date" 
              placeholder="选择结束日期"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledEndDate"
            />
          </el-form-item>
        </el-form>
      </div>
      <!-- 第二步表单调整（检查任务明细） -->
      <div v-show="activeStep === 1" class="step-content">
        <el-tabs
          v-model="activeTaskTab"
          type="card"
          addable
          closable
          @tab-add="addTaskTab"
          @tab-remove="removeTaskTab"
        >
          <el-tab-pane
            v-for="(task, taskIndex) in inspectionTasks"
            :key="task.key"
            :label="task.label"
            :name="task.key"
          >
            <!-- 任务内容区 -->
            <!-- 下发方式 -->
            <el-form-item label="下发方式" required>
              <el-radio-group v-model="task.deliveryCheckType" @change="handleDeliveryTypeChange(task)">
                <el-radio :label="1">手动清单</el-radio>
                <el-radio :label="2">文件上传</el-radio>
                <el-radio :label="3">引用检查清单模版</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 根据下发方式显示不同内容 -->
            <template v-if="task.deliveryCheckType === 1">
              <!-- 手动清单 -->
              <div class="inspection-items">
                <div class="table-header">
                  <span>检查项目列表</span>
                  <!-- 点击时，传入当前任务的 key -->
                  <el-button type="primary" @click="openAddItemDialog(task.key)">添加检查项</el-button>
                </div>
                <el-table :data="task.inspectionTaskItemVOList" border>
                  <el-table-column label="序号" prop="serialNum" width="80" />
                  <el-table-column label="检查项目" prop="itemName" />
                  <el-table-column label="检查标准" prop="inspectionStandard" show-overflow-tooltip>
                    <!-- 使用 pre-wrap 保留换行符 -->
                    <template #default="scope">
                      <div style="white-space: pre-wrap;">{{ scope.row.inspectionStandard }}</div>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150">
                    <template #default="scope">
                      <!-- 编辑按钮，传入行数据、索引和任务key -->
                      <el-button link type="primary" @click="openEditItemDialog(scope.row, scope.$index, task.key)">编辑</el-button>
                      <el-button link type="danger" @click="removeInspectionItem(taskIndex, scope.$index)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>

            <template v-else-if="task.deliveryCheckType === 2">
              <!-- 文件上传 -->
              <UploadFile
                :model-value="getFilePathsArray(task.filePaths)"
                :limit="10"
                :file-size="50"
                :file-type="['doc', 'docx', 'pdf', 'xls', 'xlsx', 'txt']"
                @update:model-value="handleFileUpload(task.key, $event)"
              />
            </template>

            <template v-else-if="task.deliveryCheckType === 3">
              <!-- 模板引用 -->
              <InspectChecklistReference
                v-model:checkType="task.checkType"
                v-model:inspectionTaskVOList="task.inspectionTaskItemVOList"
                @checkTypeChange="handleCheckTypeChange(task.key, $event)"
              />
            </template>

            <!-- 企业选择 -->
            <div class="inspection-items">
              <div class="table-header">
                <span>计划检查企业</span>
                <el-button type="primary" @click="openCompanyDialog(task.key)">
                  选择系统企业
                </el-button>
              </div>
              <el-table :data="task.companyList" border>
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="name" label="企业名称" />
                <el-table-column prop="region" label="区域" />
                <el-table-column prop="contact" label="企业联系人" />
                <el-table-column prop="phone" label="联系方式" />
                <el-table-column prop="industry" label="行业监管部门" />
                <el-table-column label="操作" width="80">
                  <template #default="scope">
                    <el-button link type="danger" size="small" @click="removeCompany(task.key, scope.$index)">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 添加检查项目弹窗 -->
    <el-dialog 
      :title="dialogMode === 'edit' ? '编辑检查项目' : '添加检查项目'"
      v-model="addItemDialogVisible" 
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="itemForm" :rules="itemRules" ref="itemFormRef" label-width="100px">
        <el-form-item label="检查项目" prop="itemName" required>
          <el-input 
            v-model="itemForm.itemName" 
            placeholder="请输入" 
            type="textarea" 
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="检查标准" prop="inspectionStandard" required>
          <el-input 
            v-model="itemForm.inspectionStandard" 
            placeholder="请输入" 
            type="textarea" 
            :rows="5"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addItemDialogVisible = false">
          取消
          <el-icon style="margin-left: 4px;"><Lightning /></el-icon>
        </el-button>
        <el-button type="primary" @click="saveInspectionItem">
          保存
          <el-icon style="margin-left: 4px;"><Lightning /></el-icon>
        </el-button>
      </template>
    </el-dialog>

    <!-- 企业选择弹窗 -->
    <el-dialog v-model="companyDialogVisible" title="添加检查企业" width="90%" top="5vh">
      <!-- 查询条件区 -->
      <div style="margin-bottom: 16px;">
        <el-input v-model="companyQuery.name" placeholder="企业名称" style="width: 200px; margin-right: 8px;" />
        <el-select v-model="companyQuery.riskLevel" placeholder="风险等级" clearable style="width: 120px; margin-right: 8px;">
          <el-option label="红色" value="红" />
          <el-option label="橙色" value="橙" />
          <el-option label="黄色" value="黄" />
          <el-option label="蓝色" value="蓝" />
        </el-select>
        <el-button type="primary" @click="fetchCompanyList">查询</el-button>
        <el-button @click="resetCompanyQuery">重置</el-button>
      </div>
      <!-- 企业表格 -->
      <el-table
        :data="companyList"
        border
        style="width: 100%;"
        @selection-change="handleCompanySelection"
        :row-key="row => row.id"
        ref="companyTableRef"
        v-loading="loadingCompany"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="企业名称" />
        <el-table-column prop="code" label="统一信用代码" />
        <el-table-column prop="region" label="区域" />
        <el-table-column prop="contact" label="联系人" />
        <el-table-column prop="industry" label="行业监管部门" />
        <!-- 其他列... -->
      </el-table>
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="companyPage.current"
        v-model:page-size="companyPage.size"
        :total="companyPage.total"
        @current-change="fetchCompanyList"
        @size-change="fetchCompanyList"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; text-align: right;"
      />
      <!-- 已选企业统计 -->
      <div style="margin-top: 8px;">已选企业：{{ companySelection.length }}</div>
      <template #footer>
        <el-button @click="companyDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmCompanySelection">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { Lightning } from '@element-plus/icons-vue'
import { Plus } from '@element-plus/icons-vue' // 引入 Plus 图标
import { ElMessage, ElMessageBox } from 'element-plus'
import { createInspectionTaskBatch, type InspectionTaskSaveVO } from '@/api/supervisoryInspect/taskDeploy'
import { getCompanyPage, type CompanyPageReqVO } from '@/api/enterpriseArchives'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import InspectChecklistReference from '../InspectChecklistReference/index.vue'

const router = useRouter()

const activeStep = ref(0)
const formRef = ref()
// 表单数据结构调整
const form = reactive({
  taskTitle: '', // 任务标题
  taskDescription: '', // 任务描述
  taskType: '', // 任务类型
  inspectionStartTime: '', // 检查开始日期
  inspectionEndTime: '', // 检查结束日期
  inspectionTaskVOList: [] // 检查任务明细列表
})
const rules = {
  taskTitle: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  taskDescription: [{ required: true, message: '请输入任务描述', trigger: 'blur' }],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  inspectionStartTime: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  inspectionEndTime: [
    { required: true, message: '请选择结束日期', trigger: 'change' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (value && form.inspectionStartTime && value < form.inspectionStartTime) {
          callback(new Error('结束日期不能早于开始日期'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ]
}
const goBack = () => router.back()

// 禁用结束日期选择器中的日期（早于开始日期的日期）
const disabledEndDate = (time: Date) => {
  if (!form.inspectionStartTime) {
    return false // 如果没有选择开始日期，不禁用任何日期
  }
  const startDate = new Date(form.inspectionStartTime)
  return time.getTime() < startDate.getTime()
}

const nextStep = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) activeStep.value++
  })
}
const prevStep = () => activeStep.value--
// 提交方法修改
const submitForm = async () => {
  try {
    // 先验证基本表单
    const isFormValid = await formRef.value.validate().catch(() => false)
    if (!isFormValid) {
      ElMessage.error('请完善基本信息')
      return
    }

    // 验证检查任务列表
    if (!inspectionTasks.value || inspectionTasks.value.length === 0) {
      ElMessage.error('请至少添加一个检查任务')
      return
    }

    // 验证每个检查任务的必填项
    for (let i = 0; i < inspectionTasks.value.length; i++) {
      const task = inspectionTasks.value[i]

      if (task.deliveryCheckType === 1) {
        // 下发类型为1（检查清单）：检查项目列表必填
        if (!task.inspectionTaskItemVOList || task.inspectionTaskItemVOList.length === 0) {
          ElMessage.error(`检查任务${i + 1}：下发类型为检查清单时，检查项目列表不能为空`)
          return
        }
      } else if (task.deliveryCheckType === 2) {
        // 下发类型为2（检查清单文件）：文件路径必填
        const hasFiles = (task.filePaths && task.filePaths.length > 0) || (task.filePaths && task.filePaths.length === 0 && task.fileList && task.fileList.length > 0)
        if (!hasFiles) {
          ElMessage.error(`检查任务${i + 1}：下发类型为检查清单文件时，文件路径不能为空`)
          return
        }
      } else if (task.deliveryCheckType === 3) {
        // 下发类型为3（引用检查清单模版）：检查清单类型和检查项目列表必填
        if (!task.checkType) {
          ElMessage.error(`检查任务${i + 1}：下发类型为引用检查清单模版时，检查清单类型不能为空`)
          return
        }
        if (!task.inspectionTaskItemVOList || task.inspectionTaskItemVOList.length === 0) {
          ElMessage.error(`检查任务${i + 1}：下发类型为引用检查清单模版时，检查项目列表不能为空`)
          return
        }
      }
      // 企业列表必填校验
      if (!task.compIdList || task.compIdList.length === 0) {
        ElMessage.error(`检查任务${i + 1}：请至少选择一家计划检查企业`)
        return
      }
    }

    // 构造提交数据
    const submitData: InspectionTaskSaveVO = {
      taskTitle: form.taskTitle,
      taskDescription: form.taskDescription,
      taskType: form.taskType,
      inspectionStartTime: form.inspectionStartTime,
      inspectionEndTime: form.inspectionEndTime,
      inspectionTaskVOList: inspectionTasks.value.map(task => {
        // 处理文件路径：如果有fileList，将其转换为逗号分隔的字符串
        let filePaths = task.filePaths || ''
        if (task.fileList && task.fileList.length > 0) {
          filePaths = task.fileList.map(file => file.url || file.name).join(',')
        }

        // 根据下发类型设置参数，但始终包含 filePaths 和 checkType 字段
        let checkType = ''
        // 新的文件路径对象数组
        let filePathObjects: Array<{ fileName: string; filePath: string }> = []

        if (task.deliveryCheckType === 1) {
          // 下发类型为1（检查清单）：checkType为空字符串，filePaths为空数组
          checkType = ''
          filePathObjects = []
        } else if (task.deliveryCheckType === 2) {
          // 下发类型为2（检查清单文件）：filePaths为对象数组，checkType为空字符串
          checkType = ''
          const urls = (filePaths || '')
            .split(',')
            .map(u => u.trim())
            .filter(u => !!u)
          filePathObjects = urls.map(u => ({
            fileName: u.substring(u.lastIndexOf('/') + 1) || '文件',
            filePath: u
          }))
        } else if (task.deliveryCheckType === 3) {
          // 下发类型为3（引用检查清单模版）：checkType必填，filePaths为空数组
          checkType = task.checkType ? task.checkType.toString() : ''
          filePathObjects = []
        }

        return {
          deliveryCheckType: task.deliveryCheckType,
          filePaths: filePathObjects,
          checkType: checkType,
          inspectionTaskItemVOList: task.inspectionTaskItemVOList || undefined,
          compIdList: task.compIdList || undefined
        }
      })
    }

    console.log('=== 提交表单数据 ===', submitData)

    // 调用API接口
    const response = await createInspectionTaskBatch(submitData)

    if (response) {
      ElMessage.success('专项检查任务创建成功！')
      // 返回列表页面
      router.push('/supervisoryInspect/taskDeploy')
    }
  } catch (error) {
    console.error('创建专项检查任务失败:', error)
    ElMessage.error('创建失败，请检查数据后重试')
  }
}

// 任务tab数据结构
const inspectionTasks = ref([
  {
    key: 'task-1',
    label: '检查任务1',
    deliveryCheckType: 1,
    filePaths: '',
    fileList: [],
    checkType: '',
    inspectionTaskItemVOList: [],
    compIdList: [],
    companyList: []
  }
])

// 用一个数组记录所有展开面板的 key
const activeCollapseNames = ref(['task-0']) // 默认展开第一个

// 任务tab相关
const activeTaskTab = ref('task-1')

// 进入第二步时自动选中第一个tab
watch(() => activeStep.value, (val) => {
  if (val === 1 && inspectionTasks.value.length > 0) {
    activeTaskTab.value = inspectionTasks.value[0].key
  }
})

// 监听开始日期变化，如果结束日期早于开始日期则清空结束日期
watch(() => form.inspectionStartTime, (newStartTime) => {
  if (newStartTime && form.inspectionEndTime) {
    const startDate = new Date(newStartTime)
    const endDate = new Date(form.inspectionEndTime)
    if (endDate < startDate) {
      form.inspectionEndTime = ''
      ElMessage.warning('开始日期已更改，结束日期已清空，请重新选择')
    }
  }
})

const addTaskTab = () => {
  const idx = inspectionTasks.value.length + 1
  const key = `task-${idx}`
  inspectionTasks.value.push({
    key,
    label: `检查任务${idx}`,
    deliveryCheckType: 1,
    filePaths: '',
    fileList: [],
    checkType: '',
    inspectionTaskItemVOList: [],
    compIdList: [],
    companyList: []
  })
  activeTaskTab.value = key // 新增后自动选中新tab
}

const removeTaskTab = (targetKey: string) => {
  const idx = inspectionTasks.value.findIndex(t => t.key === targetKey)
  if (idx !== -1) {
    inspectionTasks.value.splice(idx, 1)
    if (activeTaskTab.value === targetKey) {
      activeTaskTab.value = inspectionTasks.value[0]?.key || ''
    }
  }
}

const addNewTask = () => {
  const newIndex = inspectionTasks.value.length
  const newTaskKey = `task-${newIndex}`
  inspectionTasks.value.push({
    key: newTaskKey,
    label: `检查任务 ${newIndex + 1}`,
    deliveryCheckType: 1,
    filePaths: '',
    checkType: undefined,
    inspectionTaskItemVOList: [],
    compIdList: [],
    companyList: []
  })
  // 将新任务的 key 添加到展开数组中，使其自动展开
  activeCollapseNames.value.push(newTaskKey)
}

// 删除一个任务
const removeTask = (taskKey: string) => {
  const index = inspectionTasks.value.findIndex(t => t.key === taskKey)
  if (index !== -1) {
    inspectionTasks.value.splice(index, 1)
    // 同时从展开数组中移除
    const collapseIdx = activeCollapseNames.value.indexOf(taskKey)
    if (collapseIdx !== -1) {
      activeCollapseNames.value.splice(collapseIdx, 1)
    }
  }
}

const selectCompany = (taskIdx: number) => {
  // 打开企业选择弹窗，选中后 push 到当前 tab 的 companyList
  // 这里只做演示
  const curTask = inspectionTasks.value[taskIdx]
  curTask.compIdList.push({
    name: '企业名称示例',
    region: '区域示例',
    contact: '联系人示例',
    phone: '123456789',
    industry: '行业监管部门示例'
  })
}

// 弹窗相关
const addItemDialogVisible = ref(false)
const itemFormRef = ref()
const currentEditIndex = ref(-1) // -1表示新增，>=0表示编辑
const dialogMode = ref('add') // 'add' 或 'edit'
const currentTaskKeyForDialog = ref('') // 用于存储当前弹窗对应的任务key

const itemForm = reactive({
  itemName: '',
  inspectionStandard: ''
})

const itemRules = {
  itemName: [{ required: true, message: '请输入检查项目', trigger: 'blur' }],
  inspectionStandard: [{ required: true, message: '请输入检查标准', trigger: 'blur' }]
}

// 打开添加弹窗
const openAddItemDialog = (tabKey: string) => {
  activeCollapseNames.value = [tabKey] // 确保指向当前tab
  itemForm.itemName = ''
  itemForm.inspectionStandard = ''
  currentEditIndex.value = -1
  dialogMode.value = 'add'
  currentTaskKeyForDialog.value = tabKey
  addItemDialogVisible.value = true
}

// 打开"编辑"弹窗
const openEditItemDialog = (row: any, index: number, taskKey: string) => {
  dialogMode.value = 'edit'
  currentTaskKeyForDialog.value = taskKey
  currentEditIndex.value = index
  // 填充表单数据
  itemForm.itemName = row.itemName
  itemForm.inspectionStandard = row.inspectionStandard
  addItemDialogVisible.value = true
}

// 保存检查项目
const saveInspectionItem = () => {
  itemFormRef.value.validate((valid) => {
    if (valid) {
      const currentTask = inspectionTasks.value.find(t => t.key === currentTaskKeyForDialog.value)
      if (!currentTask) {
        ElMessage.error('未找到当前任务')
        return
      }

      // 确保 inspectionTaskItemVOList 存在
      if (!currentTask.inspectionTaskItemVOList) {
        currentTask.inspectionTaskItemVOList = []
      }

      if (dialogMode.value === 'edit') {
        // 编辑模式
        const item = currentTask.inspectionTaskItemVOList[currentEditIndex.value]
        if (item) {
          item.itemName = itemForm.itemName
          item.inspectionStandard = itemForm.inspectionStandard
        }
      } else {
        // 新增模式
        const serialNum = currentTask.inspectionTaskItemVOList.length + 1
        currentTask.inspectionTaskItemVOList.push({
          serialNum,
          itemName: itemForm.itemName,
          inspectionStandard: itemForm.inspectionStandard
        })
      }
      
      addItemDialogVisible.value = false
      ElMessage.success(dialogMode.value === 'edit' ? '编辑成功' : '添加成功')
    }
  })
}

// 处理下发方式变化
const handleDeliveryTypeChange = (task: any) => {
  // 当切换到引用检查清单模版时，清空手动添加的检查项目
  if (task.deliveryCheckType === 3) {
    task.inspectionTaskItemVOList = []
    task.checkType = undefined
    ElMessage.info('已切换到引用模版模式，手动添加的检查项目已清空')
  }
  // 当切换到其他模式时，也清空检查项目列表
  else if (task.deliveryCheckType === 1 || task.deliveryCheckType === 2) {
    task.inspectionTaskItemVOList = []
    task.checkType = undefined
  }
}

// 删除检查项目
const removeInspectionItem = (taskIdx: number, itemIdx: number) => {
  const task = inspectionTasks.value[taskIdx]
  if (task && task.inspectionTaskItemVOList && task.inspectionTaskItemVOList.length > itemIdx) {
    task.inspectionTaskItemVOList.splice(itemIdx, 1)
    // 重新计算序号
    task.inspectionTaskItemVOList.forEach((item, idx) => {
      item.serialNum = idx + 1
    })
    ElMessage.success('删除成功')
  } else {
    ElMessage.error('删除失败：数据异常')
  }
}

const companyDialogVisible = ref(false)
const companyList = ref([]) // 当前页企业数据
const companyQuery = reactive({
  name: '',
  riskLevel: ''
})
const companyPage = reactive({ current: 1, size: 10, total: 0 })
const companySelection = ref([]) // 弹窗中已勾选企业
const companyTableRef = ref() // 用于获取企业表格实例
const loadingCompany = ref(false) // 企业列表加载状态
const currentEditingTaskKey = ref('') // 当前正在编辑企业的任务key

const openCompanyDialog = (taskKey: string) => {
  currentEditingTaskKey.value = taskKey
  companyDialogVisible.value = true

  // 根据当前任务加载已选企业
  const currentTask = inspectionTasks.value.find(task => task.key === taskKey)
  if (currentTask && currentTask.companyList) {
    companySelection.value = [...currentTask.companyList]
  } else {
    companySelection.value = []
  }

  fetchCompanyList()
}

const fetchCompanyList = async () => {
  try {
    loadingCompany.value = true

    // 构建查询参数
    const params: CompanyPageReqVO = {
      pageNo: companyPage.current.toString(),
      pageSize: companyPage.size.toString(),
      enterpriseName: companyQuery.name || undefined,
      riskLevel: companyQuery.riskLevel || undefined
    }

    // 调用API接口
    const response = await getCompanyPage(params)

    if (response && response.list) {
      // 将API返回的数据映射到表格需要的格式
      companyList.value = response.list.map(item => ({
        id: item.id,
        name: item.enterpriseName || item.companyname || '',
        code: item.creditCode || '',
        region: item.registerAddress || '',
        contact: item.principal || '',
        phone: item.phone || '',
        industry: item.regulatoryDepartment || '',
        // 保留原始数据以便后续使用
        ...item
      }))
      companyPage.total = response.total || 0

      // 设置表格选中状态
      setTimeout(() => {
        if (companyTableRef.value && companySelection.value.length > 0) {
          companySelection.value.forEach(selectedCompany => {
            const foundCompany = companyList.value.find(company => company.id === selectedCompany.id)
            if (foundCompany) {
              companyTableRef.value.toggleRowSelection(foundCompany, true)
            }
          })
        }
      }, 100)
    } else {
      companyList.value = []
      companyPage.total = 0
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败，请稍后重试')
    companyList.value = []
    companyPage.total = 0
  } finally {
    loadingCompany.value = false
  }
}

const resetCompanyQuery = () => {
  companyQuery.name = ''
  companyQuery.riskLevel = ''
  // 重置分页到第一页
  companyPage.current = 1
  fetchCompanyList()
}

const handleCompanySelection = (selection) => {
  companySelection.value = selection
}

const confirmCompanySelection = () => {
  // 将选中的企业保存到当前正在编辑的任务中
  const currentTask = inspectionTasks.value.find(t => t.key === currentEditingTaskKey.value)
  if (currentTask) {
    currentTask.compIdList = companySelection.value.map(c => c.id.toString())
    currentTask.companyList = [...companySelection.value]
  }

  companyDialogVisible.value = false
  currentEditingTaskKey.value = ''
}

// 从指定任务中移除企业
const removeCompany = (taskKey: string, idx: number) => {
  const task = inspectionTasks.value.find(t => t.key === taskKey)
  if (task && task.companyList) {
    task.companyList.splice(idx, 1)
    // 同步更新 compIdList
    task.compIdList = task.companyList.map(c => c.id.toString())
  }
}

// 将逗号分隔的字符串转换为数组，供 UploadFile 组件使用
const getFilePathsArray = (filePaths: string): string[] => {
  if (!filePaths || filePaths.trim() === '') {
    return []
  }
  return filePaths.split(',').filter(path => path.trim() !== '')
}

// 处理文件上传
const handleFileUpload = (taskKey: string, filePaths: string[]) => {
  const task = inspectionTasks.value.find(t => t.key === taskKey)
  if (task) {
    // 将文件路径数组转换为逗号分隔的字符串
    task.filePaths = filePaths.join(',')

  }
}

// 处理检查清单类型变化
const handleCheckTypeChange = (taskKey: string, checkType: number) => {
  const task = inspectionTasks.value.find(t => t.key === taskKey)
  if (task) {
    task.checkType = checkType
    console.log(`任务 ${taskKey} 的检查清单类型已更新为:`, checkType)
  }
}
</script>

<style scoped>
.task-deploy-container {
  min-height: 100vh;
  background: #f5f6fa;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 32px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
  width: 100%;
}
.top-bar-title {
  font-size: 18px;
  font-weight: 600;
  margin-left: 8px;
}
.content-area {
  margin: 10px 10px 0 10px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.step-content {
  margin-top: 32px;
}

/* 步骤条样式调整 */
.content-area :deep(.el-steps) {
  margin: 0 0 24px 0;
  padding: 0;
}
.back-area:hover {
  color: #409eff;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

/* 检查项目容器样式 */
.inspection-items {
  margin: 16px 0;
  padding: 0;
}

/* 确保两个表格宽度一致且靠左对齐 */
.inspection-items .el-table,
.el-dialog .el-table,
.step-content .el-table {
  width: 100% !important;
  margin: 0;
}

/* 检查项目列表标题样式 */
.table-header span {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
/* 增加检查任务的加号按钮样式 */
.content-area :deep(.el-tabs__new-tab) {
  color: #fff !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border: 1px solid #409eff !important;
  border-radius: 4px !important;
  width: auto !important;
  height: 32px !important;
  line-height: 30px !important;
  padding: 0 12px !important;
  background: #409eff !important;
  margin-left: 8px !important;
}

.content-area :deep(.el-tabs__new-tab::before) {
  content: "增加检查任务" !important;
  font-size: 12px !important;
}

.content-area :deep(.el-tabs__new-tab:hover) {
  background-color: #66b1ff !important;
  color: #fff !important;
  border-color: #66b1ff !important;
}

</style>