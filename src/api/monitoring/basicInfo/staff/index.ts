import request from '@/config/axios'

/**
 * 获取企业人员分页列表
 * @param data 分页及查询参数
 * @returns 企业人员分页列表数据
 */
export const getCompanyPersonPage = (data) => {
  return request.post({
    url: '/mws/company-person/page',
    data
  })
}

/**
 * 创建企业人员信息请求参数
 */
interface CreateCompanyPersonReq {
  companyCode: string;
  personname: string;
  account: string;
  password: string; 
  workNo: string;
  iccDeptId: string;
  position: string;
  isCertified: number; // 0-无，1-有
  personType: string; // 逗号分隔的字符串
  mb: string;
  systime: string; // 数据同步时间，根据示例是字符串格式
  shengCode: string; // 省code
  documentType: string;
  documentNumber: string;
  iccPersonnelStatus: string; // '0' 表示正常，'1' 表示冻结
  avatarPath: string;
  biosignatures: Array<{ // 根据示例调整
    type?: number; // 可选
    index?: number; // 可选
    path?: string; // 可选
    data?: string; // 可选
  }>;
  validityPeriodStart: string; // 根据示例是字符串格式
  validityPeriodEnd: string; // 根据示例是字符串格式
  // 其他文档中提到的可选字段，根据需要添加
  idcard?: string | null; // 身份证号，文档未标必需，示例为 null
  iccOrgId?: string | null; // 文档未标必需，示例为 null
  iccUserId?: number; // 文档未标必需，示例有值
  iccCardId?: string | null; // 文档未标必需，示例为 null
}

/**
 * 创建企业人员信息
 * @param data 创建人员的详细信息
 * @returns 创建结果
 */
export const createCompanyPerson = (data: CreateCompanyPersonReq) => {
  return request.post({
    url: '/mws/company-person/create',
    data
  })
}

// 获取人员详情
export const getStaffDetail = (id: string) => {
  return request.get({
    url: `/mws/company-person/get?id=${id}`});
};


// 更新企业人员信息
export const updateCompanyPerson = (data: any) => {
  return request.put({url:'/mws/company-person/update', data});
};

// 删除企业人员信息
export const deleteCompanyPerson = (id: string) => {
  return request.delete({url:`/mws/company-person/delete?id=${id}`});
};
