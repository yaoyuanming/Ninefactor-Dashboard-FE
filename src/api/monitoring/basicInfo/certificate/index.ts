import request from '@/config/axios'
// 证书数据类型（根据实际接口返回字段补充）
export interface CertificateItem {
  id: number;
  name: string;
  issuer?: string; // 签发机关
  type?: string; // 证书类型
  holderId: string; // 证书持有人ID
  holderName: string; // 证书持有人名称
  number: string; // 证书编号
  issueDate: string; // 初领时间，格式：yyyy-MM-dd
  validStartDate: string; // 有效期开始时间，格式：yyyy-MM-dd
  validEndDate: string; // 有效期结束时间，格式：yyyy-MM-dd
  reviewDate?: string; // 证书复审日期，格式：yyyy-MM-dd (可能非必填)
  enableReminder?: number; // 是否开启到期提醒 (0: 否, 1: 是)
  photoList: string; // 证书图片地址列表，逗号分割字符串，如 "url1,url2"
}

// 证书分页查询参数类型
export interface CertCertificateQueryPageReqVO {
  name?: string // 证书名称
  issuer?: string // 签发机关
  type?: string // 证书类型
  holderName?: string // 证书持有人名称
  beginTime?: string // 证书到期开始时间区间
  endTime?: string // 证书到期结束时间区间
  pageNo: number // 页码，必填
  pageSize: number // 每页数量，必填
}

// 证书分页查询API
export function getCertificatePage(data: CertCertificateQueryPageReqVO) {
  return request.post({ url: '/mws/cert-manager/page',data,})}

// 获取证书详细信息接口
export function getCertCertificateInfo(id: string) {
  return request.get({
    url: '/mws/cert-manager/getCertCertificateInfo',
    params: { id },
  });
}

/**
 * 证书管理 - 创建请求 VO
 */
export interface CertCertificateCreateReqVO {
  name: string; // 证书名称，必填
  issuer?: string; // 签发机关，非必填
  type: string; // 证书类型，必填
  holderId: string; // 证书持有人ID，必填
  holderName: string; // 证书持有人名称，必填
  number: string; // 证书编号，必填
  issueDate: string; // 初领时间，必填，格式：yyyy-MM-dd
  validStartDate: string; // 有效期开始时间，必填，格式：yyyy-MM-dd
  validEndDate: string; // 有效期结束时间，必填，格式：yyyy-MM-dd
  reviewDate: string; // 证书复审日期，必填，格式：yyyy-MM-dd
  enableReminder?: string; // 是否开启到期提醒 (0: 否, 1: 是)，非必填
  photoList: string; // 证书图片地址列表，逗号分割字符串，如 "url1,url2"
}

// 添加证书接口
export function createCertificate(data: CertCertificateCreateReqVO) {
  return request.post({
    url: '/mws/cert-manager/create',data,
  });
}

// 删除证书接口
export function deleteCertificate(id: string) {
  return request.delete({
    url: '/mws/cert-manager/deleteCert',
    params: { id },
  });
}

// 获取证书提醒配置信息接口
/**
 * 获取证书提醒配置信息
 * @param id 证书ID
 * @returns 证书提醒配置信息
 */
export function getCertReminderConfigInfo(id: string) {
  return request.get({
    url: '/mws/cert-manager/getCertReminderConfigInfo',
    params: { id },
  });
}

/**
 * 证书提醒配置启用请求 VO
 */
export interface CertReminderConfigEnableReqVO {
  id: number; // 证书配置ID，必填
  enable: number; // 是否开启证书提醒，1-开启，0-关闭，必填
}

/**
 * 启用/关闭证书到期提醒接口
 * @param data CertReminderConfigEnableReqVO
 * @returns 通用响应
 */
export function enableCertReminder(data: CertReminderConfigEnableReqVO) {
  return request.put({
    url: '/mws/cert-manager/enableCertReminder',
    data,
  });
}

/**
 * 证书提醒配置保存请求 VO
 */
export interface CertReminderConfigSaveReqVO {
  id?: string; // 主键，修改时可用，非必填
  advanceDays: number; // 证书复审到期前提醒天数，必填
  advanceFrequency: string; // 到期前提醒频率（如：WEEKLY），必填
  advanceWeekDay: string; // 到期前提醒的星期几（如：MON），必填
  advanceTime: string; // 到期前提醒时间（24小时制），必填
  expiredFrequency: string; // 证书复审过期后的提醒频率（如：WEEKLY、DAILY），必填
  expiredWeekDay?: string; // 复审过期后提醒的星期几，仅在 WEEKLY 模式下有效，非必填
  expiredTime: string; // 复审过期后提醒时间（24小时制），必填
  remindTargets?: string; // 提醒接收人范围，多个用逗号分隔，非必填
  remindChannels: string; // 提醒发送渠道，多个用逗号分隔，必填
}

/**
 * 更新证书提醒配置信息接口
 * @param data CertReminderConfigSaveReqVO
 * @returns 通用响应
 */
export function updateCertReminderConfig(data: CertReminderConfigSaveReqVO) {
  return request.post({
    url: '/mws/cert-manager/updateCertReminderConfig',
    data,
  });
}

/**
 * 证书管理 - 更新请求 VO
 */
export interface CertCertificateUpdateReqVO {
  id: number; // 证书ID，必填
  name: string; // 证书名称，必填
  issuer?: string; // 签发机关，非必填
  type: string; // 证书类型，必填
  holderId: string; // 证书持有人ID，必填
  holderName: string; // 证书持有人名称，必填
  number: string; // 证书编号，必填
  issueDate: string; // 初领时间，必填，格式：yyyy-MM-dd
  validStartDate: string; // 有效期开始时间，必填，格式：yyyy-MM-dd
  validEndDate: string; // 有效期结束时间，必填，格式：yyyy-MM-dd
  reviewDate: string; // 证书复审日期，必填，格式：yyyy-MM-dd
  enableReminder?: string; // 是否开启到期提醒 (0: 否, 1: 是)，非必填
  photoList: string; // 证书图片地址列表，逗号分割字符串，如 "url1,url2"
}

/**
 * 更新证书接口
 * @param data CertCertificateUpdateReqVO
 * @returns 通用响应
 */
export function updateCertCertificate(data: CertCertificateUpdateReqVO) {
  return request.post({
    url: '/mws/cert-manager/updateCert',
    data,
  });
}

  
