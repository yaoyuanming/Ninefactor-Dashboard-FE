<template>
  <el-tree-select
    v-model="innerValue"
    :data="industryTree"
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
import { getIndustryTree } from '@/api/systemSettings/dataApplication/national'

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

const industryTree = ref<any[]>([])

const transformIndustryData = (data: any[]): any[] => {
  if (!Array.isArray(data)) return []
  return data.map(item => ({
    label: item.name || item.industryName || item.label,
    value: item.code || item.industryCode || item.value || item.id,
    children: item.children ? transformIndustryData(item.children) : []
  }))
}

onMounted(async () => {
  const res = await getIndustryTree()
  if (res) industryTree.value = transformIndustryData(res)
})
</script> 