import request from '@/config/axios';

/**
 * 获取天气预警列表
 * @param params 查询参数
 * @returns 天气预警列表数据
 */
export const getWarningStats = async () => {
  return await request.get({url: '/mws/weather-alert/list'});
};

/**
 * 天气预警信息分页查询参数
 */
export interface WeatherWarningPageParams {
  /** 页码，从1开始 */
  pageNo: string;
  /** 每页条数，最大值为100 */
  pageSize: string;
  /** 企业code */
  companyCode?: string;
  /** 企业id */
  compId?: string;
  /** 城市ID */
  areacode?: string;
  /** 预警地区编码 */
  geocode?: string;
  /** 预警标题 */
  title?: string;
  /** 预警详情 */
  detail?: string;
  /** 预警类型码 */
  typeCode?: string;
  /** 预警类型 */
  typeLabel?: string;
  /** 预警等级码 */
  levelCode?: string;
  /** 预警等级 */
  levelLabel?: string;
  /** 预警发布时间 */
  publicTime?: string;
  /** 预警生效时间 */
  effective?: string;
  /** 预警失效时间 */
  expires?: string;
  /** 处理人 */
  handleUser?: string;
  /** 处理时间 */
  handleTime?: string;
  /** 处理内容 */
  handleContent?: string;
  /** 处理图片路径，多个图片用逗号(,)分隔 */
  handleImages?: string;
  /** 处理状态：0-未处理，1-处理中，2-已处理 */
  status?: string;
}

/**
 * 获得天气预警信息分页接口
 * @param params 分页查询参数
 * @returns Promise<any>
 */
export const getWeatherWarningPage = (params: WeatherWarningPageParams) => {
  return request.get({
    url: '/mws/weather-warning/page',
    params,
  })
}

/**
 * 获取未处理天气预警数量
 */
export const getWeatherWarningUnhandleCount = () => {
  return request.get({ url: '/mws/weather-warning/un-handle-count' });
};

/**
 * 获取天气预警信息
 * @param id 编号
 * @returns Promise<any>
 */
export function getWeatherWarningInfo(id: number) {
  return request.get({
    url: '/mws/weather-warning/get',
    params: { id },
  });
}

/**
 * 天气预警处理 VO
 */
export interface WeatherHandleVO {
  id: number;
  handleContent?: string;
  handleImages?: string;
}

/**
 * 天气预警处理接口
 * @param data 天气预警处理参数 WeatherHandleVO
 * @returns Promise<any>
 */
export function handleWeatherWarning(data: WeatherHandleVO) {
  return request.put({
    url: '/mws/weather-warning/handle',
    data,
  });
}

