import axios from 'axios';

// 报警信息列表查询参数类型
export interface AlarmPageParams {
  pageNo?: number;
  pageSize?: number;
  beginTime?: string;
  endTime?: string;
  params?: string;
  enterpriseName?: string;
  areaCode?: string;
  alarmType?: number; // 报警类型
  alarmStatus?: number; // 报警状态
}

/**
 * 获取报警信息列表
 * @param params 查询参数
 */
export function getAlarmPage(params?: AlarmPageParams) {
  return axios.get('/mws/alarm/page', { params });
}

/**
 * 根据ID获取报警信息详情
 * @param id 报警ID
 */
export function getAlarmById(id: string) {
  return axios.get(`/mws/alarm/${id}`);
}
