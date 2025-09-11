import request from '@/config/axios'

// 管理后台 - 企业基本信息新增/修改 Request VO
export interface CompanyInfoSaveReqVO {
  id?: string // 自动生成的UUID, 修改时需要传入
  lxCode: string // 流向系统内的企业code
  companyname: string // 企业名称
  companyCode: string // 10位的企业编码
  businessLicense: string // 经营批发许可证
  businessLicenseFile: string // 许可证附件（传输文件服务器的相对路径）
  businessLicenseStart: string // 许可证开始日期，例如：2020-01-01
  businessLicenseEnd: string // 许可证截止日期，例如：2030-01-01
  businessLicensescope: string // 许可证证书范围
  businessLicenseIssuingAuthority: string // 许可证发证机关
  address: string // 仓储地址
  registerAddress: string // 注册地址
  companyType: string // 企业类型
  companyStatus: number // 企业状态
  accessStatus: number // 接入状态：0-未接入，1-已接入
  dosage: number // 核定药量
  reservoirArea: string // 库区面积，例如：2000m²
  storeroomArea: string // 库房面积，例如：1000m²
  longitude: number // 经度
  latitude: number // 纬度
  provinceName: string // 省名称
  cityName: string // 市名称
  areaname: string // 区县名称
  provinceCode: string // 省code
  cityCode: string // 市code
  areaCode: string // 区县code
}

// 管理后台 - 企业基本信息分页 Request VO
export interface CompanyInfoPageReqVO {
  pageNo: number // 页码
  pageSize: number // 每页条数
  // 根据实际情况添加其他查询条件字段
  companyname?: string // 企业名称，示例查询条件
  companyCode?: string // 企业编码，示例查询条件
  // ... 其他可能的查询字段
}

// 管理后台 - 企业基本信息分页 Response VO
export interface CompanyInfoPageResp {
  list: CompanyInfoSaveReqVO[] // 企业基本信息列表
  total: number // 总记录数
}

// 创建企业基本信息接口
export const createCompanyInfo = (data: CompanyInfoSaveReqVO) => {
  return request.post({url: '/mws/company-info/create', data})
}

// 更新企业基本信息接口
export const updateCompanyInfo = (data: CompanyInfoSaveReqVO) => {
  return request.put({ url: '/mws/company-info/update', data })
}

// 删除企业基本信息接口
export const deleteCompanyInfo = (id: string) => {
  return request.delete({ url: '/mws/company-info/delete', params: { id } })
}

// 获得企业基本信息接口
export const getCompanyInfo = (id: string) => {
  return request.get({ url: '/mws/company-info/get', params: { id } })
}

// 获得企业基本信息分页列表接口
export const getCompanyInfoPage = (params: CompanyInfoPageReqVO)=> {
  return request.get({ url: '/mws/company-info/page', params })
}
