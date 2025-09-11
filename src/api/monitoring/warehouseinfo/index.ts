import request from '@/config/axios'

// 仓库信息 VO
export interface WarehouseInfoVO {
  storeName: string // 仓库名称
  storeNum: string // 仓库编号
  acreage: number // 面积
  dangerLevel: string // 危险等级：01-1.1级库房，02-1.3级库房，03-无药库房
  storeAddress: string // 仓库地址
  dosage: number // 核定药量（单位：千克）
  longitude: number // 经度
  personLimit: number // 核定人员
  latitude: number // 纬度
}

// 更新仓库信息参数接口
export interface UpdateWarehouseInfoParams extends WarehouseInfoVO {
    id: string; // 编辑时需要传入 ID
}

// 批量删除仓库信息参数接口
export interface BatchDeleteParams {
  ids: string[]; // 需要删除的仓库 ID 数组
}

  // 查询仓库信息分页
  export const getWarehouseInfoPage = (params) => {
    return request.get({ url: `/mws/warehouse-info/page`, params })
  }

// 查询仓库信息详情
 export const getWarehouseInfo = async (id: string) => { // 明确 id 为 string 类型
  return await request.get({ url: `/mws/warehouse-info/get?id=` + id })
}

// 新增仓库信息
export const createWarehouseInfo = async (data: WarehouseInfoVO) => {
  return await request.post({ url: `/mws/warehouse-info/create`, data })
}

// 更新仓库信息
export const updateWarehouseInfo = async (data: UpdateWarehouseInfoParams) => {
  return await request.put({ url: `/mws/warehouse-info/update`, data });
}

// 批量删除仓库信息
export const deleteWarehouseInfoBatch = async (data: BatchDeleteParams) => {
  return await request.post({ url: `/mws/warehouse-info/delete`, data }); // 使用 POST 方法发送 ID 数组
}

// 删除单个仓库信息
export const deleteWarehouseInfo = async (id: string) => {
  return await request.delete({ url: `/mws/warehouse-info/delete?id=` + id }); // 使用 DELETE 方法和查询参数 id
}

// 新增导出仓库信息接口
export const exportStoreRoomInfoExcel = async (params) => {
  return await request.get({ url: `/mws/warehouse-info/export-excel`, params, responseType: 'blob' }); // 更新 URL
}

// 库房信息 VO (用于创建和更新)
export interface StoreRoomInfoVO {
  storeNum: string; // 所属仓库id
  roomNum: string; // 库房编号
  roomName: string; // 库房名称
  acreage: number; // 面积(平方米)
  dangerLevel: string; // 危险等级
  dosage: number; // 核定药量(千克)
  personLimit: number; // 核定人员
}

// 库房更新参数接口
export interface UpdateStoreRoomInfoParams extends StoreRoomInfoVO {
  id: string; // 编辑时需要传入库房 ID
}

// 新增库房信息
export const createStoreRoomInfo = async (data: StoreRoomInfoVO) => {
  return await request.post({ url: `/mws/store-room-info/create`, data });
}

// 库房列表查询参数
export interface StoreRoomPageParams {
  pageNo: string | number;
  pageSize: string | number;
  // 可能还有其他查询参数，例如按库房名称、编号、所属仓库 ID 等过滤
  roomKeyWord?: string; // 假设可以按关键字搜索库房
  storeNum?: string; // 假设可以按所属仓库 ID 过滤
  dangerLevel?: string; // 添加危险等级过滤参数
}

// 库房列表单项数据结构 (初步推测，可能需要根据实际接口调整)
export interface StoreRoomItem {
  id: string; // 库房 ID
  storeName: string; // 所属仓库名称
  roomNum: string; // 库房编号
  roomName: string; // 库房名称
  acreage: number; // 面积(平方米)
  dangerLevel: string; // 危险等级
  dosage: number; // 核定药量(千克)
  personLimit: number; // 核定人员
  createBy: string; // 创建人
  createDate: number; // 创建时间（时间戳）
  updateBy: string; // 更新人
  updateDate: number; // 更新时间（时间戳）
  logNode: any; // 日志节点 (根据示例数据类型推测，如果实际有更具体类型请告知)
}

// 查询库房信息分页
export const getStoreRoomInfoPage = (params: StoreRoomPageParams) => {
  return request.get({ url: `/mws/store-room-info/page`, params });
}

// 查询库房信息详情
export const getStoreRoomInfo = async (id: string) => {
  return await request.get<StoreRoomItem>({ url: `/mws/store-room-info/get?id=` + id });
}

// 更新库房信息
export const updateStoreRoomInfo = async (data: UpdateStoreRoomInfoParams) => {
  return await request.put({ url: `/mws/store-room-info/update`, data });
}

// 删除单个库房信息
export const deleteStoreRoomInfo = async (id: string) => {
  return await request.delete({ url: `/mws/store-room-info/delete?id=` + id });
}

// 批量删除库房信息参数接口
export interface BatchDeleteStoreRoomParams {
  ids: string[]; // 需要删除的库房 ID 数组
}

// 批量删除库房信息
export const deleteStoreRoomInfoBatch = async (data: BatchDeleteStoreRoomParams) => {
  return await request.post({ url: `/mws/store-room-info/delete`, data }); // 使用 POST 方法发送 ID 数组
}

// 导出库房信息接口
export const exportStoreRoomListExcel = async (params: Omit<StoreRoomPageParams, 'pageNo' | 'pageSize'>) => {
  return await request.get({ url: `/mws/store-room-info/export-excel`, params, responseType: 'blob' });
}

// 库房或仓库类型统计数据接口
export interface RoomOrStoreTypeData {
  typeName: string; // 库房类型名称
  count: number; // 该类型库房数量（个）
  area: number; // 该类型库房面积（㎡）
}

// 获取库区概述信息响应数据接口
export interface CompanyReservoirInfoVO {
  totalArea: number; // 库区总面积（平方米）
  totalDosage: number; // 核定药量（千克）
  storeCount: number; // 仓库数量（个）
  storeTotalArea: number; // 仓库总面积（㎡）
  roomCount: number; // 库房数量（个）
  roomTotalArea: number; // 库房总面积（㎡）
  roomType: RoomOrStoreTypeData[]; // 库房统计明细
  storeType: RoomOrStoreTypeData[]; // 仓库统计明细
}

// 获取库区概述信息
export const getCompanyReservoirInfo = async (): Promise<CompanyReservoirInfoVO> => {
  // 接口返回的数据结构直接是 CompanyReservoirInfoVO 类型
  return await request.get({ url: `/mws/company-reservoir-info/get` });
}

// 企业库区面积新增/修改 Request VO 接口
export interface CompanyReservoirAreaInfoSaveReqVO {
  id?: string; // 主键 (修改时可能有，新增时可能没有)
  companyCode?: string; // 企业code (可能可选)
  reservoirArea: number; // 库区面积（单位：m²），必须为 number(double)
}

// 修改企业库区面积接口
export const updateCompanyReservoirArea = async (data: CompanyReservoirAreaInfoSaveReqVO) => {
  return await request.put({ url: `/mws/company-reservoir-info/update`, data });
}



// 查询仓库列表
export const getWarehouseList = async () => {
  return await request.get({ url: `/mws/warehouse-info/list` });
}

// 查询仓库使用情况
export const getWarehouseUsage = async (id: string) => {
  return await request.get({ url: `/mws/warehouse-info/getUsage?id=${id}` });
}

