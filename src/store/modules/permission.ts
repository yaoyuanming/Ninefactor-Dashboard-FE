import { defineStore } from 'pinia'
import { store } from '@/store'
import { cloneDeep } from 'lodash-es'
import remainingRouter from '@/router/modules/remaining'
import { flatMultiLevelRoutes, generateRoute } from '@/utils/routerHelper'
import { CACHE_KEY, useCache } from '@/hooks/web/useCache'
import { ScreenLayout } from '@/utils/routerHelper'

const { wsCache } = useCache()

export interface PermissionState {
  routers: AppRouteRecordRaw[] // 完整路由（remainingRouter + 动态路由）
  addRouters: AppRouteRecordRaw[] // 动态路由
  menuTabRouters: AppRouteRecordRaw[]
  leftMenuRouters: AppRouteRecordRaw[]
  leftMenuRouterIs: string
}

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routers: [],
    addRouters: [],
    menuTabRouters: [],
    leftMenuRouters: [],
    leftMenuRouterIs: ''
  }),
  getters: {
    // 完整路由（remainingRouter + 动态路由）
    getRouters(): AppRouteRecordRaw[] {
      return this.routers
    },
    // 原始动态路由数组，不进行降级
    getAddRoutersOrigion(): AppRouteRecordRaw[] {
      return this.addRouters
    },
    // 降级后的动态路由数组
    getAddRouters(): AppRouteRecordRaw[] {
      // 路由降级
      return flatMultiLevelRoutes(cloneDeep(this.addRouters))
    },
    getMenuTabRouters(): AppRouteRecordRaw[] {
      return this.menuTabRouters
    },
    getLeftMenuTabRouters(): AppRouteRecordRaw[] {
      return this.leftMenuRouters
    },
    getLeftMenuRouterIs(): string {
      return this.leftMenuRouterIs
    }
  },
  actions: {
    async generateRoutes(): Promise<unknown> {
      return new Promise<void>(async (resolve) => {
        // 获得菜单列表，它在登录的时候，setUserInfoAction 方法中已经进行获取
        let res: AppCustomRouteRecordRaw[] = []
        const roleRouters = wsCache.get(CACHE_KEY.ROLE_ROUTERS)
        if (roleRouters) {
          res = roleRouters as AppCustomRouteRecordRaw[]
        }
        // console.log('res------------：', res)
        const routerMap: AppRouteRecordRaw[] = generateRoute(res)
        // console.log('routerMap------------：', routerMap)

        // 动态路由，404一定要放到最后面
        // preschooler：vue-router@4以后已支持静态404路由，此处可不再追加
        this.addRouters = routerMap.concat([
          {
            path: '/:path(.*)*',
            // redirect: '/404',
            component: () => import('@/views/Error/404.vue'),
            name: '404Page',
            meta: {
              hidden: true,
              breadcrumb: false
            }
          },
          {
            path: '/screen',
            component: ScreenLayout,
            name: 'Screen',
            redirect: '/screen/home',
            meta: {
              hidden: true
            },
            children: [
              {
                path: 'home',
                component: () => import('@/views/screen/index.vue'),
                name: 'ScreenHome',
                meta: {
                  title: '',
                  icon: 'ep:tickets',
                  noCache: true,
                  hidden: true,
                  activeMenu: '/workbenches/basicEnterprise1'
                }
              }
            ]
          }
        ])
        // console.log('addRouters------------：', this.addRouters)
        // 渲染菜单的所有路由
        this.routers = cloneDeep(remainingRouter).concat(routerMap)
        console.log('routers------------：', this.routers)
        resolve()
      })
    },
    setMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.menuTabRouters = routers
    },
    setLeftMenuTabRouters(routers: AppRouteRecordRaw[]): void {
      this.leftMenuRouters = routers
    },
    setLeftMenuTabRouterIs(router: string): void {
      this.leftMenuRouterIs = router
    }
  },
  persist: false
})

export const usePermissionStoreWithOut = () => {
  return usePermissionStore(store)
}
