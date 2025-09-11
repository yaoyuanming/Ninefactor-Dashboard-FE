import request from '@/config/axios'


// 查询报警记录分页
export const getAlarmRecordPage = (params) => {
  return request.get({ url: '/mws/event-info/page', params })
}

// 获得报警统计
export const getAlarmStatistics = () => {
  return request.get({ url: '/mws/company-statistics/get-alarm' })
}

export const getCarStatistics = () => {
  return request.get({ url: '/mws/company-statistics/get-car-access' })
}

export const getPeopleStatistics = () => {
  return request.get({ url: '/mws/company-statistics/get-card-access' })
}

// 获取设备统计
export const getDeviceCount = () => {
  return request.get({ url: '/mws/company-statistics/get-device' })
}
