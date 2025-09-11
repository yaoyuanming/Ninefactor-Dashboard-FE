import request from '@/config/axios'

/**
 * 获得企业统计信息
 * @returns Promise<any>
 */
export const getCompanyStatistics = () => {
  return request.get({
    url: '/mws/company/statistics',
  })
}

export const getCompanyList = (params) => {
  return request.get({
    url: '/mws/company/page',
    params
  })
}

export const getDangerStatistics = () => {
  return request.get({
    url: '/prt/danger-statistics/inspected-overview',
  })
}

export const getInspectionStatistics = () => {
  return request.get({
    url: '/prt/inspection-statistics/danger',
  })
}

export const getRiskStatistics = () => {
  return request.get({
    url: '/prt/risk-statistics/enterprise',
  })
}

export const getDangerStatisticsDayList = (params) => {
  return request.get({
    url: '/prt/risk-statistics/patrol-rate',
    params
  })
}

export const getMonthlyAddList = (params) => {
  return request.get({
    url: '/prt/danger-statistics/monthly-add',
    params
  })
}

// 零申报企业数量
export const getZeroDeclarationCount = () => {
  return request.get({
    url: '/prt/danger-statistics/zero-reporting-companies',
  })
}



