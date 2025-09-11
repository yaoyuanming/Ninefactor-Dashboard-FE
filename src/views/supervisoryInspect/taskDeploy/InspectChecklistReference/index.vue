<template>
  <div class="checklist-reference">
    <!-- 检查清单类型选择 -->
    <el-form-item label="检查清单类型" prop="checkType">
      <div class="flex items-center gap-4">
        <el-select 
          v-model="localCheckType" 
          placeholder="请选择检查清单类型"
          style="width: 200px"
          @change="handleCheckTypeChange"
        >
          <el-option label="行业领域" :value="1" />
          <el-option label="专项" :value="2" />
          <el-option label="重大隐患" :value="3" />
        </el-select>
        
        <el-button 
          type="primary" 
          @click="openChecklistDialog"
          :disabled="!localCheckType"
        >
          引用清单
        </el-button>
      </div>
    </el-form-item>

    <!-- 检查项目列表 -->
    <el-form-item  v-if="inspectionList.length > 0">
      <div class="inspection-list">
        <div class="list-header">
          <span class="title">检查项目列表</span>
          <div class="header-actions">
            <!-- 只在手动模式下显示添加按钮 -->
            <el-button
              v-if="dataSource === 'manual'"
              type="primary"
              size="small"
              @click="addInspectionItem"
            >
              添加检查项
            </el-button>
            <!-- 清空按钮 -->
            <el-button
              v-if="inspectionList.length > 0"
              type="danger"
              size="small"
              @click="clearInspectionList"
            >
              清空列表
            </el-button>
          </div>
        </div>
        
        <el-table :data="inspectionList" border style="width: 100%">
          <el-table-column prop="serialNum" label="序号" width="80" align="center" />
          <el-table-column prop="itemName" label="检查项目" min-width="200" show-overflow-tooltip />
          <el-table-column prop="inspectionStandard" label="检查标准" min-width="300" show-overflow-tooltip />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ $index }">
              <el-button
                type="danger"
                size="small"
                @click="removeInspectionItem($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form-item>

    <!-- 检查清单选择弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="检查清单库"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="checklist-dialog">
        <!-- 搜索区域 -->
        <div class="search-area">
          <el-form :model="searchForm" inline>
            <el-form-item label="检查清单名称">
              <el-input 
                v-model="searchForm.checkName" 
                placeholder="请输入检查清单名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item label="适用行业类型">
              <el-input 
                v-model="searchForm.industryType" 
                placeholder="请输入适用行业类型"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchChecklists">搜索</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 检查清单列表 -->
        <el-table
          ref="checklistTableRef"
          :data="checklistData"
          border
          style="width: 100%"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="checkName" label="检查清单名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="industryType" label="适用行业类型" width="150" />
          <el-table-column prop="uploadDepName" label="上传部门" width="150" />
          <el-table-column prop="isDisplayed" label="是否在企业端展示" width="150" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isDisplayed ? 'success' : 'info'">
                {{ row.isDisplayed ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="配置时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="handleDetail(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.pageNo"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmSelection"
            :disabled="selectedChecklists.length === 0"
            :loading="loading"
          >
            确定引用 ({{ selectedChecklists.length }})
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 检查清单详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`检查清单内容 - ${currentChecklistDetail.checkName}`"
      width="70%"
      :close-on-click-modal="false"
    >
      <div class="checklist-detail">
        <!-- 基本信息 -->
        <div class="detail-header">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="检查清单名称">
              {{ currentChecklistDetail.checkName }}
            </el-descriptions-item>
            <el-descriptions-item label="清单类型">
              <el-tag :type="getCheckTypeTagType(currentChecklistDetail.checkType)">
                {{ getCheckTypeText(currentChecklistDetail.checkType) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="适用行业类型">
              {{ currentChecklistDetail.industryType }}
            </el-descriptions-item>
            <el-descriptions-item label="上传部门">
              {{ currentChecklistDetail.uploadDepName }}
            </el-descriptions-item>
            <el-descriptions-item label="是否在企业端展示">
              <el-tag :type="currentChecklistDetail.isDisplayed ? 'success' : 'info'">
                {{ currentChecklistDetail.isDisplayed ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatTime(currentChecklistDetail.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 检查项目列表 -->
        <div class="detail-content">
          <div class="content-header">
            <h3>检查清单内容</h3>
            <span class="item-count">共 {{ currentChecklistDetail.itemList?.length || 0 }} 项</span>
          </div>

          <el-table
            :data="currentChecklistDetail.itemList"
            border
            style="width: 100%"
            max-height="400"
            v-loading="detailLoading"
          >
            <el-table-column
              prop="serialNum"
              label="序号"
              width="80"
              align="center"
            />
            <el-table-column
              prop="itemName"
              label="检查项目"
              min-width="200"
              show-overflow-tooltip
            />
            <el-table-column
              prop="inspectionStandard"
              label="检查标准"
              min-width="300"
              show-overflow-tooltip
            />
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInspectCheckPage, parseInspectCheckFile, getInspectCheck } from '@/api/supervisoryInspect/checklist'

// 定义组件属性
interface Props {
  checkType?: number
  inspectionTaskVOList?: any[]
}

// 定义事件
interface Emits {
  (e: 'update:checkType', value: number): void
  (e: 'update:inspectionTaskVOList', value: any[]): void
  (e: 'checkTypeChange', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  checkType: undefined,
  inspectionTaskVOList: () => []
})

const emit = defineEmits<Emits>()

// 路由实例
const router = useRouter()

// 本地数据
const localCheckType = ref(props.checkType)
const inspectionList = ref([...props.inspectionTaskVOList])

// 数据来源标识 - 初始化时根据是否有数据来判断
const dataSource = ref(props.inspectionTaskVOList.length > 0 ? 'template' : 'manual')

// 弹窗相关
const dialogVisible = ref(false)
const loading = ref(false)
const selectedChecklists = ref([])

// 详情弹窗相关
const detailDialogVisible = ref(false)
const detailLoading = ref(false)
const currentChecklistDetail = ref({
  checkName: '',
  checkType: 1,
  industryType: '',
  uploadDepName: '',
  isDisplayed: true,
  createTime: undefined,
  itemList: []
})

// 搜索表单
const searchForm = reactive({
  checkName: '',
  industryType: ''
})

// 分页数据
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  total: 0
})

// 检查清单数据
const checklistData = ref([])
const checklistTableRef = ref()

// 监听属性变化
watch(() => props.checkType, (newVal) => {
  localCheckType.value = newVal
})

watch(() => props.inspectionTaskVOList, (newVal) => {
  inspectionList.value = [...newVal]
  // 根据数据来源重置状态
  if (newVal.length === 0) {
    dataSource.value = 'manual'
  }
}, { deep: true })

// 检查清单类型变化
const handleCheckTypeChange = (value: number) => {
  // 切换检查清单类型时，清空现有数据并重置为手动模式
  inspectionList.value = []
  dataSource.value = 'manual'
  emit('update:checkType', value)
  emit('update:inspectionTaskVOList', [])
  emit('checkTypeChange', value)
}

// 打开检查清单选择弹窗
const openChecklistDialog = () => {
  if (!localCheckType.value) {
    ElMessage.warning('请先选择检查清单类型')
    return
  }

  // 清空之前的选择
  selectedChecklists.value = []

  dialogVisible.value = true
  searchChecklists()
}

// 搜索检查清单
const searchChecklists = async () => {
  try {
    loading.value = true
    const params = {
      pageNo: pagination.pageNo,
      pageSize: pagination.pageSize,
      checkType: localCheckType.value,
      checkName: searchForm.checkName || undefined,
      industryType: searchForm.industryType || undefined
    }
    
    const response = await getInspectCheckPage(params)
    if (response) {
      checklistData.value = response.list || []
      pagination.total = response.total || 0
    }
  } catch (error) {
    console.error('获取检查清单列表失败:', error)
    ElMessage.error('获取检查清单列表失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.checkName = ''
  searchForm.industryType = ''
  pagination.pageNo = 1
  searchChecklists()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.pageNo = 1
  searchChecklists()
}

const handleCurrentChange = (page: number) => {
  pagination.pageNo = page
  searchChecklists()
}

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedChecklists.value = selection
}

// 选择检查清单
const selectChecklist = (row: any) => {
  const isSelected = selectedChecklists.value.some(item => item.id === row.id)
  checklistTableRef.value?.toggleRowSelection(row, !isSelected)
}

// 查看详情
const handleDetail = async (row: any) => {
  try {
    detailLoading.value = true
    detailDialogVisible.value = true

    // 调用详情接口获取完整数据
    const response = await getInspectCheck(row.id)
    if (response) {
      currentChecklistDetail.value = {
        checkName: response.checkName || '',
        checkType: response.checkType || 1,
        industryType: response.industryType || '',
        uploadDepName: response.uploadDepName || '',
        isDisplayed: response.isDisplayed ?? true,
        createTime: response.createTime,
        itemList: response.itemList || []
      }
      console.log('检查清单详情:', currentChecklistDetail.value)
    }
  } catch (error) {
    console.error('获取检查清单详情失败:', error)
    ElMessage.error('获取检查清单详情失败')
    detailDialogVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

// 确认选择
const confirmSelection = async () => {
  if (selectedChecklists.value.length === 0) {
    ElMessage.warning('请至少选择一个检查清单')
    return
  }

  try {
    loading.value = true

    // 批量解析检查清单文件
    const allInspectionItems = []
    let serialNum = 1

    for (const checklist of selectedChecklists.value) {
      try {
        console.log('正在解析检查清单:', checklist.checkName, '文件路径:', checklist.filePath)
        const response = await parseInspectCheckFile(checklist.filePath)

        if (response) {
          // 处理每个检查清单的数据
          const items = response.map((item: any) => ({
            serialNum: serialNum++,
            itemName: item.itemName || '',
            inspectionStandard: item.inspectionStandard || ''
          }))
          allInspectionItems.push(...items)
          console.log(`检查清单 "${checklist.checkName}" 解析成功，获得 ${items.length} 个检查项目`)
        } else {
          console.warn(`检查清单 "${checklist.checkName}" 解析结果为空或格式不正确`, response)
        }
      } catch (error) {
        console.error(`解析检查清单 "${checklist.checkName}" 失败:`, error)
        ElMessage.warning(`解析检查清单 "${checklist.checkName}" 失败，已跳过`)
      }
    }

    if (allInspectionItems.length > 0) {
      // 清空现有数据，设置为模板数据
      inspectionList.value = allInspectionItems
      dataSource.value = 'template'
      emit('update:inspectionTaskVOList', allInspectionItems)
      ElMessage.success(`引用检查清单成功，共获得 ${allInspectionItems.length} 个检查项目`)
      dialogVisible.value = false

      // 清空选择
      selectedChecklists.value = []
      checklistTableRef.value?.clearSelection()
    } else {
      ElMessage.error('所有检查清单解析失败，请检查文件格式')
    }
  } catch (error) {
    console.error('批量解析检查清单文件失败:', error)
    ElMessage.error('解析检查清单文件失败')
  } finally {
    loading.value = false
  }
}

// 添加检查项
const addInspectionItem = () => {
  // 如果当前是模板数据，先清空
  if (dataSource.value === 'template') {
    inspectionList.value = []
  }

  const newItem = {
    serialNum: inspectionList.value.length + 1,
    itemName: '',
    inspectionStandard: ''
  }
  inspectionList.value.push(newItem)
  dataSource.value = 'manual'
  emit('update:inspectionTaskVOList', inspectionList.value)
}

// 删除检查项
const removeInspectionItem = (index: number) => {
  inspectionList.value.splice(index, 1)
  // 重新排序
  inspectionList.value.forEach((item, idx) => {
    item.serialNum = idx + 1
  })
  emit('update:inspectionTaskVOList', inspectionList.value)
}

// 清空检查项目列表
const clearInspectionList = () => {
  inspectionList.value = []
  dataSource.value = 'manual'
  emit('update:inspectionTaskVOList', [])
  ElMessage.success('已清空检查项目列表')
}

// 格式化时间
const formatTime = (timestamp: number | Date | undefined): string => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取检查清单类型文本
const getCheckTypeText = (checkType: number): string => {
  const typeMap = {
    1: '行业领域',
    2: '专项',
    3: '重大隐患'
  }
  return typeMap[checkType] || '未知'
}

// 获取检查清单类型标签类型
const getCheckTypeTagType = (checkType: number): string => {
  const typeMap = {
    1: 'primary',
    2: 'success',
    3: 'warning'
  }
  return typeMap[checkType] || 'info'
}
</script>

<style scoped>
.checklist-reference {
  width: 100%;
}

.inspection-list {
  width: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.checklist-dialog {
  width: 100%;
}

.search-area {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

/* 详情弹窗样式 */
.checklist-detail {
  width: 100%;
}

.detail-header {
  margin-bottom: 24px;
}

.detail-content {
  width: 100%;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
}

.content-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.item-count {
  font-size: 14px;
  color: #666;
  background-color: #f0f2f5;
  padding: 4px 12px;
  border-radius: 12px;
}
</style>
