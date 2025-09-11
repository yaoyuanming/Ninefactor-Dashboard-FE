import request from '@/config/axios'

// 检查清单概况
export const getCheckListStatistics = () => {
  return request.get({
    url: '/prt/inspection-statistics/check-list'
  })
}

// 专项检查隐患治理概况
export const getDangerStatistics = () => {
  return request.get({
    url: '/prt/inspection-statistics/danger'
  })
}

// 已部署企业专项检查任务概况
export const getTaskStatistics = () => {
  return request.get({
    url: '/prt/inspection-statistics/task'
  })
}

