import request from '@/config/axios'

// 子平台 VO
export interface PlatformVO {
  id: number // 子平台ID
  name: string // 平台名称
  enName: string // 平台英文名称
  logoUrl: string // 平台logo
  code: string // 平台编号
  status: number // 平台状态（0正常 1停用）
  website: string // 访问地址
  loginBgUrl: string // 登录页背景图片
  remark: string // 备注
  adminStyleConfig: string // 管理端样式配置（前端字段，根据前端配置定义）
  appStyleConfig: string // 移动端样式配置（前端字段，根据前端配置定义）
}

// 子平台 API
export const PlatformApi = {
  // 查询子平台分页
  getPlatformPage: async (params: any) => {
    return await request.get({ url: `/system/platform/page`, params })
  },

  // 查询子平台详情
  getPlatform: async (id: number) => {
    return await request.get({ url: `/system/platform/get?id=` + id })
  },

  // 获得根据code获取子平台信息
  getFindCode: async (id: string) => {
    return await request.get({ url: `/system/platform/get-by-code?platform=` + id })
  },

  // 新增子平台
  createPlatform: async (data: PlatformVO) => {
    return await request.post({ url: `/system/platform/create`, data })
  },

  // 修改子平台
  updatePlatform: async (data: PlatformVO) => {
    return await request.put({ url: `/system/platform/update`, data })
  },

  // 删除子平台
  deletePlatform: async (id: number) => {
    return await request.delete({ url: `/system/platform/delete?id=` + id })
  },

  // 导出子平台 Excel
  exportPlatform: async (params) => {
    return await request.download({ url: `/system/platform/export-excel`, params })
  }
}
