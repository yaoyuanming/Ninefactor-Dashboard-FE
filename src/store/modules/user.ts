import { store } from '@/store'
import { defineStore } from 'pinia'
import { getAccessToken, removeToken } from '@/utils/auth'
import { CACHE_KEY, useCache, deleteUserCache } from '@/hooks/web/useCache'
import { getInfo, loginOut } from '@/api/login'

const { wsCache } = useCache()

interface UserVO {
  id: number
  avatar: string
  username: string
  nickname: string
  deptId: number
  isSuper: boolean
}

interface UserInfoVO {
  // USER 缓存
  permissions: Set<string>
  roles: string[]
  isSetUser: boolean
  user: UserVO
}

export const useUserStore = defineStore('admin-user', {
  state: (): UserInfoVO => ({
    permissions: new Set<string>(),
    roles: [],
    isSetUser: false,
    user: {
      id: 0,
      avatar: '',
      username: '',
      nickname: '',
      deptId: 0,
      isSuper: false
    }
  }),
  getters: {
    getPermissions(): Set<string> {
      return this.permissions
    },
    getRoles(): string[] {
      return this.roles
    },
    getIsSetUser(): boolean {
      return this.isSetUser
    },
    getUser(): UserVO {
      return this.user
    }
  },
  actions: {
    async setUserInfoAction() {
      if (!getAccessToken()) {
        this.resetState()
        return null
      }
      let userInfo = wsCache.get(CACHE_KEY.USER)
      if (!userInfo) {
        userInfo = await getInfo()
      }
      this.permissions = new Set(userInfo.permissions)
      this.roles = userInfo.roles
      this.user = userInfo.user
      this.isSetUser = true
      wsCache.set(CACHE_KEY.USER, userInfo)

      // 手动添加监测预警菜单
      // const warehouseMenu = {
      //   "id": 9999,
      //   "parentId": 2,
      //   "name": "监测预警",
      //   "path": "/monitoring",
      //   "component": null,
      //   "componentName": null,
      //   "icon": "ep:monitor",
      //   "visible": true,
      //   "keepAlive": true,
      //   "alwaysShow": true,
      //   "children": [
      //     {
      //       "id": 999901,
      //       "parentId": 9999,
      //       "name": "基本信息管理",
      //       "path": "basicInfo",
      //       "component": null,
      //       "componentName": null,
      //       "icon": "ep:monitor",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": true,
      //       "children": [
      //         {
      //           "id": 99990101,
      //           "parentId": 999901,
      //           "name": "人员信息管理",
      //           "path": "staff",
      //           "component": "views/monitoring/basicInfo/staff/index.vue",
      //           "componentName": "WarehouseStaff",
      //           "icon": "ep:user",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990102,
      //           "parentId": 999901,
      //           "name": "车辆信息管理",
      //           "path": "vehicle",
      //           "component": "views/monitoring/basicInfo/vehicle/index.vue",
      //           "componentName": "WarehouseVehicle",
      //           "icon": "ep:van",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990103,
      //           "parentId": 999901,
      //           "name": "资质证书管理",
      //           "path": "certificate",
      //           "component": "views/monitoring/basicInfo/certificate/index.vue",
      //           "componentName": "WarehouseCertificate",
      //           "icon": "ep:certificate",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990104,
      //           "parentId": 999901,
      //           "name": "库区管理",
      //           "path": "areas",
      //           "component": null,
      //           "componentName": null,
      //           "icon": "ep:monitor",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": true,
      //           "children": [
      //             {
      //               "id": 99990201,
      //               "parentId": 999902,
      //               "name": "仓库管理",
      //               "path": "godown",
      //               "component": "views/monitoring/areas/godown/index.vue",
      //               "componentName": "GodownManagement",
      //               "icon": "ep:office-building",
      //               "visible": true,
      //               "keepAlive": true,
      //               "alwaysShow": false,
      //               "children": null
      //             },
      //             {
      //               "id": 99990202,
      //               "parentId": 999902,
      //               "name": "库房管理",
      //               "path": "shed",
      //               "component": "views/monitoring/areas/shed/index.vue",
      //               "componentName": "ShedManagement",
      //               "icon": "ep:box",
      //               "visible": true,
      //               "keepAlive": true,
      //               "alwaysShow": false,
      //               "children": null
      //             },
      //             {
      //               "id": 99990203,
      //               "parentId": 999902,
      //               "name": "设备关联",
      //               "path": "deviceAssociation",
      //               "component": "views/monitoring/areas/deviceAssociation/index.vue",
      //               "componentName": "DeviceAssociation",
      //               "icon": "ep:monitor",
      //               "visible": true,
      //               "keepAlive": true,
      //               "alwaysShow": false,
      //               "children": null
      //             }
      //           ]
      //         },
      //         {
      //           "id": 99990105,
      //           "parentId": 999901,
      //           "name": "设备管理",
      //           "path": "device",
      //           "component": "views/monitoring/basicInfo/device/index.vue",
      //           "componentName": "DeviceManagement",
      //           "icon": "ep:monitor",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //       ]
      //     },
      //     {
      //       "id": 999908,
      //       "parentId": 9999,
      //       "name": "监测预警",
      //       "path": "monitoringRecords",
      //       "component": null,
      //       "componentName": null,
      //       "icon": "ep:monitor",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": true,
      //       "children": [
      //         {
      //           "id": 99990803,
      //           "parentId": 999908,
      //           "name": "监测预警",
      //           "path": "screenOverview",
      //           "component": "views/monitoring/record/screen/index.vue",
      //           "componentName": "MonitoringScreenOverview",
      //           "icon": "ep:monitor",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 999906,
      //           "parentId": 999908,
      //           "name": "报警记录",
      //           "path": "alarmRecord",
      //           "component": "views/monitoring/record/alarmRecord/index.vue",
      //           "componentName": "MonitoringAlarmRecord",
      //           "icon": "ep:warning",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 999907,
      //           "parentId": 999908,
      //           "name": "预警记录",
      //           "path": "warningRecord",
      //           "component": "views/monitoring/record/warningRecord/index.vue",
      //           "componentName": "MonitoringWarningRecord",
      //           "icon": "ep:warning",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
         
      //         {
      //           "id": 99990804,
      //           "parentId": 999908,
      //           "name": "自然灾害报警",
      //           "path": "naturalDisasterAlarm",
      //           "component": "views/monitoring/record/naturalDisaster/index.vue",
      //           "componentName": "NaturalDisasterAlarmRecord",
      //           "icon": "ep:warning",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         }
      //       ]
      //     },
      //     {
      //       "id": 999900,
      //       "parentId": 9999,
      //       "name": "统计分析",
      //       "path": "statistics",
      //       "component": null,
      //       "componentName": null,
      //       "icon": "ep:data-analysis",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": true,
      //       "children": [
      //         {
      //           "id": 99990001,
      //           "parentId": 999900,
      //           "name": "基本信息统计分析",
      //           "path": "basicInfoStatistics",
      //           "component": "views/monitoring/statistics/basicInfo/index.vue",
      //           "componentName": "MonitoringStatisticsBasicInfo",
      //           "icon": "", // 请根据需要填写图标
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990002,
      //           "parentId": 999900,
      //           "name": "风险监测数据统计",
      //           "path": "riskMonitoringDataStatistics",
      //           "component": "views/monitoring/statistics/riskMonitoringData/index.vue",
      //           "componentName": "MonitoringStatisticsRiskMonitoringData",
      //           "icon": "", // 请根据需要填写图标
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990003,
      //           "parentId": 999900,
      //           "name": "报警信息统计",
      //           "path": "alarmInfoStatistics",
      //           "component": "views/monitoring/statistics/alarmInfo/index.vue",
      //           "componentName": "MonitoringStatisticsAlarmInfo",
      //           "icon": "", // 请根据需要填写图标
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990004,
      //           "parentId": 999900,
      //           "name": "预警信息统计",
      //           "path": "warningInfoStatistics",
      //           "component": "views/monitoring/statistics/warningInfo/index.vue",
      //           "componentName": "MonitoringStatisticsWarningInfo",
      //           "icon": "", // 请根据需要填写图标
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990005,
      //           "parentId": 999900,
      //           "name": "数据报告",
      //           "path": "dataReport",
      //           "component": "views/monitoring/statistics/dataReport/index.vue",
      //           "componentName": "MonitoringStatisticsDataReport",
      //           "icon": "", // 请根据需要填写图标
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         }
      //       ]
      //     },
      //     {
      //       "id": 999912,
      //       "parentId": 9999,
      //       "name": "监控查看",
      //       "path": "monitorView",
      //       "component": "views/monitoring/monitorView/index.vue",
      //       "componentName": "MonitoringMonitorView",
      //       "icon": "ep:monitor",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": false,
      //       "children": null
      //     },
      //     {
      //       "id": 999904,
      //       "parentId": 9999,
      //       "name": "访客管理",
      //       "path": "visitor",
      //       "component": "views/monitoring/visitor/index.vue",
      //       "componentName": "MonitoringVisitorManagement",
      //       "icon": "ep:user",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": false,
      //       "children": null
      //     },
      //     {
      //       "id": 999905,
      //       "parentId": 9999,
      //       "name": "历史数据",
      //       "path": "deviceRecord",
      //       "component": null,
      //       "componentName": null,
      //       "icon": "ep:data-line",
      //       "visible": true,
      //       "keepAlive": true,
      //       "alwaysShow": false,
      //       "children": [
      //         {
      //           "id": 99990501,
      //           "parentId": 999905,
      //           "name": "人员进出记录",
      //           "path": "personnelAccess",
      //           "component": "views/monitoring/history/personnelAccess/index.vue",
      //           "componentName": "DeviceRecordPersonnelAccess",
      //           "icon": "",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990502,
      //           "parentId": 999905,
      //           "name": "车辆进出记录",
      //           "path": "vehicleAccess",
      //           "component": "views/monitoring/history/vehicleAccess/index.vue",
      //           "componentName": "DeviceRecordVehicleAccess",
      //           "icon": "",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990503,
      //           "parentId": 999905,
      //           "name": "温度记录",
      //           "path": "temperatureRecord",
      //           "component": "views/monitoring/history/temperature/index.vue",
      //           "componentName": "DeviceRecordTemperature",
      //           "icon": "",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         },
      //         {
      //           "id": 99990504,
      //           "parentId": 999905,
      //           "name": "湿度记录",
      //           "path": "humidityRecord",
      //           "component": "views/monitoring/history/humidity/index.vue",
      //           "componentName": "DeviceRecordHumidity",
      //           "icon": "",
      //           "visible": true,
      //           "keepAlive": true,
      //           "alwaysShow": false,
      //           "children": null
      //         }
      //       ]
      //     },
          
      //   ]

      // }
      // userInfo.menus.push(warehouseMenu);

      wsCache.set(CACHE_KEY.ROLE_ROUTERS, userInfo.menus) //控制接口请求路由
      // wsCache.set(CACHE_KEY.ROLE_ROUTERS, handRouter)
      console.log(userInfo.menus,'u----',)
    },
    async setUserAvatarAction(avatar: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.avatar = avatar
      userInfo.user.avatar = avatar
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async setUserNicknameAction(nickname: string) {
      const userInfo = wsCache.get(CACHE_KEY.USER)
      // NOTE: 是否需要像`setUserInfoAction`一样判断`userInfo != null`
      this.user.nickname = nickname
      userInfo.user.nickname = nickname
      wsCache.set(CACHE_KEY.USER, userInfo)
    },
    async loginOut() {
      await loginOut()
      removeToken()
      deleteUserCache() // 删除用户缓存
      this.resetState()
    },
    resetState() {
      this.permissions = new Set<string>()
      this.roles = []
      this.isSetUser = false
      this.user = {
        id: 0,
        avatar: '',
        username: '',
        nickname: '',
        deptId: 0,
        isSuper: false
      }
    }
  }
})

export const useUserStoreWithOut = () => {
  return useUserStore(store)
}

