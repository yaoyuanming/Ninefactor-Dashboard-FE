import request from '@/config/axios'

// 隐患整改单分页查询参数
export interface DangerRectPageReqVO {
  pageNo: string // 页码，从 1 开始
  pageSize: string // 每页条数，最大值为 100
  deptId?: string // 企业ID
  deptName?: string // 企业名称
  provinceCode?: string // 省code
  cityCode?: string // 市code
  areaCode?: string // 区县code
  riskId?: string // 风险点id
  inspectRecordId?: string // 检查记录ID
  rectConditionType?: string // 隐患整改单状态（5：未整改 6：逾期未整改 50：整改完成）
  dangerRectCode?: string // 隐患整改单编号
  dangerDesc?: string // 隐患描述
  dangerLevel?: string // 隐患等级（5：一般隐患 10：重大隐患）
  dangerSource?: string // 隐患来源（1：企业日常检查 2：企业专项检查 3：政府专项检查 4：隐患速记）
  dangerAddress?: string // 隐患地点
  dangerUrl?: string // 隐患图片url（多条用英文逗号隔开）
  inspectUserId?: string // 检查人员ID（检查记录信息）
  inspectUserName?: string // 检查人员姓名（检查记录信息）
  inspectTime?: string // 检查时间（即检查上报时间）（检查记录信息）
  respDeptId?: string // 责任部门id
  respDeptName?: string // 责任部门名称
  rectChargeUserId?: string // 整改责任人ID
  rectChargeUserName?: string // 整改责任人姓名
  timeLimit?: string // 整改完成期限
  rectCompleteUrl?: string // 隐患整改后图片url（多条用英文逗号隔开）
  rectCompletionState?: string // 整改完成情况
  rectCompleteTime?: string // 整改完成时间
  inspectId?: string // 检查单ID
  inspectCode?: string // 检查单编号（检查单表冗余字段）
  createTime?: string // 创建时间
  industryId?: string // 国民经济类型id
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)
  riskEnvTypes?: string // 所涉高危环境类型（0未涉及 1有限空间 2粉尘涉爆 3涉氮制冷）
}

// 隐患整改单 VO
export interface DangerRectVO {
  id?: string
  deptId?: string // 企业ID
  deptName?: string // 企业名称
  provinceCode?: string // 省code
  cityCode?: string // 市code
  areaCode?: string // 区县code
  riskId?: string // 风险点id
  inspectRecordId?: string // 检查记录ID
  rectConditionType?: number // 隐患整改单状态（5：未整改 6：逾期未整改 50：整改完成）
  dangerRectCode?: string // 隐患整改单编号
  dangerDesc?: string // 隐患描述
  dangerLevel?: number // 隐患等级（5：一般隐患 10：重大隐患）
  dangerSource?: number // 隐患来源（1：企业日常检查 2：企业专项检查 3：政府专项检查 4：隐患速记）
  dangerAddress?: string // 隐患地点
  dangerUrl?: string // 隐患图片url（多条用英文逗号隔开）
  inspectUserId?: string // 检查人员ID（检查记录信息）
  inspectUserName?: string // 检查人员姓名（检查记录信息）
  inspectTime?: string // 检查时间（即检查上报时间）（检查记录信息）
  respDeptId?: string // 责任部门id
  respDeptName?: string // 责任部门名称
  rectChargeUserId?: string // 整改责任人ID
  rectChargeUserName?: string // 整改责任人姓名
  timeLimit?: string // 整改完成期限
  rectCompleteUrl?: string // 隐患整改后图片url（多条用英文逗号隔开）
  rectCompletionState?: string // 整改完成情况
  rectCompleteTime?: string // 整改完成时间
  inspectId?: string // 检查单ID
  inspectCode?: string // 检查单编号（检查单表冗余字段）
  createTime?: string // 创建时间
  updateTime?: string // 更新时间
}

// 区域辨识情况请求参数类型
export interface RegionRiskStatisticsReqVO {
  regionId: string
}

// 风险管控详情请求参数类型
export interface RiskControlDetailReqVO {
  pageNo: string
  pageSize: string

  enterpriseName?: string
  regionId?: string
  riskLevel?: string
  industryId?: string // 行业ID
  riskEnvTypes?: string // 高危环境类型（逗号分隔）
}

// 风险点趋势请求参数类型
export interface RiskTrendReqVO {
  endDate: string
}

// 获得隐患整改单分页
export const getDangerRectPage = (params: DangerRectPageReqVO) => {
  return request.get({
    url: '/prt/danger-rect/page',
    params
  })
}

// 获取已辨识企业概况
export const getEnterpriseRiskStatistics = () => {
  return request.get({
    url: '/prt/risk-statistics/enterprise'
  })
}

// 获取区域辨识情况(返回子区域数据)
export const getRegionRiskStatistics = (params: RegionRiskStatisticsReqVO) => {
  return request.get({
    url: '/prt/risk-statistics/region',
    params
  })
}

// 获取风险管控详情
export const getRiskControlDetail = (params: RiskControlDetailReqVO) => {
  return request.get({
    url: '/prt/risk-statistics/risk-control-detail',
    params
  })
}

// 获取已辨识风险点概况
export const getRiskPointStatistics = () => {
  return request.get({
    url: '/prt/risk-statistics/risk-point'
  })
}

// 获取风险点趋势
export const getRiskTrend = (params: RiskTrendReqVO) => {
  return request.get({
    url: '/prt/risk-statistics/risk-trend',
    params
  })
}

// 根据企业ID获取风险统计信息请求参数类型
export interface RiskStatisticsByCompIdReqVO {
  compId: string
}

// 根据企业ID获取风险统计信息
export const getRiskStatisticsByCompId = (params: RiskStatisticsByCompIdReqVO) => {
  return request.get({
    url: '/prt/risk-statistics/by-comp-id',
    params
  })
}






