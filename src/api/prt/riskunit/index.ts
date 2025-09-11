import request from '@/config/axios'

// 风险单元 VO
export interface RiskUnitVO {
  id: number // 风险单元ID
  deptId: number // 部门ID
  riskUnitName: string // 风险单元名称
  riskPoint: string // 风险单元范围json格式（例如：[{"lon":29.256869,"lat":121.235489},{"lon":29.256869,"lat":121.235489}]）
  riskLevel: number // 风险等级*（2：低风险 5：一般风险 8：较大风险 10：重大风险）
}

// 风险单元 API
export const RiskUnitApi = {
  // 查询风险单元分页
  getRiskUnitPage: async (params: any) => {
    return await request.get({ url: `/prt/risk-unit/page`, params })
  },

  // 查询风险单元详情
  getRiskUnit: async (id: number) => {
    return await request.get({ url: `/prt/risk-unit/get?id=` + id })
  },

  // 新增风险单元
  createRiskUnit: async (data: RiskUnitVO) => {
    return await request.post({ url: `/prt/risk-unit/create`, data })
  },

  // 修改风险单元
  updateRiskUnit: async (data: RiskUnitVO) => {
    return await request.put({ url: `/prt/risk-unit/update`, data })
  },

  // 删除风险单元
  deleteRiskUnit: async (id: number) => {
    return await request.delete({ url: `/prt/risk-unit/delete?id=` + id })
  },

  // 导出风险单元 Excel
  exportRiskUnit: async (params) => {
    return await request.download({ url: `/prt/risk-unit/export-excel`, params })
  },
}
