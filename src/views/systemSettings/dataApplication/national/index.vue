<template>
  <div class="industry-management">
    <!-- 搜索和操作栏 -->
    <el-card class="search-card" shadow="never">
      <div class="search-bar">
        <el-input v-model="searchName" placeholder="请输入行业名称" clearable class="search-input" />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
        <div class="action-btns">
          <!-- <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
          <el-button @click="handleImport">批量导入</el-button>
          <el-button @click="handleExport">批量导出</el-button> -->
          <el-button type="primary" @click="handleAdd">+ 新增</el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格树区域 -->
    <el-card class="tree-card" shadow="never">
      <div class="table-container">
        <el-table
          :data="industryTreeData"
          row-key="industryCode"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
          border
          stripe
          v-loading="loading"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="industryName" label="行业名称" min-width="200" />
          <el-table-column prop="industryCode" label="行业编码" min-width="150" />
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="行业名称" prop="industryName">
          <el-input v-model="formData.industryName" placeholder="请输入行业名称" />
        </el-form-item>
        <el-form-item label="行业编码" prop="industryCode">
          <el-input v-model="formData.industryCode" placeholder="请输入行业编码" />
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
        <el-form-item label="上级行业" prop="parentCode">
          <el-tree-select
            v-model="formData.parentCode"
            :data="industryTreeData"
            :props="{ label: 'industryName', value: 'industryCode', children: 'children' }"
            placeholder="请选择上级行业"
            clearable
            check-strictly
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getIndustryTree,
  createIndustry,
  updateIndustry,
  deleteIndustry,
  type IndustrySaveReqVO
} from '@/api/systemSettings/dataApplication/national'

const industryTreeData = ref([])
const rawIndustryTreeData = ref([]) // 保存原始数据用于搜索和重置
const searchName = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('新增行业')
const formRef = ref()
const loading = ref(false)
const selectedRows = ref([])

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

const formData = reactive<IndustrySaveReqVO>({
  id: undefined,
  industryCode: '',
  industryName: '',
  parentCode: '0',
  orderNum: 0,
  status: 1
})

const formRules = {
  industryName: [
    { required: true, message: '请输入行业名称', trigger: 'blur' }
  ],
  industryCode: [
    { required: true, message: '请输入行业编码', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

const loadIndustryTree = async () => {
  loading.value = true
  try {
    const response = await getIndustryTree()
    if (response ) {
      const transformed = transformIndustryData(response)
      rawIndustryTreeData.value = transformed
      industryTreeData.value = transformed
    }
  } catch (error) {
    ElMessage.error('加载国民经济类型树失败')
  } finally {
    loading.value = false
  }
}

const transformIndustryData = (data: any[]): any[] => {
  return data.map(item => ({
    id: item.id,
    primaryId: item.primaryId,
    industryName: item.industryName || item.label,
    industryCode: item.industryCode || item.id,
    status: item.status ?? 1,
    orderNum: item.weight ?? 0, 
    parentCode: item.parentCode ?? (item.parentId === '0' ? '0' : item.parentId),
    children: item.children ? transformIndustryData(item.children) : []
  }))
}

const handleSearch = () => {
  if (!searchName.value) {
    industryTreeData.value = rawIndustryTreeData.value
    return
  }
  // 递归过滤
  const filterTree = (data: any[]): any[] => {
    return data
      .map(item => {
        const children = item.children ? filterTree(item.children) : []
        if (
          item.industryName?.includes(searchName.value) ||
          children.length > 0
        ) {
          return { ...item, children }
        }
        return null
      })
      .filter(Boolean)
  }
  industryTreeData.value = filterTree(rawIndustryTreeData.value)
}

const handleReset = () => {
  searchName.value = ''
  industryTreeData.value = rawIndustryTreeData.value
}

const handleBatchDelete = () => {
  ElMessage.info('批量删除功能待实现')
}

const handleImport = () => {
  ElMessage.info('批量导入功能待实现')
}

const handleExport = () => {
  ElMessage.info('批量导出功能待实现')
}

const handleAdd = () => {
  dialogTitle.value = '新增行业'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑行业'
  Object.assign(formData, {
    id: Number(row.primaryId),
    industryCode: row.industryCode,
    industryName: row.industryName,
    parentCode: row.parentCode,
    orderNum: row.orderNum,
    status: row.status
  })
  dialogVisible.value = true
}

const handleDelete = async (row: any) => {
  ElMessageBox.confirm(
    `确定要删除行业"${row.industryName}"吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteIndustry(Number(row.primaryId))
      ElMessage.success('删除成功')
      loadIndustryTree()
    } catch (error: any) {
      const errorMsg = error?.response?.data?.msg || error?.message || '删除失败'
      ElMessage.error(errorMsg)
    }
  }).catch(() => {})
}

const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const submitData = { ...formData, weight: formData.orderNum }
    if (dialogTitle.value === '新增行业') {
      await createIndustry(submitData)
      ElMessage.success('新增成功')
    } else {
      await updateIndustry(submitData)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    resetForm()
    loadIndustryTree()
  } catch (error: any) {
    const errorMsg = error?.response?.data?.msg || error?.message || '操作失败'
    ElMessage.error(errorMsg)
  }
}

const handleDialogClose = () => {
  resetForm()
}

const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    industryCode: '',
    industryName: '',
    parentCode: '0',
    orderNum: 0,
    status: 1
  })
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

onMounted(() => {
  loadIndustryTree()
})
</script>

<style scoped lang="scss">
.industry-management {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}
.search-card, .tree-card {
  margin-bottom: 20px;
}
.search-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.search-input {
  width: 220px;
  margin-right: 12px;
}
.action-btns {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.industry-tree {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  background: #fafbfc;
}
.tree-actions {
  margin-left: 16px;
  display: inline-flex;
  gap: 8px;
}
.dialog-footer {
  .el-button {
    margin-left: 10px;
  }
}
</style>
