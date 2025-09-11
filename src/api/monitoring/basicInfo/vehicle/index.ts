import request from '@/config/axios'


// 车辆信息分页查询 Request VO
export interface CarInfoPageReqVO {
  pageNo: number // 页码
  pageSize: number // 分页大小
 
}

// 车辆信息分页查询
export const getCarInfoPage = (data: CarInfoPageReqVO) => {
  return request.post({ url: '/mws/car-info/page', data })
}




// 更新车辆信息
export const editCarInfo = async (data) => {
  return await request.put({ url: '/mws/car-info/update', data });
}

// 车辆信息详细查询
export const getCarDetailsByCode = async (id) => {
  return await request.get({ url: '/mws/car-info/get', params: { id } });
}

// CarDeleteVO 接口
export interface CarDeleteVO {
  carCodeList?: string[]; // 车辆编号数组
  carNumList?: string[]; // 车牌号数组
  service?: string; // 子系统服务名
}

// 删除车辆信息
export const deleteCarsByVO = async (id: string) => {
  return await request.delete({
    url: '/mws/car-info/delete',
    params: { id: id }
  });
}

// 管理后台 - 车辆信息新增/修改 Request VO
export interface CarInfoSaveReqVO {
  id?: string; // 车辆ID，编辑时必填
  plateNumber: string; // 车牌号
  vehicleType: string; // 车辆类型
  ownerId: number; // 车主ID
  ownerName: string; // 车主姓名
  plateColor: string; // 车牌颜色
  brand: string; // 品牌
  bodyColor: string; // 车身颜色
  remarks: string; // 备注
  isOperational: number; // 是否营运
  operationalLicenseNumber: string; // 营运证号
  vehicleDocumentUrls: string; // 车辆证件urls，多个以,进行分隔
  iccCarId: string; // icc平台的车辆映射ID
  iccOwnerId: string; // icc平台对应的人员映射ID
  iccDeptId: string; // icc平台部门
  deptId: number; // 部门Id
}

// 新增车辆信息
export const createCarInfo = async (data:any) => {
  return await request.post({ url: '/mws/car-info/create', data });
}


