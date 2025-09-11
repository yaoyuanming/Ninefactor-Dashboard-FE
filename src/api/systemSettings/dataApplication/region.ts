import request from '@/config/axios'

// 区域管理新增/修改 Request VO
export interface RegionSaveReqVO {
  id?: number
  regionCode: string
  regionName: string
  regionLevel: number
  parentCode?: string
  orderNum?: number
  status: number
}

// 创建区域
export const createRegion = (data: RegionSaveReqVO) => {
  return request.post({ 
    url: '/system/region/create',
    data 
  })
}

// 更新区域
export const updateRegion = (data: RegionSaveReqVO) => {
  return request.put({ 
    url: '/system/region/update',
    data 
  })
}

// 删除区域
export const deleteRegion = (id: number) => {
  return request.delete({ 
    url: `/system/region/delete?id=${id}` 
  })
}

// 区域分页查询参数
export interface RegionPageReqVO {
  pageNo: string
  pageSize: string
  regionCode?: string
  regionName?: string
  regionLevel?: string
  parentCode?: string
  orderNum?: string
  status?: string
  createTime?: string
}

// 获取区域分页
export const getRegionPage = (params: RegionPageReqVO) => {
  return request.get({ 
    url: '/system/region/page',
    params 
  })
}

// 获取区域详情
export const getRegion = (id: number) => {
  return request.get({ 
    url: `/system/region/get?id=${id}` 
  })
}

// 获取区域树列表
export const getRegionTree = (regionCode?: string) => {
  return request.get({ 
    url: '/system/region/regionTree',
    params: regionCode ? { regionCode } : {}
  })
}

// 导出区域管理 Excel
export const exportRegionExcel = (params: RegionPageReqVO) => {
  return request.get({ 
    url: '/system/region/export-excel',
    params,
    responseType: 'blob'
  })
}