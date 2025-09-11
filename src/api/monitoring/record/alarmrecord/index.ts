import request from '@/config/axios'


// 查询报警记录分页
export const getAlarmRecordPage = (params: AlarmRecordPageReqVO) => {
  return request.get({ url: '/mws/event-info/page', params })
}

// 查询报警详情信息
export const getAlarmDetail = (id: string) => {
  return request.get({ url: '/mws/event-info/get', params: { id } })
}

// 报警处理接口
export const handleAlarm = (params: EventHandleReqVO) => {
  return request.put({ url: '/mws/event-info/handle', data: params })
}

// 查询未处理报警统计数量
export const getUnhandleAlarmCount = () => {
  return request.get({ url: '/mws/event-info/un-handle-count' })
}

// 请求参数类型定义
export interface EventHandleReqVO {
  alarmCode: string; // 报警记录code
  alarmDate: string; // 报警时间，形式：yyyy-MM-dd HH:mm:ss
  handleType?: string; // 消警类型
  handleMessage?: string; // 处理内容
  handlePictures?: string; // 消警后图片urls
}

export interface AlarmRecordPageReqVO {
  pageNum: string; // 当前页码
  pageSize: string; // 每页记录数
  sort?: string; // 排序字段
  sortType?: string; // 排序方式
  alarmStat?: string; // 报警状态（1：报警产生，2：报警消失）
  handleStat?: string; // 处理状态（0未处理，1处理中，2已处理，3误报，4忽略）对应 消警状态（0未消警，2已消警）
  orgCodeList?: string; // 所属组织编码列表
  nodeCodeList?: string; // 设备编码或通道编码列表
  alarmStartDateString?: string; // 报警开始时间，格式 yyyy-MM-dd HH:mm:ss
  alarmEndDateString?: string; // 报警结束时间，格式 yyyy-MM-dd HH:mm:ss
  handleStartDateString?: string; // 处理开始时间，格式 yyyy-MM-dd HH:mm:ss
  handleEndDateString?: string; // 处理结束时间，格式 yyyy-MM-dd HH:mm:ss
  alarmType?: string; // 事件类型
  alarmGrade?: string; // 报警等级列表（1：严重；2：一般；3：轻微）
}
