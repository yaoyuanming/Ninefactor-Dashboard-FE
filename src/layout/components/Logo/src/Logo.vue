<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { colorIsDark } from '@/utils/color'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'

defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)
const logo = computed(() => appStore.getBackTheme.logoWhitePath)
const headerThemeColor = computed(() => appStore.getSystemTheme)
const title = computed(() => appStore.getBackTheme.title)
const engTitle = computed(() => appStore.getBackThemeEngTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

// 强制控制悬停状态
const handleMouseEnter = (event: Event) => {
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.style.background = 'transparent'
    target.style.backgroundColor = 'transparent'
    target.style.backgroundImage = 'none'
    target.style.boxShadow = 'none'
  }
}

const handleMouseLeave = (event: Event) => {
  const target = event.currentTarget as HTMLElement
  if (target) {
    target.style.background = 'transparent'
    target.style.backgroundColor = 'transparent'
    target.style.backgroundImage = 'none'
    target.style.boxShadow = 'none'
  }
}

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu' || unref(layout) === 'tlMenu') {
      show.value = true
      return
    }
    if (!collapse) {
      setTimeout(() => {
        show.value = !collapse
      }, 400)
    } else {
      show.value = !collapse
    }
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)
</script>

<template>
  <div>
    <router-link
      :class="[
        prefixCls,
        layout !== 'classic' ? `${prefixCls}__Top` : '',
        'flex items-center cursor-pointer pl-8px relative decoration-none overflow-hidden'
      ]"
      to="/screen/home"
      style="background: transparent !important; background-color: transparent !important;"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <img
        class="h-[calc(var(--logo-height)-10px)] w-[calc(var(--logo-height)-10px)]"
        :src="logo"
        style="filter: brightness(0) invert(1) !important;"
      />
      <div
        v-if="show"
        :class="[
          'ml-10px text-16px font-700',
          {
            'text-[var(--logo-title-text-color)]': layout === 'classic',
            'text-[var(--top-header-text-color)]':
              layout === 'topLeft' ||
              layout === 'top' ||
              layout === 'cutMenu' ||
              layout === 'tlMenu'
          }
        ]"
        style="color: white !important;"
      >
        {{ title }}
        <!-- <div style="font-size: 8px">{{ engTitle }}</div> -->
      </div>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
// 使用最强的方法覆盖UnoCSS的custom-hover样式
.v-logo__Top {
  // 强制设置背景透明
  background: transparent !important;
  background-color: transparent !important;
  
  // 强制设置Logo图标为白色
  img {
    filter: brightness(0) invert(1) !important;
  }
  
  // 强制设置标题文字为白色
  div {
    color: white !important;
  }
  
  // 强制移除Logo区域的悬停效果
  &:hover,
  &:focus,
  &:active {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }
}

// 使用:deep强制覆盖Logo区域的样式
:deep(.v-logo__Top) {
  background: transparent !important;
  background-color: transparent !important;
  
  img {
    filter: brightness(0) invert(1) !important;
  }
  
  div {
    color: white !important;
  }
  
  // 强制覆盖Logo区域的悬停状态
  &:hover,
  &:focus,
  &:active {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }
}

// 强制覆盖任何可能的CSS变量影响
:deep(.v-logo__Top div) {
  color: white !important;
}

:deep(.v-logo__Top img) {
  filter: brightness(0) invert(1) !important;
}

// 全局覆盖Logo区域，确保最高优先级
:global(.v-logo__Top) {
  background: transparent !important;
  background-color: transparent !important;
  
  img {
    filter: brightness(0) invert(1) !important;
  }
  
  div {
    color: white !important;
  }
  
  &:hover,
  &:focus,
  &:active {
    background: transparent !important;
    background-color: transparent !important;
  }
}

// 使用最强优先级覆盖UnoCSS的custom-hover样式
:global(.v-logo__Top.custom-hover) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

:global(.v-logo__Top.custom-hover:hover) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

:global(.v-logo__Top.custom-hover:focus) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

:global(.v-logo__Top.custom-hover:active) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

// 使用CSS变量覆盖UnoCSS的样式
:global(.v-logo__Top.custom-hover) {
  --top-header-hover-color: transparent !important;
}

// 强制覆盖所有可能的悬停状态
:global(.v-logo__Top:hover),
:global(.v-logo__Top:focus),
:global(.v-logo__Top:active) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

// 使用最高优先级的选择器
:global(.v-logo__Top.custom-hover:hover) {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

// 使用CSS的all属性强制重置所有样式
:global(.v-logo__Top.custom-hover:hover) {
  all: unset;
  display: flex !important;
  height: var(--logo-height) !important;
  align-items: center !important;
  cursor: pointer !important;
  padding-left: 8px !important;
  position: relative !important;
  text-decoration: none !important;
  overflow: hidden !important;
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

// 强制覆盖UnoCSS的transition属性
:global(.v-logo__Top.custom-hover) {
  transition: none !important;
}

:global(.v-logo__Top.custom-hover:hover) {
  transition: none !important;
}
</style>
