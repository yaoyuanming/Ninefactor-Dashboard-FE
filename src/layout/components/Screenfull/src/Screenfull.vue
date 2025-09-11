<script lang="ts" setup>
import { Icon } from '@/components/Icon'
import { useFullscreen } from '@vueuse/core'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

defineOptions({ name: 'ScreenFull' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('screenfull')

defineProps({
  color: propTypes.string.def('')
})

const { toggle, isFullscreen } = useFullscreen()

const toggleFullscreen = () => {
  toggle()
}
</script>

<template>
  <div :class="prefixCls" @click="toggleFullscreen" style="color: white;">
    <Icon
      :color="color || 'white'"
      :icon="isFullscreen ? 'zmdi:fullscreen-exit' : 'zmdi:fullscreen'"
      :size="18"
    />
  </div>
</template>

<style scoped lang="scss">
// 确保全屏按钮图标为白色
:deep(.icon) {
  color: white !important;
}

// 移除悬停效果
.v-screenfull {
  &:hover {
    background-color: transparent !important;
  }
}
</style>
