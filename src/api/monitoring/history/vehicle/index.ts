import request from '@/config/axios'

export interface GetVehicleRecordPageReqVO {
  pageNum: string // 页码
  pageSize: string // 每页大小
  recordType?: string // 记录类型（enter/exit）
  carType?: string // 车辆类型 (1-内部车，0-外部车)
  ownerCode?: string // 车主编码
  ownerLikeStr?: string // 车主名称模糊查询
  carNumLikeStr?: string // 车牌号模糊查询
  timeStrLeft?: string // 时间起，格式 yyyy-MM-dd HH:mm:ss
  timeStrRight?: string // 时间止，格式 yyyy-MM-dd HH:mm:ss
}

export interface VehicleRecordVO {
  id: number
  recordType: string
  carType: number
  carTypeStr: string
  etcType: number
  ownerType: number
  parkingLot: string
  parkingLotCode: string
  payedMoney: number
  parkingCarLogo: string
  parkingCarColor: string
  carNum: string
  peopleNum: number
  peopleName: string
  imageUrl: string
  numImageUrl: string
  itcDevChnId: string
  itcDevChnName: string
  sluiceDevChnId: string
  sluiceDevChnName: string
  time: string
  timeStr: string
  wayCode: string
  originalPicPath: string
  realCapturePicPath: string
  mode: number
}

export interface GetVehicleRecordPageRespVO {
  pageData: VehicleRecordVO[]
  currentPage: number
  totalPage: number
  pageSize: number
  totalRows: number
}

// CarAccessRecordUpdateVO 接口定义
export interface CarAccessRecordUpdateVO {
  id: string; // 记录ID
  peopleNum: number; // 人员数量
  peopleName: string; // 人员姓名（逗号隔开）
}

// 更新车辆出入记录
export const updateCarAccessRecord = (data: CarAccessRecordUpdateVO) => {
  return request.put({ url: '/mws/device-sensor-info/car-record-update', data });
};

// 查询车辆出入记录分页
export const getVehicleRecordPage = (params: GetVehicleRecordPageReqVO) => {
  return request.get<GetVehicleRecordPageRespVO>({ url: '/mws/device-sensor-info/car-record-by-page', params })
}
