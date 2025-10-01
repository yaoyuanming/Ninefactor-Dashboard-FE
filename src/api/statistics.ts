import axios from 'axios';

// 态势感知统计参数类型
export interface SituationAwarenessParams {
  year: number; // 年（必需）
  month?: number; // 月（可选）
}

/**
 * 态势感知统计
 * @param params 查询参数
 */
export function getSituationAwareness(params: SituationAwarenessParams) {
  return axios.get('/mws/alarm/statistics/situation-awareness', { params });
}
