// 温湿度设备概述接口
import request from '@/config/axios';

/**
 * 获取温湿度设备概述
 * @returns Promise<any>
 */
export function getRiskMonitorOverview() {
  return request.get({
    url: '/mws/analysis/risk-monitor/get',
  });
}

/**
 * 获取仓库设备实时值和历史值
 * @param endTime 结束时间（必填，string）
 * @returns Promise<any>
 */
export function getRiskMonitorHistoryValue(endTime: string) {
  return request.get({
    url: '/mws/analysis/risk-monitor/get-history-value',
    params: { endTime },
  });
}
