import request from '@/config/axios'

// 风险点 VO
export interface RiskVO {
  id: number // 风险点ID
  value: any // 风险点ID
  label: any // 风险点ID
  deptId: number // 部门ID
  riskUnitId: number // 风险单元id
  riskName: string // 风险点名称
  inherentRisk: number // 固有风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）
  existingRisk: number // 现实风险*（2：低风险 5：一般风险 8：较大风险 10：重大风险）（取字典字段'risk_level'）
  riskType: number // 风险点类型*（5：场所 10：设备设施 15：常规作业 20：特殊作业 25：管理）
  isEnable: number // 是否启用*（0：停用 1：在用）
  controlEffectiveness: number // 管控有效性*（0：无效，1:有效）
  controlLevel: string // 管控层级*（默认 2：单位 3：部门 4：岗位）也可自定义
  respDeptId: number // 责任部门id
  respDeptName: string // 责任部门名称
  respUserId: number // 管控负责人id
  respUserName: string // 管控负责人姓名
  supervisorUser: string // 监管人员ID组（多条采用英文逗号隔开）（用户表ID）
  inspectorUser: string // 验收人员ID组（多条采用英文逗号隔开）（用户表ID）
  dataSources: number // 数据来源*（1：手动 2：风险数据库）
}

// 风险监管 API
export const RiskLevelApi = {
  getRiskLevel: async (params: any) => {
    return await request.get({ url: `/prt/risk-level/get`, params })
  },
  getRiskLevelPage: async (params: any) => {
    return await request.get({ url: `/prt/risk-level/page`, params })
  },

}
