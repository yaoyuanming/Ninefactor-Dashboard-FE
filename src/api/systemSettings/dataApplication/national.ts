import request from '@/config/axios'

// 国民经济类型新增/修改 Request VO
export interface IndustrySaveReqVO {
  id?: number
  industryCode: string
  industryName: string
  parentCode?: string
  orderNum?: number
  status: number
}

// 创建国民经济类型
export const createIndustry = (data: IndustrySaveReqVO) => {
  return request.post({
    url: '/system/industry/create',
    data
  })
}

// 更新国民经济类型
export const updateIndustry = (data: IndustrySaveReqVO) => {
  return request.put({
    url: '/system/industry/update',
    data
  })
}

// 删除国民经济类型
export const deleteIndustry = (id: number) => {
  return request.delete({
    url: `/system/industry/delete?id=${id}`
  })
}

// 获取国民经济类型详情
export const getIndustry = (id: number) => {
  return request.get({
    url: `/system/industry/get?id=${id}`
  })
}

// 获取国民经济类型树列表
export const getIndustryTree = (industryCode?: string) => {
  return request.get({
    url: '/system/industry/industryTree',
    params: industryCode ? { industryCode } : {}
  })
}

// 国民经济类型分页查询参数
export interface IndustryPageReqVO {
  pageNo: string
  pageSize: string
  industryCode?: string
  industryName?: string
  parentCode?: string
  orderNum?: string
  status?: string
  createTime?: string
}

// 获取国民经济类型分页
export const getIndustryPage = (params: IndustryPageReqVO) => {
  return request.get({
    url: '/system/industry/page',
    params
  })
}

// 导出国民经济类型 Excel
export const exportIndustryExcel = (params: IndustryPageReqVO) => {
  return request.get({
    url: '/system/industry/export-excel',
    params,
    responseType: 'blob'
  })
}
