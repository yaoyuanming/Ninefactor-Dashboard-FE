import router from './router'
import type { RouteRecordRaw } from 'vue-router'
import { isRelogin } from '@/config/axios/service'
import { getAccessToken } from '@/utils/auth'
import { useTitle } from '@/hooks/web/useTitle'
import { useNProgress } from '@/hooks/web/useNProgress'
import { usePageLoading } from '@/hooks/web/usePageLoading'
import { useDictStoreWithOut } from '@/store/modules/dict'
import { useUserStoreWithOut } from '@/store/modules/user'
import { usePermissionStoreWithOut } from '@/store/modules/permission'
import {useWatermark} from "@/hooks/web/useWatermark";
import {CACHE_KEY, useCache} from "@/hooks/web/useCache";
import {setCssVar, trim} from "@/utils";
import {useAppStore} from "@/store/modules/app";
import {useCssVar} from "@vueuse/core";
import {colorIsDark, hexToRGB, lighten} from "@/utils/color";

const { start, done } = useNProgress()

const { loadStart, loadDone } = usePageLoading()

const parseURL = (
  url: string | null | undefined
): { basePath: string; paramsObject: { [key: string]: string } } => {
  // 如果输入为 null 或 undefined，返回空字符串和空对象
  if (url == null) {
    return { basePath: '', paramsObject: {} }
  }

  // 找到问号 (?) 的位置，它之前是基础路径，之后是查询参数
  const questionMarkIndex = url.indexOf('?')
  let basePath = url
  const paramsObject: { [key: string]: string } = {}

  // 如果找到了问号，说明有查询参数
  if (questionMarkIndex !== -1) {
    // 获取 basePath
    basePath = url.substring(0, questionMarkIndex)

    // 从 URL 中获取查询字符串部分
    const queryString = url.substring(questionMarkIndex + 1)

    // 使用 URLSearchParams 遍历参数
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      // 封装进 paramsObject 对象
      paramsObject[key] = value
    })
  }

  // 返回 basePath 和 paramsObject
  return { basePath, paramsObject }
}

// 路由不重定向白名单
const whiteList = [
  '/',
  '/login',
  '/social-login',
  '/auth-redirect',
  '/bind',
  '/register',
  '/oauthLogin/gitee',
  '/screen',
  '/screen/home'
]
const { wsCache } = useCache()
const { setWatermark } = useWatermark()
const appStore = useAppStore()
// 路由加载前
router.beforeEach(async (to, from, next) => {
  start()
  loadStart()

  // 1) 根路径始终跳转到大屏
  if (to.path === '/') {
    next('/screen/home')
    return
  }
  // 2) 任何 /screen 开头的路由直接放行（无需登录）
  if (to.path.startsWith('/screen')) {
    next()
    return
  }
  // 3) 其他任意路径一律重定向到大屏（相当于只保留大屏路由）
  next('/screen/home')
  return

  if (getAccessToken()) {
    if (to.path === '/login') {
      next({ path: '/', query: { platform:"wms"} })
    } else {
      // 获取所有字典
      const dictStore = useDictStoreWithOut()
      const userStore = useUserStoreWithOut()
      const permissionStore = usePermissionStoreWithOut()
      if (!dictStore.getIsSetDict) {
        await dictStore.setDictMap()
      }
      if (!dictStore.getIsSetDictCat) {
        await dictStore.setDictTypeMap()
      }
      console.info("userStore.getIsSetUser：", userStore.getIsSetUser)
      if (!userStore.getIsSetUser) {
        isRelogin.show = true
        await userStore.setUserInfoAction()
        isRelogin.show = false
        // 后端过滤菜单
        await permissionStore.generateRoutes()
        console.log('用户权限信息缓存后首次 设置permissionStore：', permissionStore)
        permissionStore.getAddRouters.forEach((route) => {
          router.addRoute(route as unknown as RouteRecordRaw) // 动态添加可访问路由表
        })
        console.log(' permissionStore.getAddRouters（路由降级后结果）：',  permissionStore.getAddRouters)
        // console.log(' permissionStore.getAddRoutersOrigion：',  permissionStore.getAddRoutersOrigion)
        const redirectPath = from.query.redirect || to.path
        // 修复跳转时不带参数的问题
        const redirect = decodeURIComponent(redirectPath as string)
        const { paramsObject: query } = parseURL(redirect)
        // const nextData = to.path === redirect ? { ...to, replace: true } : { path: redirect, query } // 跳转菜单路径
        // const nextData = getFirstMenuPath(permissionStore.getAddRoutersOrigion) // 跳转菜单路径
        const nextData='screen/home'
        const nextRoute=nextData.split('/')[1] // 跳转菜单的所属模块（即父菜单路径）
        permissionStore.getRouters.forEach((route) => {
          if (route.path === `/${nextRoute}`) {
            // 存储当前显示的左侧菜单路由数组
            permissionStore.setLeftMenuTabRouterIs(`/${nextRoute}`)
            permissionStore.setLeftMenuTabRouters(route.children ||[])
          }
        })

        // 跳转页面处理
        next(nextData)

        // console.info("to.path：", to.path)
        // console.info("redirect：", redirect)
        console.info("用户权限信息缓存后首次 跳转：", nextData)
        console.info("跳转菜单的父菜单路径：", nextRoute)

      } else {
        // const nextData = getFirstMenuPath(permissionStore.getAddRouters)
        next()

        // console.info("to.path：", to.path)
        // console.info("已登录 跳转：", nextData)
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      let platform= ''
      if(wsCache.get(CACHE_KEY.BACK_CACHE) != null){
        const backCache = wsCache.get(CACHE_KEY.BACK_CACHE)
        platform = backCache.platformNumber
      }
      // 否则全部重定向到登录页
      next(`/login?redirect=${to.fullPath}`)
    }
  }
})

// 获取第一个可访问的菜单路由
const getFirstMenuPath = (routers) => {
  for (const router of routers) {
    // console.info('router.path：', router.path)
    // console.info('router.children：', router.children)
    // 如果是叶子节点且不是外链，直接返回
    if (!router.children && !router.meta?.isExternal) {
      return router.path
    }
    // 如果有子路由，递归查找第一个叶子节点
    if (router.children && router.children.length > 0) {
      const childPath = getFirstMenuPath(router.children)
      // console.info('childPath：', childPath)
      if (childPath) {
        return router.path + '/' + childPath
      }
    }
  }
  return null
}

router.afterEach((to) => {
  useTitle(to?.meta?.title as string)
  done() // 结束Progress
  loadDone()
})
