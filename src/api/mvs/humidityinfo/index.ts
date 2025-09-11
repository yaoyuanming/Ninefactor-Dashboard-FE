import request from '@/config/axios'

// 湿度信息 VO
export interface HumidityInfoVO {
  id: string // 主键
  companyCode: string // 企业code，关联企业信息表中的企业code
  deviceCode: string // 设备code，关联设备表的设备code
  storeNum: string // 仓库编号，关联库房信息表
  storeroonNum: string // 库房编号（可为空）
  realValue: number // 湿度实时值
  syncTime: Date // 数据同步时间，每小时上报一次
}

// 湿度信息 API
export const HumidityInfoApi = {
  // 查询湿度信息分页
  getHumidityInfoPage: async (params: any) => {
    return await request.get({ url: `/mws/humidity-info/page`, params })
  },

  // 查询湿度信息详情
  getHumidityInfo: async (id: number) => {
    return await request.get({ url: `/mws/humidity-info/get?id=` + id })
  },

  // 新增湿度信息
  createHumidityInfo: async (data: HumidityInfoVO) => {
    return await request.post({ url: `/mws/humidity-info/create`, data })
  },

  // 修改湿度信息
  updateHumidityInfo: async (data: HumidityInfoVO) => {
    return await request.put({ url: `/mws/humidity-info/update`, data })
  },

  // 删除湿度信息
  deleteHumidityInfo: async (id: number) => {
    return await request.delete({ url: `/mws/humidity-info/delete?id=` + id })
  },

  // 导出湿度信息 Excel
  exportHumidityInfo: async (params) => {
    return await request.download({ url: `/mws/humidity-info/export-excel`, params })
  },
}
