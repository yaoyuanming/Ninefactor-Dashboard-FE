import request from '@/config/axios'

// 企业基本信息表(一企一档)分页查询参数
export interface CompanyPageReqVO {
  pageNo: string // 页码，从1开始
  pageSize: string // 每页条数，最大值为100
  enterpriseName?: string // 企业名称
  creditCode?: string // 统一社会信用代码
  regionCode?: string // 区域编码
  industryType?: string // 国民经济类型
  regulatoryDepartment?: string // 行业监管部门
  riskLevel?: string // 整体风险等级(红/橙/黄/蓝)
  principal?: string // 企业主要负责人
  principalId?: string // 负责人Id
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)
  lastReportTime?: string // 最近填报时间
  lastLoginTime?: string // 最近登入时间
  status?: string // 企业状态(0-关闭,1-正常,2-锁定)
  longitude?: string // 企业经度
  latitude?: string // 企业纬度
  registerAddress?: string // 企业注册地址
  productionAddress?: string // 企业生产经营地址
  businessScope?: string // 营业执照经营范围
  licenseAnnex?: string // 许可证附件*（多张图片用英文逗号隔开）
  employeeCount?: string // 职工总人数
  lastYearRevenue?: string // 上一年营业收入(万元)
  createTime?: string // 创建时间
}

// 企业基本信息表(一企一档)详情返回数据
export interface CompanyDetailVO {
  id: number // 主键ID
  enterpriseName?: string // 企业名称
  creditCode?: string // 统一社会信用代码
  regionId?: string // 区域编码
  regionName?: string // 区域名称
  industryId?: string // 国民经济类型
  industryName?: string // 国民经济名称
  regulatoryDepartmentId?: string // 行业监管部门ID
  regulatoryDepartmentName?: string // 行业监管部门名称
  riskLevel?: string // 整体风险等级(红/橙/黄/蓝)
  principal?: string // 企业主要负责人
  principalId?: number // 负责人Id
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)
  lastReportTime?: string // 最近填报时间
  lastLoginTime?: string // 最近登入时间
  status?: number // 企业状态(0-关闭,1-正常,2-锁定)
  longitude?: number // 企业经度
  latitude?: number // 企业纬度
  registerAddress?: string // 企业注册地址
  productionAddress?: string // 企业生产经营地址
  businessScope?: string // 营业执照经营范围
  licenseAnnex?: string // 许可证附件*（多张图片用英文逗号隔开）
  employeeCount?: number // 职工总人数
  lastYearRevenue?: number // 上一年营业收入(万元)
  createTime?: string // 创建时间
}

// API 响应结构
export interface CompanyApiResponse {
  code: number
  data: CompanyDetailVO
}

// 企业基本信息表(一企一档)新增/修改请求参数
export interface CompanySaveReqVO {
  id: number // 主键ID
  enterpriseName: string // 企业名称
  creditCode: string // 统一社会信用代码
  regionId?: string // 区域编码Id
  industryId?: string // 国民经济类型Id
  regulatoryDepartmentId: string // 行业监管部门ID
  riskLevel?: string // 整体风险等级(红/橙/黄/蓝)
  principal?: string // 企业主要负责人
  principalId?: number // 负责人Id
  enterpriseScale?: string // 企业规模(大型/中型/小型/微型)
  lastReportTime?: string // 最近填报时间
  lastLoginTime?: string // 最近登入时间
  status: number // 企业状态(0-关闭,1-正常,2-锁定)
  longitude?: number // 企业经度
  latitude?: number // 企业纬度
  registerAddress?: string // 企业注册地址
  productionAddress?: string // 企业生产经营地址
  businessScope?: string // 营业执照经营范围
  licenseAnnex?: string // 许可证附件*（多张图片用英文逗号隔开）
  employeeCount?: number // 职工总人数
  lastYearRevenue?: number // 上一年营业收入(万元)
}

// 获得企业基本信息表(一企一档)分页
export const getCompanyPage = (params: CompanyPageReqVO) => {
  return request.get({
    url: '/mws/company/page',
    params
  })
}

// 获得企业基本信息表(一企一档)详情
export const getCompany = (id: number): Promise<CompanyApiResponse> => {
  return request.get({
    url: '/mws/company/get',
    params: { id }
  })
}

// 更新企业基本信息表(一企一档)
export const updateCompany = (data: CompanySaveReqVO) => {
  return request.put({
    url: '/mws/company/update',
    data
  })
}


// 获得企业统计信息
export const getCompanyStatistics = () => {
  return request.get({
    url: '/mws/company/statistics'
  })
}

// 根据企业ID获得企业风险一张图
export const getCompanyRiskMapById = (id) => {
  return request.get({
    url: '/mws/company/risk-map-by-comp-id',
    params: { id }
  })
}