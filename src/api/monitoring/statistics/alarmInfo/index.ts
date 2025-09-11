import request from '@/config/axios';

// 获取事件实时概况
export const getEventRealTimeOverview = async (endTime: string) => {
  return await request.get({
    url: '/mws/analysis/alarm-info/getEventRealTimeOverview',
    params: { endTime: endTime }
  });
};

// 获取报警事件趋势
export const getEventTrend = async (endTime: string) => {
  return await request.get({
    url: '/mws/analysis/alarm-info/getEventTrend',
    params: { endTime: endTime }
  });
};
