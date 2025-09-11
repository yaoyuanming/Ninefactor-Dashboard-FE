<script lang="ts" setup>
import { computed, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { colorIsDark } from '@/utils/color'
defineOptions({ name: 'Logo' })

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const logo = computed(() => appStore.getBackTheme.logoWhitePath)
const title = computed(() => appStore.getBackTheme.title)
const engTitle = computed(() => appStore.getBackTheme.englishTitle)
const headerThemeColor = computed(() => appStore.getSystemTheme)
const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)

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
      style="height: 200px"
      :class="[
        prefixCls,
        layout !== 'classic' ? `${prefixCls}__Top` : '',
        'flex items-center !h-[var(--logo-height)+40] cursor-pointer pl-8px relative decoration-none overflow-hidden'
      ]"
      to="/workbenches/enterpriseManagement/basicInformation"
    >
      <img
        class="h-[calc(var(--logo-height)-10px)] w-[calc(var(--logo-height)-10px)]"
        :src="logo"
      />
      <div
        :style="{
          color: colorIsDark(headerThemeColor) ? '#ffffff' : headerThemeColor
        }"
        v-if="show"
        :class="[
          'ml-10px',
          {
            'text-[var(--logo-title-text-color)]': layout === 'classic',
            'text-[var(--top-header-text-color)]':
              layout === 'topLeft' ||
              layout === 'top' ||
              layout === 'cutMenu' ||
              layout === 'tlMenu'
          }
        ]"
      >
        <div class="text-16px font-700">{{ title }}</div>
        <div class="text-8px mt-1 whitespace-normal break-words max-w-[120px]">
          {{ engTitle }}
        </div>
      </div>
    </router-link>
  </div>
</template>
