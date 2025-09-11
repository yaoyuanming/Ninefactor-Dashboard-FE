<template>
  <div class="region-management">
    <!-- 移除区域范围选择区域 -->

    <!-- 区域管理主区域 -->
    <el-card class="area-management-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">区域管理</span>
        </div>
      </template>
      
      <!-- 操作按钮区域 -->
      <div class="action-buttons">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          新增
        </el-button>
        <!-- <el-button @click="handleImport">指量导入</el-button>
        <el-button @click="handleExport">指量导出</el-button>
        <el-button type="danger" @click="handleBatchDelete">指呈删除</el-button> -->
      </div>

      <!-- 表格区域 -->
      <div class="table-container">
        <el-table
          :data="regionData"
          row-key="regionCode"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          border
          stripe
          v-loading="loading"
        >
          <!-- 移除多选列 -->
          <el-table-column prop="regionName" label="区域名称" min-width="200" />
          <el-table-column prop="regionCode" label="区域编码" min-width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.status === 1" type="success" size="small">
                启用
              </el-tag>
              <el-tag v-else-if="row.status === 0" type="danger" size="small">
                停用
              </el-tag>
              <span v-else>{{ row.status || '' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="orderNum" label="排序" width="80" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-link type="primary" @click="handleEdit(row)">编辑</el-link>
              <el-link type="danger" @click="handleDelete(row)" style="margin-left: 10px;">删除</el-link>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="区域名称" prop="regionName">
          <el-input v-model="formData.regionName" placeholder="请输入区域名称" />
        </el-form-item>
        <el-form-item label="区域编码" prop="regionCode">
          <el-input v-model="formData.regionCode" placeholder="请输入区域编码" />
        </el-form-item>
        <el-form-item label="上级区域" prop="parentCode">
          <el-tree-select
            v-model="formData.parentCode"
            :data="regionTreeData"
            :props="{ label: 'regionName', value: 'regionCode', children: 'children' }"
            placeholder="请选择上级区域"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="区域类型" prop="regionLevel">
          <el-select v-model="formData.regionLevel" placeholder="请选择区域层级">
            <el-option label="省" :value="1" />
            <el-option label="市" :value="2" />
            <el-option label="区/县" :value="3" />
            <el-option label="乡镇/街道" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="停用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" :max="999" />
        </el-form-item>
       
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { 
  createRegion, 
  updateRegion, 
  deleteRegion, 
  getRegionPage,
  getRegion,
  getRegionTree,
  exportRegionExcel,
  type RegionSaveReqVO,
  type RegionPageReqVO
} from '@/api/systemSettings/dataApplication/region'

// 响应式数据
// 移除 selectedLevels
const regionData = ref([])
// 移除 selectedRows
const dialogVisible = ref(false)
const dialogTitle = ref('新增区域')
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = reactive<RegionSaveReqVO>({
  id: undefined,
  regionCode: '',
  regionName: '',
  regionLevel: 1,
  parentCode: '0', // 没有父级时传 "0"
  orderNum: 0,
  status: 1 // 数字类型：1-启用，0-停用
})

// 表单验证规则
const formRules = {
  regionName: [
    { required: true, message: '请输入区域名称', trigger: 'blur' }
  ],
  regionCode: [
    { required: true, message: '请输入区域编码', trigger: 'blur' }
  ],
  regionLevel: [
    { required: true, message: '请选择区域类型', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 区域树形数据（用于上级区域选择）
const regionTreeData = ref([])

// 移除 handleLevelChange 和 filterRegionDataByLevel 方法

// 根据区域编码推断区域层级
const getRegionLevelFromCode = (code: string): number => {
  if (!code) return 1
  const codeLength = code.length
  // 根据编码长度推断层级：省级12位，市级12位，区级12位，乡镇12位
  if (codeLength === 12) {
    // 省级：前2位非0，后10位为0
    if (code.endsWith('0000000000')) return 1
    // 市级：前4位非0，后8位为0
    if (code.endsWith('00000000')) return 2
    // 区级：前6位非0，后6位为0
    if (code.endsWith('000000')) return 3
    // 乡镇：前9位非0，后3位为0
    if (code.endsWith('000')) return 4
  }
  return 1 // 默认省级
}

// 移除 handleSelectionChange 方法

const handleAdd = () => {
  dialogTitle.value = '新增区域'
  resetForm()
  // 确保在下一个事件循环中打开弹窗，让重置完全生效
  nextTick(() => {
    dialogVisible.value = true
  })
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑区域'
  // 将表格数据转换为表单数据格式
  Object.assign(formData, {
    id: Number(row.primaryId), // 转换为数字类型
    regionCode: row.regionCode,
    regionName: row.regionName,
    regionLevel: row.regionLevel || 1, 
    parentCode: row.parentCode,
    orderNum: row.orderNum,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  ElMessageBox.confirm(
    `确定要删除区域"${row.regionName || row.name}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteRegion(Number(row.primaryId)) // 使用 primaryId 作为删除ID
      ElMessage.success('删除成功')
      loadRegionTreeData() // 重新加载数据
    } catch (error: any) {
      console.error('删除失败:', error)
      const errorMsg = error?.response?.data?.msg || error?.message || '删除失败'
      ElMessage.error(errorMsg)
    }
  }).catch(() => {
    // 取消删除
  })
}

// 移除 handleBatchDelete 方法

const handleImport = () => {
  ElMessage.info('指量导入功能')
}

const handleExport = () => {
  ElMessage.info('指量导出功能')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    if (dialogTitle.value === '新增区域') {
      await createRegion(formData)
      ElMessage.success('新增成功')
    } else {
      await updateRegion(formData)
      ElMessage.success('编辑成功')
    }
    
    dialogVisible.value = false
    resetForm() // 清空表单
    loadRegionTreeData() // 重新加载数据
  } catch (error: any) {
    console.error('保存失败:', error)
    const errorMsg = error?.response?.data?.msg || error?.message || '保存失败'
    ElMessage.error(errorMsg)
  }
}

const handleCancel = () => {
  dialogVisible.value = false
  resetForm()
}

const handleDialogClose = () => {
  // 弹窗关闭时重置表单，确保下次打开时是干净的状态
  resetForm()
}

const resetForm = () => {
  // 先清除表单验证状态
  if (formRef.value) {
    formRef.value.clearValidate()
  }

  // 重置表单数据
  Object.assign(formData, {
    id: undefined,
    regionCode: '',
    regionName: '',
    regionLevel: 1,
    parentCode: '0', // 没有父级时传 "0"
    orderNum: 0,
    status: 1 // 数字类型：1-启用，0-停用
  })

  // 在下一个事件循环中重置字段，确保DOM已更新
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields()
    }
  })
}

// 初始化数据
onMounted(() => {
  loadRegionTreeData()
})

// 加载区域树数据
const loadRegionTreeData = async () => {
  loading.value = true
  try {
    const response = await getRegionTree()
    if (response) {
      const transformedData = transformRegionData(response)
      regionData.value = transformedData
      regionTreeData.value = transformedData
    }
  } catch (error: any) {
    console.error('加载区域数据失败:', error)
    ElMessage.error('加载区域数据失败')
  } finally {
    loading.value = false
  }
}

// 转换区域数据格式
const transformRegionData = (data: any[]): any[] => {
  return data.map(item => ({
    id: item.id,
    primaryId: item.primaryId, // 数据库主键ID
    regionName: item.label,
    regionCode: item.id,
    status: 1, // 默认启用 (1-启用，0-停用)
    orderNum: item.weight || 0,
    parentCode: item.parentId === '0' ? '0' : item.parentId, // 没有父级时传 "0"
    children: item.children ? transformRegionData(item.children) : []
  }))
}
</script>

<style scoped lang="scss">
.region-management {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

// 移除 .area-scope-card 相关样式

.area-management-card {
  .card-header {
    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .action-buttons {
    margin-bottom: 20px;
    
    .el-button {
      margin-right: 10px;
    }
  }
  
  .table-container {
    .el-table {
      .el-table__row {
        .el-link {
          font-size: 14px;
        }
      }
    }
  }
}

.dialog-footer {
  .el-button {
    margin-left: 10px;
  }
}
</style>
