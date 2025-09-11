import request from '@/config/axios'

/**
 * 预警信息推送记录分页查询参数
 */
export interface WarningPushRecordPageParams {
  /** 页码，从1开始 */
  pageNo: string;
  /** 每页条数，最大值为100 */
  pageSize: string;
  /** 企业code */
  companyCode?: string;
  /** 企业名称 */
  companyName?: string;
  /** 风险等级：1-重大，2-较大，3-一般，4-低 */
  riskLevel?: string;
  /** 推送内容 */
  pushContent?: string;
  /** 推送状态：0-未下发，1-已下发，2-已反馈 */
  pushType?: string;
  /** 反馈意见，企业需填写反馈说明 */
  feedback?: string;
  /** 省code，用于区分省份 */
  provinceCode?: string;
  /** 市code */
  cityCode?: string;
  /** 区县code */
  areaCode?: string;
  /** 省名称 */
  provinceName?: string;
  /** 市名称 */
  cityName?: string;
  /** 区县名称 */
  areaName?: string;
  /** 开始推送时间 */
  beginPushTime?: string;
  /** 结束推送时间 */
  endPushTime?: string;
}

/**
 * 获得预警信息推送记录分页接口
 * @param params 分页查询参数
 * @returns Promise<any>
 */
export const getWarningPushRecordPage = (params: WarningPushRecordPageParams) => {
  return request.get({
    url: '/mws/warning-push-record/page',
    params,
  })
}

/**
 * 预警信息处理请求 VO
 */
export interface WarningHandleVO {
  /** 主键，数据下发和上报的唯一标识 */
  id: string;
  /** 反馈意见，企业需填写反馈说明 */
  feedback: string;
  /** 图片以，隔开 */
  handlePictures: string;
}

/**
 * 预警信息处理接口
 * @param data 预警处理参数 WarningHandleVO
 * @returns Promise<any>
 */
export const handleWarningPushRecord = (data: WarningHandleVO) => {
  return request.put({
    url: '/mws/warning-push-record/handle',
    data,
  })
}

/**
 * 获得预警信息推送记录接口
 * @param id 预警推送记录编号
 * @returns Promise<any>
 */
export const getWarningPushRecord = (id: string) => {
  return request.get({
    url: '/mws/warning-push-record/get',
    params: { id },
  })
}

/**
 * 获取未消警数量
 */
export const getUnhandleCount = () => {
  return request.get({ url: '/mws/warning-push-record/un-handle-count' });
};


