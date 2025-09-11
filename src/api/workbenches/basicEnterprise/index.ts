import request from '@/config/axios'

// 风险点 VO
export interface compInfoSaveReqVO {
  riskEnvTypesBack: number[] | null
  leaderUserId: string // 负责人
  phone: string // 负责人手机号
  deptId: string // 部门ID
  socialCode: string // 企业统一社会代码
  leaderName: string // 企业统一社会代码
  industryId: string // 行业类型ID,示例值(3841)
  nationalEconomy: string // 国民经济类型编号
  compScale: string // 企业规模*（2：规上企业 5：中等企业 7：小型企业 9：小微企业）
  city: string // 营业执照城市
  address: string // 营业执照地址
  areaCode: string // 营业执照区域编号
  compLng: string // 单位经度
  compLat: string // 单位纬度
  compAreaLngLat: string // 企业地址范围
  actualAreaCode: string // 经营区域编号
  actualAddress: string // 经营地址
  businessScope: string // 营业执照经营范围
  certificationCompName: string //	企业名称（营业执照上的企业名称）,示例值(王五)
  description: string // 企业简介,示例值(你猜)
  employeeNum: string // 职工人数
  lastYearIncome: string // 上一年营业收入（万元）
  hasRiskEnv: string // 	是否涉及高危环境（0否 1是）
  riskEnvTypes: string // 	所涉高危环境类型*（1有限空间 2粉尘涉爆 3涉氮制冷）(多个英文逗号隔开)（条件：has_risk_env为1）
  dustType: string // 	粉尘类别*（1铝镁粉尘 2木粉尘）（条件：risk_env_types包含2）,示例值(1)
  nitrogenHasRisk: string // 	涉氮制冷是否构成重大危险源*（0否 1是）
  riskReserves: string // 	重大危险源储量
  riskLevel: string // 危险等级（1 2 3）
  remark: string //备注,示例值(随便)
}

// 企业信息 API
export const compInfoSaveReqApi = {
  // // 查询风险点分页
  // getRiskPage: async (params: any) => {
  //   return await request.get({ url: `/prt/risk/page`, params })
  // },

  // 查询获得企业信息
  getCompInfo: async (id: number) => {
    return await request.get({ url: `/system/comp-info/info-by-comp-id?id=` + id })
  },
  // 查询企业风险一张图
  getRiskMap: async (id: number) => {
    return await request.get({ url: `/system/comp-info/risk-map-by-comp-id?id=` + id })
  },

  // 新增企业信息
  createCompInfo: async (data: compInfoSaveReqVO) => {
    return await request.post({ url: `/system/comp-info/create`, data })
  },

  // 修改风险点
  updateCompInfo: async (data: compInfoSaveReqVO) => {
    return await request.put({ url: `/system/comp-info/update`, data })
  }
  //
  // // 删除风险点
  // deleteRisk: async (id: number) => {
  //   return await request.delete({ url: `/prt/risk/delete?id=` + id })
  // },
  //
  // // 导出风险点 Excel
  // exportRisk: async (params) => {
  //   return await request.download({ url: `/prt/risk/export-excel`, params })
  // },
}
