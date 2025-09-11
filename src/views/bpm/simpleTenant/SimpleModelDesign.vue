<template>
  <ContentWrap :bodyStyle="{ padding: '20px 16px' }">
    <SimpleProcessDesignerTenant
      :model-id="modelId"
      :model-item="modelItem"
      :model-key="modelKey"
      :model-name="modelName"
      @success="handleSuccess"
      :start-user-ids="startUserIds"
      ref="designerRef"
    />
  </ContentWrap>
</template>
<script setup lang="ts">
import { SimpleProcessDesignerTenant } from '@/components/SimpleProcessDesignerV2Tenant/src/'
defineOptions({
  name: 'SimpleModelDesign'
})

defineProps<{
  modelId?: string
  modelKey?: string
  modelName?: string
  startUserIds?: number[]
  modelItem?: Object
}>()

const emit = defineEmits(['success'])
const designerRef = ref()

// 修改成功回调
const handleSuccess = (data?: any) => {
  console.info('handleSuccess', data)
  if (data) {
    emit('success', data)
  }
}
</script>
<style lang="scss" scoped></style>
