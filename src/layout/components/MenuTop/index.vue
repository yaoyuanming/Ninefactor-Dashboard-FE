<template>
  <div class="menu-top">
    <el-menu :default-active="activeMenu" mode="horizontal" @select="handleSelect" :ellipsis="false" class="w-full">
      <el-menu-item
v-for="routess in topMenus" :key="routess.path" :index="routess.path"
        :class="{ 'is-active': isActive(routess.path) }">
        <el-icon v-if="routess.meta?.icon">
          <Icon :icon="routess.meta.icon" />
        </el-icon>
        <span>{{ routess.meta?.title }}</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { Icon } from '@/components/Icon'

const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()
const tagsViewStore = useTagsViewStore()

// 获取一级路由
const topMenus = computed(() => {
  return permissionStore.getRouters.filter((route) => {
    // 过滤掉隐藏的路由
    if (route.meta?.hidden) {
      return false
    }
    // 情况1：如果是一级真实菜单页面（没有children）
    if (!route.children) {
      return true
    }
    // 情况2：如果是一级菜单且有子菜单
    if (route.children && route.children.length > 0) {
      return true
    }
    return false
  })
})

onMounted(() => {
  console.log(topMenus.value)
})

// 当前激活的菜单
const activeMenu = computed(() => {
  const { path } = route
  return '/' + path.split('/')[1]
})

// 判断路由是否激活
const isActive = (path: string) => {
  return path === activeMenu.value
}
// 递归查找第一个没有子路由的路由
const findFirstChildWithoutChildren = (route, parentPath = '') => {
  // 特殊处理首页路由
  if (route.path === '/' && route.children && route.children.length > 0) {
    const indexChild = route.children.find(child => child.path === 'index')
    if (indexChild) {
      return { route: indexChild, path: '/index' }
    }
  }

  const currentPath = parentPath ? `${parentPath}/${route.path}` : route.path
  if (route.children && route.children.length > 0) {
    return findFirstChildWithoutChildren(route.children[0], currentPath)
  }
  // 确保返回的路径不以斜杠结尾
  const finalPath = currentPath.endsWith('/') ? currentPath.slice(0, -1) : currentPath
  return { route, path: finalPath }
}

// 处理菜单选择
const handleSelect = async (path: string) => {
  // 获取选中路由的子路由
  const selectedRoute = topMenus.value.find((item) => item.path === path)
  // console.log('selectedRoute---------------：', selectedRoute)
// debugger
  if (selectedRoute?.children) {
    // 设置菜单标签路由
    permissionStore.setLeftMenuTabRouterIs(selectedRoute.path)

    // 如果是首页，清空侧边栏数据
    if (path === '/' || path === '/index') {
      permissionStore.setLeftMenuTabRouters([])
    } else {
      // 非首页时正常设置左侧菜单
      permissionStore.setLeftMenuTabRouters(selectedRoute.children)
    }

    // 添加到缓存视图
    selectedRoute.children.forEach((child) => {
      if (!child.meta?.noCache) {
        tagsViewStore.addCachedView(child)
      }
    })

    // 跳转到第一个子路由
    const firstChild = findFirstChildWithoutChildren(selectedRoute)
    if (firstChild) {
      // 特殊处理首页路由，避免出现 //index
      const targetPath = selectedRoute.path === '/' ? '/index' : firstChild.path
      await router.push(targetPath)
    }
  } else {
    await router.push(path)
  }
}

// 监听路由变化，更新缓存
watch(
  () => route.path,
  () => {
    const currentPath = route.path
    // 如果当前路径是首页，清空左侧菜单
    if (currentPath === '/' || currentPath === '/index') {
      permissionStore.setLeftMenuTabRouters([])
      return
    }

    const currentTopMenu = topMenus.value.find((menu) => menu.path === activeMenu.value)
    if (currentTopMenu?.children) {
      permissionStore.setMenuTabRouters(currentTopMenu.children)
    }
  }
)
</script>

<style lang="scss" scoped>
.menu-top {
  //background-color: var(--el-bg-color);
  background-color: transparent; // 改为透明，让父级的渐变背景显示
  border-bottom: none; // 移除底部边框

  :deep(.el-menu) {
    // 默认菜单背景色（background-color 和 --el-menu-bg-color都可以）
    //background-color: var(--top-menu-bg-color);
    //--el-menu-bg-color: var(--el-bg-color);
    --el-menu-bg-color: transparent !important; // 改为透明
    //// 鼠标悬停状态下的菜单背景色
    //--el-menu-hover-bg-color: var(--top-menu-bg-hover-color);
    height: 35px !important;
    border: none;
  }

  :deep(.el-menu-item) {
    display: flex;
    align-items: center;
    color: white !important; // 确保菜单文字和图标是白色

    .el-icon {
      margin-right: 4px;
      color: white !important; // 确保图标是白色
    }
  }

  // 设置 el-menu-item 鼠标悬停时的样式
  :deep(.el-menu-item:hover) {
    color: white !important; // 悬停时保持白色
    background-color: rgba(255, 255, 255, 0.1) !important; // 悬停时轻微半透明白色
  }

  // 设置 el-menu-item 激活（点击后）时的样式
  :deep(.el-menu-item.is-active) {
    color: white !important; // 激活时菜单文字和图标颜色保持白色
    background-color: rgba(255, 255, 255, 0.2) !important; // 激活时菜单背景色 - 半透明白色
    border-radius: 4px;
    margin: 0 4px;
  }

}
</style>
