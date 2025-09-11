import request from '@/config/axios'

  // 查询仓库信息分页
  export const getWarehouseInfoPage = (params) => {
    return request.get({ url: `/mws/warehouse-info/page`, params })
  }

/**
 * 设备分页查询
 * @param params 查询参数，详见参数说明
 * @returns 设备分页数据
 */
export interface DevicePageParams {
  /** 当前页, 默认1 */
  pageNum: string;
  /** 每页记录数, 默认10 */
  pageSize: string;
  /** 是否包含子节点设备（1是，0否） */
  showChildNodeData?: string;
  /** 设备所属组织编码集合 */
  ownerCodes?: string;
  /** 单元类型列表 */
  unitTypes?: string;
  /** 设备大类列表 */
  categorys?: string;
  /** 设备小类列表(格式: 大类_小类), 与categorys同时存在时无效 */
  types?: string;
  /** 设备编码列表(最大支持500个) */
  deviceCodes?: string;
  /** 设备标识码列表(最大支持500个) */
  deviceSns?: string;
  /** 设备地址列表(最大支持500个) */
  deviceIps?: string;
  /** 在线状态,可用值:0,1 */
  isOnline?: string;
}

/**
 * 设备分页查询接口
 * @param params 设备分页查询参数
 * @returns Promise<any>
 */
export const getDevicePage = (params: DevicePageParams) => {
  return request.get({
    url: '/mws/device-info/page',
    params,
  })
}

/**
 * 管理后台 - 设备关联库区新增/修改 Request VO
 */
export interface StoreRoomDeviceSaveReqVO {
  /** 主键，可选，编辑时传 */
  id?: string;
  /** 仓库id，必填 */
  storeNum: string;
  /** 库房id，可选 */
  roomNum?: string;
  /** 设备编码，必填 */
  deviceCode: string;
}

/**
 * 设备编辑接口
 * @param data 设备信息参数 StoreRoomDeviceSaveReqVO
 * @returns Promise<any>
 */
export const updateDeviceInfo = (data: StoreRoomDeviceSaveReqVO) => {
  return request.put({
    url: '/mws/device-info/update',
    data,
  })
}

export interface DeviceUnbindReqVO {
  /** 仓库id，必填 */
  storeNum: string;
  /** 设备编码，必填 */
  deviceCode: string;
}

/**
 * 设备解绑接口
 * @param data 设备解绑参数 DeviceUnbindReqVO
 * @returns Promise<any>
 */
export const unbindDevice = (data: DeviceUnbindReqVO) => {
  return request.put({
    url: '/mws/device-info/unbind',
    data,
  })
}
