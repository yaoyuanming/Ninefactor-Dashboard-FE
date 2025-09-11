import request from '@/config/axios'

// 隐患治理详情请求参数类型
export interface DangerStatisticsDetailsReqVO {
  regionId: string
  pageNo: string
  pageSize: string
  deptId?: string
  deptName?: string
  provinceCode?: string
  cityCode?: string
  areaCode?: string
  riskId?: string
  inspectRecordId?: string
  rectConditionType?: string
  dangerRectCode?: string
  dangerDesc?: string
  dangerLevel?: string
  dangerSource?: string
  dangerAddress?: string
  dangerUrl?: string
  inspectUserId?: string
  inspectUserName?: string
  inspectTime?: string
  respDeptId?: string
  respDeptName?: string
  rectChargeUserId?: string
  rectChargeUserName?: string
  timeLimit?: string
  rectCompleteUrl?: string
  rectCompletionState?: string
  rectCompleteTime?: string
  inspectId?: string
  inspectCode?: string
  createTime?: string
}

// 每月新增隐患数请求参数类型
export interface MonthlyAddDangerReqVO {
  year: number
}

// 区域隐患治理情况请求参数类型
export interface RegionalManagementReqVO {
  regionId: string
}

// 已排查隐患总数请求参数类型
export interface TotalInspectedReqVO {
  endDate: string
}

// 获取隐患治理详情
export const getDangerStatisticsDetails = (params: any) => {
  return request.get({
    url: '/prt/danger-statistics/details',
    params
  })
}

// 获取已排查隐患概况
export const getInspectedDangerOverview = () => {
  return request.get({
    url: '/prt/danger-statistics/inspected-overview'
  })
}

// 获取每月新增隐患数
export const getMonthlyAddDanger = (params: MonthlyAddDangerReqVO) => {
  return request.get({
    url: '/prt/danger-statistics/monthly-add',
    params
  })
}

// 获取区域隐患治理情况
export const getRegionalManagement = (params: RegionalManagementReqVO) => {
  return request.get({
    url: '/prt/danger-statistics/regional-management',
    params
  })
}

// 获取已排查隐患总数
export const getTotalInspected = (params: TotalInspectedReqVO) => {
  return request.get({
    url: '/prt/danger-statistics/total-inspected',
    params
  })
}


// 根据企业ID获取隐患治理统计请求参数类型
export interface DangerStatisticsByCompIdReqVO {
  compId: string
}

// 根据企业ID获取隐患治理统计
export const getDangerStatisticsByCompId = (params: DangerStatisticsByCompIdReqVO) => {
  return request.get({
    url: '/prt/danger-statistics/by-comp-id',
    params
  })
}


