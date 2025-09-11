import request from '@/config/axios';

// 获取预警事件趋势
export const getWarningEventTrend = async (endTime: string) => {
  return await request.get({
    url: '/mws/analysis/warning-info/getWarningEventTrend',
    params: { endTime }
  });
};

// 获取预警事件概况
export const getWarningStats = async (endTime: string) => {
  return await request.get({
    url: '/mws/analysis/warning-info/getWarningStats',
    params: { endTime }
  });
};
