import axios from 'axios';

export interface CompanyInfoResponse {
  longitude: number;
  latitude: number;
  perspectiveHeight: number;
  orientationAngle: number;
  pitchAngle: number;
  threedTileUrl?: string;
  cesiumIonToken?: string;
}

export interface DeviceRecord {
  num: string;
  channelName: string;
  isOnline: 0 | 1;
  longitude?: number;
  latitude?: number;
  height?: number;
  icon?: string;
}

const MOCK_COMPANY_INFO: CompanyInfoResponse = {
  longitude: 119.314858, // 往右一点（经度增加）
  latitude: 25.956801, // 再往下调整一些（纬度增加）
  perspectiveHeight: 130,
  orientationAngle: 270,
  pitchAngle: -60,
  threedTileUrl:
    'https://zyrc-prod.oss-cn-hangzhou.aliyuncs.com/risk_monitor/3dtile/3dtile_yhbz/tileset.json',
};

const MOCK_DEVICE_LIST: DeviceRecord[] = [
  {
    num: 'DEV-001',
    channelName: '北区摄像头',
    isOnline: 1,
    longitude: 119.3145,
    latitude: 25.9568,
    height: 80,
  },
  {
    num: 'DEV-002',
    channelName: '南区摄像头',
    isOnline: 0,
    longitude: 119.3121,
    latitude: 25.9542,
    height: 60,
  },
  {
    num: 'DEV-003',
    channelName: '西区传感器',
    isOnline: 1,
    longitude: 119.3162,
    latitude: 25.9556,
    height: 70,
  },
];

const COMPANY_INFO_ENDPOINT =
  import.meta.env.VITE_CESIUM_COMPANY_INFO_API || '/api/company/info';
const DEVICE_LIST_ENDPOINT =
  import.meta.env.VITE_CESIUM_DEVICE_LIST_API || '/api/device/list';

export async function fetchCompanyInfo(): Promise<CompanyInfoResponse> {
  // 直接返回模拟数据，不调用真实接口
  console.log('[Cesium] 使用模拟企业配置数据');
  return MOCK_COMPANY_INFO;
}

export async function fetchDeviceList(): Promise<DeviceRecord[]> {
  // 直接返回模拟数据，不调用真实接口
  console.log('[Cesium] 使用模拟设备列表数据');
  return MOCK_DEVICE_LIST;
}
