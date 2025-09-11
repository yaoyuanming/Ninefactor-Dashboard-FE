<template>
  <ChecklistTable
    :check-type="3"
    @delete="handleDelete"
    @search="handleSearch"
  />
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import ChecklistTable from '../components/ChecklistTable.vue'

// 删除
const handleDelete = (row: any) => {
  ElMessage.info(`删除重大隐患检查清单：${row.name}`)
}

// 搜索
const handleSearch = (params: any) => {
  console.log('搜索参数：', params)
}
</script>
