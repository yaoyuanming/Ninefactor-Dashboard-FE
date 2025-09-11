import request from '@/config/axios';

// 获取公司信息
export const getCompanyInfo = async (): Promise<any> => {
  return await request.get({ url: '/mws/analysis/base-info/getCompanyInfo' });
};

// 管理后台 - 企业人员信息分页 Request VO
export interface CompanyPersonPageReqVO {
  pageNo: number; // 页码，从 1 开始
  pageSize: number; // 每页条数，最大值为 100
  companyCode?: string; // 企业code
  personname?: string; // 姓名
  idcard?: string; // 身份证号
  isCertified?: number; // 是否有证书：0-无，1-有
  personType?: number; // 人员类型
  mb?: string; // 联系方式
  systime?: string[]; // 数据同步时间
  shengCode?: string; // 省code
  createBy?: string; // 创建人
  updateBy?: string; // 修改人
  createDate?: string[]; // 创建时间
  updateDate?: string[]; // 修改时间
  deleteFlag?: number; // 删除标志
  iccSyncFlag?: number; // ICC平台同步标识
  iccSyncTime?: string[]; // ICC平台同步时间
  password?: string; // 登入密码
  phone?: string; // 手机号
  workNo?: string; // 工号
  deptId?: string; // 所属部门Id
  position?: string; // 岗位
}

// 工作人员信息 VO (推测)
export interface StaffVO {
  id: number; // 假设有 ID 字段
  personname: string; // 姓名
  idcard: string; // 证件号码
  phone: string; // 手机号
  workNo: string; // 工号
  deptId: string; // 所属部门Id (可能接口返回的是ID)
  departmentName?: string; // 部门名称 (推测可能有的字段)
  isCertified: number; // 是否有证书：0-无，1-有
  // 其他可能返回的字段...
  createTime: string; // 假设有创建时间字段，用于"时间"列
}

// 获取工作人员列表分页响应数据 VO (推测)
export interface GetStaffListRespVO {
  pageData: StaffVO[];
  currentPage: number; // 假设有当前页字段
  totalPage: number; // 假设有总页数字段
  pageSize: number; // 假设有每页大小字段
  totalRows: number; // 总条数
}

// 获取工作人员列表分页
export const getPersonList = async (data: CompanyPersonPageReqVO) => {
  return await request.post({ url: '/mws/analysis/base-info/getPersonList', data });
};

// 获取仓库列表分页 Request VO (用于分析模块)
export interface GetAnalysisWarehouseListReqVO {
  pageNo: number; // 页码，从 1 开始
  pageSize: number; // 每页条数，最大值为 100
  id?: string; // 仓库id
  companyCode?: string; // 企业code
  storeName?: string; // 仓库名称
  storeNum?: string; // 仓库编号
  storeKeyword?: string; // 仓库名称/编号
  acreage?: number; // 面积
  storeAddress?: string; // 仓库地址
  dangerLevel?: string; // 危险等级
}

// 获取仓库列表分页 (用于分析模块)
export const getAnalysisWarehouseList = async (data: GetAnalysisWarehouseListReqVO)=> {
  return await request.post({ url: '/mws/analysis/base-info/getWarehouseList', data });
};
