import request from '@/config/axios'

// 门禁出入记录分页请求参数
export interface GetCardRecordPageReqVO {
  pageNum: string // 页码
  pageSize: string // 分页大小
  startSwingTime?: string // 刷卡开始时间(yyyy-MM-dd HH:mm:ss)
  endSwingTime?: string // 刷卡结束时间(yyyy-MM-dd HH:mm:ss)
  personName?: string // 人员名称(支持汉字字母数字-_.@)
  personCode?: string // 人员编号(字母/数字)
  enterOrExit?: string // 事件类型：1-进门,2-出门,3-进/出门
  visitorFilter?: string // 1-只查访客,2-只查非访客
}

// 门禁出入记录单条数据
export interface CardRecordVO {
  cardNumber: string
  cardStatus: number
  cardType: number
  channelCode: string
  channelName: string
  deviceCode: string
  deviceName: string
  enterOrExit: number
  id: number
  swingTime: string
  createTime: string
  openResult: number
  openType: number
  remark: string
  imageType: number
  paperNumber: string
  personCode: string
  personId: number
  personName: string
  maskState: number
  overTemp: boolean
  curTemp: number
  recordImageUrl: string
  recordImage: string // 注意：根据接口返回，recordImage 可能是完整的 URL
}

// 门禁出入记录分页返回数据
export interface GetCardRecordPageRespVO {
  pageData: CardRecordVO[]
  currentPage: number
  totalPage: number
  pageSize: number
  totalRows: number
}

// 查询门禁出入记录分页
export const getCardRecordPage = (params: GetCardRecordPageReqVO) => {
  return request.get<GetCardRecordPageRespVO>({ url: '/mws/device-sensor-info/card-record-by-page', params })
}
