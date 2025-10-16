<template>
  <div class="company-profile-module">
    <Title title="企业概况" :src="profileTitleIcon" :tabs="[]" @imgClick="openProfileDrawer" />
    <!-- 核心信息区域 -->
    <div class="profile-info-container">
      <div class="profile-header-bar">
        <img src="@/assets/screen/imgs/Company-Profile.png" alt="企业标识" />
        <div class="header-bar-text">企业</div>
      </div>
      <div class="info-layout-row">
        <!-- 左侧数据区：应接入数、接入率 -->
        <div class="left-data-block">
          <div class="data-item-top">
            <div class="data-value-row">
              <div class="data-number">{{ EnterpriseInformation?.shouldAccessCount || 0 }}</div>
              <div class="arrow-indicator"></div>
            </div>
            <div class="data-label">应接入数</div>
          </div>
          <div class="data-item-bottom">
            <div class="data-value-row">
              <div class="data-number">{{ (EnterpriseInformation?.accessRate || 0).toFixed(1) }}%</div>
              <div class="arrow-indicator"></div>
            </div>
            <div class="data-label">接入率</div>
          </div>
        </div>
        <!-- 中间背景区 -->
        <div class="center-bg-block">
          <img src="@/assets/screen/imgs/clre-bg.png" class="center-bg-image" alt="中间装饰背景" />
        </div>
        <div class="right-reserve-block">
          <div class="data-item-top">
            <div class="data-value-row">
              <div class="arrow-indicator"></div>
              <div class="data-number">{{ EnterpriseInformation?.accessedCount || 0 }}</div>
            </div>
            <div class="data-label">已接入数</div>
          </div>
          <div class="data-item-bottom right">
            <div class="data-value-row">
              <div class="arrow-indicator"></div>
              <div class="data-number">{{ EnterpriseInformation?.onlineCount || 0 }}</div>
            </div>
            <div class="data-label">在线数</div>
          </div>
        </div>
      </div>

      <div class="profile-header-bar ment">
        <img src="@/assets/screen/imgs/Company-Profile.png" alt="企业标识" />
        <div class="header-bar-text">视频设备</div>
      </div>

      <div class="ment-container ment-top">
        <div class="ment-left">
          <div class="ment-image">
            <img src="@/assets/screen/imgs/ment-cg.png" class="ment-top-image" alt="">
            <img src="@/assets/screen/imgs/ment-top.png" class="ment-bottom-image" alt="">
          </div>
          <!-- 右边文字：视频设备在线率 -->
          <div class="content-text">
            <div class="title">{{ (EnterpriseInformation?.videoDeviceStatus?.onlineRate || 0).toFixed(1) }}%</div>
            <div class="content">在线率</div>
          </div>

          <div class="ment-content">
            <div class="font-content">
              <div class="title">已接入路数</div>
              <div class="content">{{ EnterpriseInformation?.videoDeviceStatus?.totalAccessed || 0 }}</div>
            </div>
            <div class="font-content">
              <div class="title">在线路数</div>
              <div class="content">{{ EnterpriseInformation?.videoDeviceStatus?.onlineCount || 0 }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-header-bar compment">
        <img src="@/assets/screen/imgs/Company-Profile.png" alt="企业标识" />
        <div class="header-bar-text">温湿度设备</div>
      </div>

      <div class="ment-container ment-bottom">
        <div class="ment-left">
          <div class="ment-image">
            <img src="@/assets/screen/imgs/ment-cg.png" class="ment-top-image" alt="">
            <img src="@/assets/screen/imgs/ment-top.png" class="ment-bottom-image" alt="">
          </div>
          <!-- 右边文字：温湿度设备在线率 -->
          <div class="content-text">
            <div class="title">{{ (EnterpriseInformation?.tempHumDeviceStatus?.onlineRate || 0).toFixed(1) }}%</div>
            <div class="content">在线率</div>
          </div>

          <!-- 右侧显示：温湿度设备已接入/在线数 -->
          <div class="ment-content">
            <div class="font-content">
              <div class="title">已接入路数</div>
              <div class="content">{{ EnterpriseInformation?.tempHumDeviceStatus?.totalAccessed || 0 }}</div>
            </div>
            <div class="font-content">
              <div class="title">在线路数</div>
              <div class="content">{{ EnterpriseInformation?.tempHumDeviceStatus?.onlineCount || 0 }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts' setup>
import Title from '../components/Title.vue';
import { DrawerType } from '../DetailDrawer/types';
import { inject, onMounted, ref } from 'vue';
import profileTitleIcon from '@/assets/screen/lien.png';
import { getEnterpriseInformation } from '@/api/compmonitoring';

// 注入抽屉组件
const openDrawer = inject<any>('openDrawer');

// 企业统计信息：定义接口对应的数据结构
interface DeviceStatus {
  totalAccessed?: number; // 已接入总数
  onlineCount?: number;   // 在线数
  onlineRate?: number;    // 在线率
}
interface EnterpriseInfo {
  shouldAccessCount?: number;    // 应接入数
  accessedCount?: number;        // 已接入数
  accessRate?: number;           // 接入率
  onlineCount?: number;          // 在线数
  largeEnterpriseCount?: number; // 规上企业数量
  mediumEnterpriseCount?: number;// 中等企业数量
  smallEnterpriseCount?: number; // 小微企业数量
  notAccessedCount?: number;     // 未接入企业数量
  videoDeviceStatus?: DeviceStatus; // 视频设备状态
  tempHumDeviceStatus?: DeviceStatus; // 温湿度设备状态
}
const EnterpriseInformation = ref<EnterpriseInfo>({});

// 打开企业概况抽屉
const openProfileDrawer = () => {
  openDrawer?.(DrawerType.COMPANY, '企业概况', {
    shouldAccessCount: EnterpriseInformation.value.shouldAccessCount,
    accessedCount: EnterpriseInformation.value.accessedCount,
    notAccessedCount: EnterpriseInformation.value.notAccessedCount,
    largeEnterpriseCount: EnterpriseInformation.value.largeEnterpriseCount,
    mediumEnterpriseCount: EnterpriseInformation.value.mediumEnterpriseCount,
    smallEnterpriseCount: EnterpriseInformation.value.smallEnterpriseCount
  });
};

// 获取企业统计信息
const getInfoExtp = async () => {
  try {
    const res = await getEnterpriseInformation() as any
    // 按接口格式，success 为 true 时取 data 数据
    if (res.success) {
      EnterpriseInformation.value = res.data;
    } else {
      console.error('获取企业信息失败：', res.message);
    }
  } catch (error) {
    console.error('获取企业信息接口异常：', error);
  }
};


onMounted(() => {
  getInfoExtp();
});
</script>
<style scoped lang='less'>
.ment-container {
  display: flex;
  align-items: center;
  padding-left: 8px;

  .ment-left {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .ment-image {
      position: relative;
      width: 105px;
      height: 77px;

      .ment-top-image,
      .ment-bottom-image {
        width: 100%;
        height: 100%;
      }

      .ment-bottom-image {
        width: 30px;
        height: 25px;
        position: absolute;
        top: 40%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }

    .content-text {
      background: linear-gradient(270deg, rgba(99, 140, 212, 0) 10%, rgba(41, 84, 159, 0.37) 55%, rgba(99, 140, 212, 0) 94%);
      box-sizing: border-box;
      border: 0.84px solid;
      border-image: linear-gradient(270deg, rgba(41, 84, 159, 0) 0%, rgba(69, 106, 170, 0.44) 50%, rgba(42, 79, 143, 0) 100%) 0.84;
      width: 108px;
      text-align: center;
      padding: 8px 0;

      .title {
        color: #90AEE5;
        font-size: 20px;
        font-weight: bold;
      }

      .content {
        color: #fff;
        margin-top: 2px;
      }
    }

    .ment-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-left: 20px;
      flex: 1;
      height: 64px;
      border-radius: 56px;
      opacity: 1;

      background: linear-gradient(180deg, rgba(24, 56, 115, 0) 0%, rgba(27, 56, 111, 0.48) 100%);

      box-sizing: border-box;
      border: 2px solid;
      border-image: conic-gradient(from 180deg at 50% 50%, rgba(22, 51, 103, 0.913) -55deg, #2E497B 10deg, rgba(24, 52, 103, 0.7813) 98deg, rgba(164, 179, 206, 0.65) 105deg, rgba(25, 48, 90, 0.6762) 125deg, rgba(22, 51, 103, 0.913) 305deg, #2E497B 370deg);

      .font-content {
        text-align: center;

        .title {
          font-size: 14px;
          color: #B0CDFF;
        }

        .content {
          font-size: 18px;
          background: linear-gradient(180deg, #FFFFFF 36%, #90AEE5 76%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: bold;
          margin-top: 5px;
        }
      }
    }
  }
}

.ment-bottom {
  margin-top: 14px;
}

// 标题栏公共样式
.profile-header-bar {
  display: flex;
  align-items: center;

  img {
    width: 29px;
    height: 27px;
  }

  .header-bar-text {
    margin-left: 8px;
    color: #fff;
  }
}

// 标题栏特有样式
.ment {
  margin-top: 7px;
}

.compment {
  margin-top: 8px;
}

.company-profile-module {
  background: linear-gradient(90deg,
      #0c2249 0%,
      rgb(65 106 146 / 69%) 97%);
  border-radius: 4px;
  pointer-events: all;

  .profile-info-container {
    padding: 8px 16px 18px 13px;

    .info-layout-row {
      display: flex;
      align-items: center;
    }

    .left-data-block {
      margin-top: 10px;
      padding-left: 8px;

      .data-value-row {
        display: flex;
        align-items: center;
        padding-left: 17px;

        .data-number {
          color: #ffffff;
          font-size: 18px;
        }

        .arrow-indicator {
          width: 0;
          height: 0;
          border-top: 6.5px solid transparent;
          border-right: 5px solid #fff;
          border-bottom: 5px solid transparent;
          margin-left: 21px;
        }
      }

      .data-label {
        background: url('@/assets/screen/imgs/Rectangle-bg.png');
        width: 110px;
        height: 36px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        padding-left: 13px;
        text-align: center;
        color: #ffffff;
        font-size: 14px;
        line-height: 36px;
      }

      .data-item-bottom {
        margin-top: 14px;

        .data-number {
          color: #abea75;
        }

        .arrow-indicator {
          border-right-color: #abea75;
        }
      }
    }

    .right-reserve-block {
      margin-top: 4px;
      padding-right: 8px;

      .data-item-top .arrow-indicator {
        width: 0;
        height: 0;
        border-top: 6.5px solid transparent;
        border-left: 5px solid #3EBAFF;
        border-bottom: 5px solid transparent;
      }

      .data-value-row {
        display: flex;
        align-items: center;
        padding-left: 37px;

        .data-number {
          color: #3EBAFF;
          font-size: 18px;
          margin-left: 21px;
        }
      }

      .data-label {
        background: url('@/assets/screen/imgs/Rectangle-bg.png');
        width: 100px;
        height: 36px;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        padding-left: 13px;
        text-align: center;
        color: #ffffff;
        font-size: 14px;
        line-height: 36px;
      }

      .right {
        margin-top: 14px;

        .data-number {
          color: #CCDDF3;
        }

        .arrow-indicator {
          border-left-color: #CCDDF3;
        }
      }
    }

    .center-bg-block {
      position: relative;
      width: 107px;
      flex: 1;
      height: 147px;

      .center-bg-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 147px;
        z-index: 1;
        /* 背景图层级低于粒子 */
      }
    }
  }

  .company-overview-wrapper {
    padding: 20px 24px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.02);
      filter: brightness(1.1);
    }
  }
}
</style>
