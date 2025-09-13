<template>
  <el-tree-select
    v-model="innerValue"
    :data="regionTree"
    :props="{ label: 'label', value: 'value', children: 'children' }"
    check-strictly
    default-expand-all
    :clearable="clearable"
    :filterable="filterable"
    :placeholder="placeholder"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { getAreaTree } from '@/api/enterpriseArchives'

const props = defineProps<{
  modelValue?: string | number | null
  placeholder?: string
  clearable?: boolean
  filterable?: boolean
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: any): void }>()

const innerValue = ref<any>(props.modelValue ?? '')
watch(() => props.modelValue, v => { innerValue.value = v ?? '' })
watch(innerValue, v => emit('update:modelValue', v))

const regionTree = ref<any[]>([])

const transformRegionData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return []
  return data.map(item => ({
    label: item.name || item.label, // 使用 name 字段作为显示文本
    value: item.id, // 使用 id 字段作为值
    children: item.children ? transformRegionData(item.children) : []
  }))
}

onMounted(async () => {
  const res = await getAreaTree()
  if (res) regionTree.value = transformRegionData(res)
})
</script> 