import request from '@/config/axios'

// 温度信息 VO
export interface TemperatureInfoVO {
  id: string // 主键
  companyCode: string // 企业code，关联企业信息表中的企业code
  deviceCode: string // 设备code，关联设备表的设备code
  storeNum: string // 仓库编号，关联库房信息表
  storeroomNum: string // 库房编号（可为空）
  realValue: number // 温度实时值
  syncTime: Date // 数据同步时间，每小时上报一次
}

// 温度信息 API
export const TemperatureInfoApi = {
  // 查询温度信息分页
  getTemperatureInfoPage: async (params: any) => {
    return await request.get({ url: `/mws/temperature-info/page`, params })
  },

  // 查询温度信息详情
  getTemperatureInfo: async (id: number) => {
    return await request.get({ url: `/mws/temperature-info/get?id=` + id })
  },

  // 新增温度信息
  createTemperatureInfo: async (data: TemperatureInfoVO) => {
    return await request.post({ url: `/mws/temperature-info/create`, data })
  },

  // 修改温度信息
  updateTemperatureInfo: async (data: TemperatureInfoVO) => {
    return await request.put({ url: `/mws/temperature-info/update`, data })
  },

  // 删除温度信息
  deleteTemperatureInfo: async (id: number) => {
    return await request.delete({ url: `/mws/temperature-info/delete?id=` + id })
  },

  // 导出温度信息 Excel
  exportTemperatureInfo: async (params) => {
    return await request.download({ url: `/mws/temperature-info/export-excel`, params })
  },
}
