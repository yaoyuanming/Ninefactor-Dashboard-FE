<script lang="ts" setup>
import { isDark } from '@/utils/is'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import routerSearch from '@/components/RouterSearch/index.vue'
// import { handleBrowserRefresh } from '@/hooks/web/refreshHandler'
import { onMounted, onBeforeUnmount } from 'vue'
import { useCssVar } from '@vueuse/core'
import { colorIsDark, hexToRGB, lighten } from '@/utils/color'
import { setCssVar, trim } from '@/utils'
import { useWatermark } from '@/hooks/web/useWatermark'

defineOptions({ name: 'APP' })

const { getPrefixCls } = useDesign()
const prefixCls = getPrefixCls('app')
const appStore = useAppStore()
const currentSize = computed(() => appStore.getCurrentSize)
const greyMode = computed(() => appStore.getGreyMode)
const { wsCache } = useCache()

// 根据浏览器当前主题设置系统主题色
const setDefaultTheme = () => {
  let isDarkTheme = wsCache.get(CACHE_KEY.IS_DARK)
  if (isDarkTheme === null) {
    isDarkTheme = isDark()
  }
  appStore.setIsDark(isDarkTheme)
}
setDefaultTheme()

// 刷新浏览器 核心处理逻辑
const handleBrowserRefresh = () => {
  // 清空，从而触发刷新（刷新菜单缓存）
  wsCache.delete(CACHE_KEY.USER)
  wsCache.delete(CACHE_KEY.ROLE_ROUTERS)
  // 刷新浏览器
  location.reload()
}
const { setWatermark } = useWatermark()
// 添加生命周期钩子（执行顺序：onMounted → （组件运行中） → onBeforeUnmount → onUnmounted）
onMounted(() => {
  console.log('APP 挂载后')
  // 设置用户主题为平台设置（接口返回）的默认主题
  // 获取备份的缓存数据
  // 设置缓存数据为最新的数据
  let userConfig = wsCache.get(CACHE_KEY.THEME)
  console.log('-------------App.vue-------------------------------')
  // 设置用户主题为平台设置（接口返回）的默认主题
  // 获取备份的缓存数据
  // 设置缓存数据为最新的数据
  const themePlatform = wsCache.get(CACHE_KEY.THEME_PLATFORM)
  console.log('-------------App.vue-------------------------------')
  if (userConfig != null) {
    console.log("------------userConfig != null-----------------")
    // appStore.setScreenfull(myConfig.screenfull)
    if (userConfig.tagsView == null) {
      setCssVar('--tags-view-height', true ? '35px' : '0px')
      appStore.setTagsView(themePlatform?.tagsView != null ? themePlatform?.tagsView : true)
    } else {
      setCssVar('--tags-view-height', userConfig.tagsView ? '35px' : '0px')
      appStore.setTagsView(userConfig.tagsView)
    }
    if (userConfig.tagsViewIcon == null) {
      appStore.setTagsViewIcon(themePlatform?.tagsViewIcon != null ? themePlatform?.tagsViewIcon : true)
    } else {
      appStore.setTagsViewIcon(userConfig.tagsViewIcon)
    }
    if (userConfig.screenFull == null) {
      appStore.setScreenfull(themePlatform?.screenfull != null ? themePlatform?.screenfull : true)
    } else {
      appStore.setScreenfull(userConfig.screenFull)
    }
    if (userConfig.logoChange == null) {
      appStore.setLogo(themePlatform?.logoChange != null ? themePlatform?.logoChange : true)
    } else {
      appStore.setLogo(userConfig.logoChange)
    }
    if (userConfig.fixedHeader == null) {
      appStore.setFixedHeader(themePlatform?.fixedHeader != null ? themePlatform?.fixedHeader : true)
    } else {
      appStore.setFixedHeader(userConfig.fixedHeader)
    }
    if (userConfig.footer == null) {
      appStore.setFooter(themePlatform?.footer != null ? themePlatform?.footer : true)
    } else {
      appStore.setFooter(userConfig.footer)
    }
    if (userConfig.greyMode == null) {
      appStore.setGreyMode(themePlatform?.greyMode != null ? themePlatform?.greyMode : false)
    } else {
      appStore.setGreyMode(userConfig.greyMode)
    }
    if (userConfig.fixedMenu == null) {
      appStore.setFixedMenu(themePlatform?.fixedMenu != null ? themePlatform?.fixedMenu : false)
    } else {
      appStore.setFixedMenu(userConfig.fixedMenu)
    }
    if (userConfig.water != null) {
      setWatermark(userConfig.water)
    }
    if (userConfig.water == null) {
      setWatermark(themePlatform?.water != null ? themePlatform?.water : '')
    }
  }
  if (userConfig == null && themePlatform != null) {
    console.log('-------------themePlatform != null-------------------------------', themePlatform)
    appStore.setScreenfull(themePlatform.screenfull )
    setCssVar('--tags-view-height', themePlatform.tagsView ? '35px' : '0px')
    appStore.setTagsView(themePlatform.tagsView)
    appStore.setTagsViewIcon(themePlatform.tagsViewIcon)
    appStore.setLogo(themePlatform.logoChange)
    appStore.setFixedHeader(themePlatform.fixedHeader)
    appStore.setFooter(themePlatform.footer)
    appStore.setGreyMode(themePlatform.greyMode)
    appStore.setFixedMenu(themePlatform.fixedMenu)
    console.log("ref(appStore.getTheme.leftMenuBgColor || ''):",ref(appStore.getTheme.leftMenuBgColor || ''))
    if (themePlatform.water != null) {
      setWatermark(themePlatform.water)
    }
    appStore.theme.elColorPrimary = themePlatform.systemTheme
    appStore.theme.topHeaderBgColor = themePlatform.headerTheme
    appStore.theme.leftMenuBgColor = themePlatform.menuTheme
    // 设置颜色
    // 设置头部主题颜色
    setHeaderTheme(unref(themePlatform.headerTheme))
    //设置系统主题颜色
    setSystemTheme(unref(themePlatform.systemTheme))
    // 设置菜单主题颜色
    setMenuTheme(unref(themePlatform.menuTheme))
    //   设置布局模式
    appStore.setLayout(themePlatform.layout)
  }
  if (userConfig == null && themePlatform == null) {
    console.log("userConfig == null && themePlatform == null")
    setMenuTheme(unref('#e9ecef'))
    setHeaderTheme(unref('#fff'))
    setSystemTheme(unref('#409eff'))
    appStore.theme.elColorPrimary = '#409eff'
    appStore.theme.topHeaderBgColor = '#fff'
    appStore.theme.leftMenuBgColor = '#e9ecef'
  }
  console.log("=================================================")
  // 添加浏览器刷新事件监听器（要监听的事件类型，例如 'click'、'resize'、'beforeunload' 等，其中beforeunload是浏览器原生事件，专门用于监听页面卸载（刷新、关闭等））
  window.addEventListener('beforeunload', handleBrowserRefresh)
})
const layout = computed(() => appStore.getLayout)
const setSystemTheme = (color: string) => {
  setCssVar('--el-color-primary', color)
  appStore.setTheme({ elColorPrimary: color })
  // const topMenuBgColor = useCssVar('--top-menu-bg-color', document.documentElement)
  // setHeaderTheme(trim(unref(topMenuBgColor)))
  const leftMenuBgColor = useCssVar('--left-menu-bg-color', document.documentElement)
  setMenuTheme(trim(unref(leftMenuBgColor)))
}
const setHeaderTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  // 头部
  const textColor = isDarkColor ? '#fff' : 'inherit'
  const subTextColor = isDarkColor ? '#fff' : '#999999'
  const textHoverColor = isDarkColor ? lighten(color!, 6) : '#f6f6f6'
  const topToolBorderColor = isDarkColor ? color : '#eee'
  setCssVar('--top-header-bg-color', color)
  setCssVar('--top-header-text-color', textColor)
  setCssVar('--top-header-sub-text-color', subTextColor)
  setCssVar('--top-header-hover-color', textHoverColor)
  appStore.setTheme({
    topHeaderBgColor: color,
    topHeaderTextColor: textColor,
    topHeaderSubTextColor: subTextColor,
    topHeaderHoverColor: textHoverColor,
    topToolBorderColor: topToolBorderColor
  })
  // 头部菜单
  const topMenuBgActiveColor = isDarkColor
    ? 'var(--el-color-primary)'
    : hexToRGB(unref(primaryColor), 0.1)
  const topMenuTextColor = isDarkColor ? '#bfcbd9' : '#333'
  const topMenuTextActiveColor = isDarkColor ? '#fff' : 'var(--el-color-primary)'
  setCssVar('--top-menu-bg-color', color)
  setCssVar('--top-menu-bg-active-color', topMenuBgActiveColor)
  setCssVar('--top-menu-text-color', topMenuTextColor)
  setCssVar('--top-menu-text-active-color', topMenuTextActiveColor)
  appStore.setTheme({
    topMenuBgColor: color, // 头部菜单背景颜色
    topMenuBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1), // 头部菜单选中背景颜色
    topMenuTextColor: isDarkColor ? '#bfcbd9' : '#333', // 头部菜单字体颜色
    topMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)' // 头部菜单选中字体颜色
  })
  if (unref(layout) === 'top') {
    setMenuTheme(color)
  }
}

// 菜单主题 menuTheme
const setMenuTheme = (color: string) => {
  const primaryColor = useCssVar('--el-color-primary', document.documentElement)
  const isDarkColor = colorIsDark(color)
  const theme: Recordable = {
    // 左侧菜单边框颜色
    leftMenuBorderColor: isDarkColor ? 'inherit' : '#fff',
    // 左侧菜单背景颜色
    leftMenuBgColor: color,
    // 左侧菜单浅色背景颜色
    leftMenuBgLightColor: isDarkColor ? lighten(color!, 6) : color,
    // 左侧菜单选中背景颜色
    leftMenuBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单收起选中背景颜色
    leftMenuCollapseBgActiveColor: isDarkColor
      ? 'var(--el-color-primary)'
      : hexToRGB(unref(primaryColor), 0.1),
    // 左侧菜单字体颜色
    leftMenuTextColor: isDarkColor ? '#bfcbd9' : '#333',
    // 左侧菜单选中字体颜色
    leftMenuTextActiveColor: isDarkColor ? '#fff' : 'var(--el-color-primary)',
    // logo字体颜色
    logoTitleTextColor: isDarkColor ? '#fff' : 'inherit',
    // logo边框颜色
    logoBorderColor: isDarkColor ? color : '#eee'
  }
  appStore.setTheme(theme)
  appStore.setCssVarTheme()
}
onBeforeUnmount(() => {
  console.log('APP 卸载前')
  // 移除浏览器刷新事件监听器
  window.removeEventListener('beforeunload', handleBrowserRefresh)
})
</script>
<template>
  <ConfigGlobal :size="currentSize">
    <RouterView :class="greyMode ? `${prefixCls}-grey-mode` : ''" />
    <routerSearch />
  </ConfigGlobal>
</template>
<style lang="scss">
$prefix-cls: #{$namespace}-app;

.size {
  width: 100%;
  height: 100%;
}

html,
body {
  @extend .size;

  padding: 0 !important;
  margin: 0;
  overflow: hidden;

  #app {
    @extend .size;
  }
}

.#{$prefix-cls}-grey-mode {
  filter: grayscale(100%);
}
</style>
