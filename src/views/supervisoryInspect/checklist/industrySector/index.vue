<template>
  <ChecklistTable
    :check-type="1"
    @delete="handleDelete"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ChecklistTable from '../components/ChecklistTable.vue'

// 删除
const handleDelete = (row: any) => {
  ElMessage.info(`删除行业领域检查清单：${row.name}`)
}

// 搜索
const handleSearch = (params: any) => {
  console.log('搜索参数：', params)
}
</script>

<style scoped>
.checklist-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.search-card {
  margin-bottom: 10px;
}

.search-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex: 1;
}

.search-form .el-form-item {
  margin-bottom: 16px;
  margin-right: 16px;
}

.add-button-wrapper {
  margin-left: 16px;
  flex-shrink: 0;
}

.table-card {
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  border-radius: 4px;
}

:deep(.el-table th) {
  background-color: #fafafa;
  color: #333;
  font-weight: 600;
}

:deep(.el-link) {
  font-size: 14px;
}

:deep(.el-tag) {
  font-size: 12px;
}
</style>
