<template>
  <div class="company-profile-module">
    <Title
      title="企业概况"
      :src="profileTitleIcon"
      :tabs="[]"
      @img-click="openProfileDrawer"
    />
    <!-- 核心信息区域 -->
    <div class="profile-info-container">
      <SecTitle title="企业" />
      <div class="enterprise-data-layout">
        <div class="data-container">
          <!-- 四角框背景图 -->
          <img
            src="@/assets/screen/left/corner-frame.png"
            class="corner-frame-image"
            alt="四角框"
          />

          <!-- 中心圆图片 -->
          <img
            src="@/assets/screen/left/center-circle-bg.png"
            class="center-circle-image"
            alt="中心圆"
          />

          <!-- 中心在线率 -->
          <div class="center-data">
            <div class="center-rate"
              >{{ (EnterpriseInformation?.accessRate || 0).toFixed(1) }}%</div
            >
            <div class="center-label">在线率</div>
          </div>

          <!-- 左上角：应接入数 -->
          <div class="corner-data top-left">
            <div class="data-number">{{
              EnterpriseInformation?.shouldAccessCount || 0
            }}</div>
            <div class="data-label">应接入数</div>
          </div>

          <!-- 左下角：接入率 -->
          <div class="corner-data bottom-left">
            <div class="data-number"
              >{{ (EnterpriseInformation?.accessRate || 0).toFixed(1) }}%</div
            >
            <div class="data-label">接入率</div>
          </div>

          <!-- 右上角：已接入数 -->
          <div class="corner-data top-right">
            <div class="data-number">{{
              EnterpriseInformation?.accessedCount || 0
            }}</div>
            <div class="data-label">已接入数</div>
          </div>

          <!-- 右下角：在线数 -->
          <div class="corner-data bottom-right">
            <div class="data-number">{{
              EnterpriseInformation?.onlineCount || 0
            }}</div>
            <div class="data-label">在线数</div>
          </div>
        </div>
      </div>

      <SecTitle title="视频设备" />

      <div class="equipment-container">
        <!-- 左侧：在线率 -->
        <div class="equipment-left">
          <img
            src="@/assets/screen/left/equipment-left-bg.png"
            class="equipment-left-bg"
            alt="设备背景"
          />
          <div class="equipment-rate">
            <div class="rate-value"
              >{{
                (
                  EnterpriseInformation?.videoDeviceStatus?.onlineRate || 0
                ).toFixed(1)
              }}%</div
            >
            <div class="rate-label">在线率</div>
          </div>
        </div>

        <!-- 右侧：数据区域 -->
        <div class="equipment-right">
          <img
            src="@/assets/screen/left/equipment-right-bg.png"
            class="equipment-right-bg"
            alt="数据背景"
          />
          <div class="data-content">
            <div class="data-item">
              <div class="data-label">已接入路数</div>
              <div class="data-value">{{
                EnterpriseInformation?.videoDeviceStatus?.totalAccessed || 0
              }}</div>
            </div>
            <div class="data-item">
              <div class="data-label">在线路数</div>
              <div class="data-value">{{
                EnterpriseInformation?.videoDeviceStatus?.onlineCount || 0
              }}</div>
            </div>
          </div>
        </div>
      </div>

      <SecTitle title="温湿度设备" />

      <div class="equipment-container">
        <!-- 左侧：在线率 -->
        <div class="equipment-left">
          <img
            src="@/assets/screen/left/equipment-left-bg.png"
            class="equipment-left-bg"
            alt="设备背景"
          />
          <div class="equipment-rate">
            <div class="rate-value"
              >{{
                (
                  EnterpriseInformation?.tempHumDeviceStatus?.onlineRate || 0
                ).toFixed(1)
              }}%</div
            >
            <div class="rate-label">在线率</div>
          </div>
        </div>

        <!-- 右侧：数据区域 -->
        <div class="equipment-right">
          <img
            src="@/assets/screen/left/equipment-right-bg.png"
            class="equipment-right-bg"
            alt="数据背景"
          />
          <div class="data-content">
            <div class="data-item">
              <div class="data-label">已接入路数</div>
              <div class="data-value">{{
                EnterpriseInformation?.tempHumDeviceStatus?.totalAccessed || 0
              }}</div>
            </div>
            <div class="data-item">
              <div class="data-label">在线路数</div>
              <div class="data-value">{{
                EnterpriseInformation?.tempHumDeviceStatus?.onlineCount || 0
              }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { inject, onMounted, ref } from 'vue';
  import profileTitleIcon from '@/assets/screen/lien.png';
  import { getEnterpriseInformation } from '@/api/compmonitoring';
  import Title from '../components/Title.vue';
  import SecTitle from '../components/SecTitle.vue';
  import { DrawerType } from '../DetailDrawer/types';

  // 注入抽屉组件
  const openDrawer = inject<any>('openDrawer');

  // 企业统计信息：定义接口对应的数据结构
  interface DeviceStatus {
    totalAccessed?: number; // 已接入总数
    onlineCount?: number; // 在线数
    onlineRate?: number; // 在线率
  }
  interface EnterpriseInfo {
    shouldAccessCount?: number; // 应接入数
    accessedCount?: number; // 已接入数
    accessRate?: number; // 接入率
    onlineCount?: number; // 在线数
    largeEnterpriseCount?: number; // 规上企业数量
    mediumEnterpriseCount?: number; // 中等企业数量
    smallEnterpriseCount?: number; // 小微企业数量
    notAccessedCount?: number; // 未接入企业数量
    videoDeviceStatus?: DeviceStatus; // 视频设备状态
    tempHumDeviceStatus?: DeviceStatus; // 温湿度设备状态
  }
  const EnterpriseInformation = ref<EnterpriseInfo>({});

  // 打开企业概况抽屉
  const openProfileDrawer = () => {
    openDrawer?.(DrawerType.COMPANY, '企业概况');
  };

  // 获取企业统计信息
  const getInfoExtp = async () => {
    try {
      const res = (await getEnterpriseInformation()) as any;
      // 按接口格式，success 为 true 时取 data 数据
      if (res.success) {
        EnterpriseInformation.value = res.data;
      } else {
        // console.error('获取企业信息失败：', res.message);
      }
    } catch (error) {
      // console.error('获取企业信息接口异常：', error);
    }
  };

  onMounted(() => {
    getInfoExtp();
  });
</script>

<style scoped lang="less">
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
          position: absolute;
          top: 40%;
          left: 50%;
          width: 30px;
          height: 25px;
          transform: translate(-50%, -50%);
        }
      }

      .content-text {
        box-sizing: border-box;
        width: 108px;
        padding: 8px 0;
        text-align: center;
        background: linear-gradient(
          270deg,
          rgb(99 140 212 / 0%) 10%,
          rgb(41 84 159 / 37%) 55%,
          rgb(99 140 212 / 0%) 94%
        );
        border: 0.84px solid;
        border-image: linear-gradient(
            270deg,
            rgb(41 84 159 / 0%) 0%,
            rgb(69 106 170 / 44%) 50%,
            rgb(42 79 143 / 0%) 100%
          )
          0.84;

        .title {
          color: #90aee5;
          font-weight: bold;
          font-size: 20px;
        }

        .content {
          margin-top: 2px;
          color: #fff;
        }
      }

      .ment-content {
        display: flex;
        flex: 1;
        gap: 20px;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        height: 64px;
        margin-left: 20px;
        background: linear-gradient(
          180deg,
          rgb(24 56 115 / 0%) 0%,
          rgb(27 56 111 / 48%) 100%
        );
        border: 2px solid;
        border-radius: 56px;
        border-image: conic-gradient(
          from 180deg at 50% 50%,
          rgb(22 51 103 / 91.3%) -55deg,
          #2e497b 10deg,
          rgb(24 52 103 / 78.1%) 98deg,
          rgb(164 179 206 / 65%) 105deg,
          rgb(25 48 90 / 67.6%) 125deg,
          rgb(22 51 103 / 91.3%) 305deg,
          #2e497b 370deg
        );
        opacity: 1;

        .font-content {
          text-align: center;

          .title {
            color: #b0cdff;
            font-size: 14px;
          }

          .content {
            margin-top: 5px;
            color: transparent;
            font-weight: bold;
            font-size: 18px;
            background: linear-gradient(180deg, #fff 36%, #90aee5 76%);
            background-clip: text;
          }
        }
      }
    }
  }

  .ment-bottom {
    margin-top: 14px;
  }

  .company-profile-module {
    background: linear-gradient(90deg, #0c2249 0%, rgb(65 106 146 / 69%) 97%);
    border-radius: 4px;
    pointer-events: all;

    .profile-info-container {
      padding: 8px 16px 5px 13px;

      .enterprise-data-layout {
        margin-top: 10px;

        .data-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 169px;
          padding-top: 20px;
          background: linear-gradient(
            180deg,
            rgb(8 32 64 / 21%) 0%,
            rgb(8 32 64 / 0%) 100%
          );

          // 四角框图片 - 响应式宽度，占据容器大部分空间
          .corner-frame-image {
            position: absolute;
            z-index: 1;
            width: 95%;
            height: auto;
            object-fit: contain;
          }

          // 中心圆图片 - 根据容器调整大小，契合外边框四角
          .center-circle-image {
            position: absolute;
            z-index: 2;
            width: 50%;
            max-width: 200px;
            height: auto;
            object-fit: contain;
            aspect-ratio: 1;
          }

          // 中心数据
          .center-data {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 3;
            text-align: center;
            transform: translate(-50%, -50%);

            .center-rate {
              margin-top: 25px;
              color: #90aee5;
              font-weight: bold;
              font-size: 26px;
              line-height: 1.2;
            }

            .center-label {
              margin-top: 18px;
              color: #fff;
              font-size: 14px;
            }
          }

          // 四角数据
          .corner-data {
            position: absolute;
            z-index: 4;
            text-align: center;

            .data-number {
              color: #fff;
              font-weight: 600;
              font-size: 20px;
              line-height: 1.2;
            }

            .data-label {
              margin-top: 4px;
              color: #b0cdff;
              font-size: 14px;
              white-space: nowrap;
            }

            // 左上角
            &.top-left {
              top: 15px;
              left: 40px;

              .data-number {
                color: #fff;
              }
            }

            // 左下角
            &.bottom-left {
              bottom: 15px;
              left: 40px;

              .data-number {
                color: #abea75;
              }
            }

            // 右上角
            &.top-right {
              top: 15px;
              right: 40px;

              .data-number {
                color: #3ebaff;
              }
            }

            // 右下角
            &.bottom-right {
              right: 40px;
              bottom: 15px;

              .data-number {
                color: #ccddf3;
              }
            }
          }
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

    // 设备容器
    .equipment-container {
      display: flex;
      align-items: center;
      padding: 10px 16px 0;

      // 左侧：在线率
      .equipment-left {
        position: relative;
        flex-shrink: 0;
        width: 203px;
        height: 77px;

        .equipment-left-bg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .equipment-rate {
          position: absolute;
          top: 50%;
          right: 40px;
          text-align: center;
          transform: translateY(-50%);

          .rate-value {
            color: #90aee5;
            font-weight: bold;
            font-size: 18px;
            line-height: 1.2;
          }

          .rate-label {
            margin-top: 2px;
            color: #fff;
            font-size: 12px;
          }
        }
      }

      // 右侧：数据区域
      .equipment-right {
        position: relative;
        flex-shrink: 0;
        width: 216px;
        height: 64px;

        .equipment-right-bg {
          display: block;
          width: 100%;
          height: 100%;
        }

        .data-content {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          gap: 60px;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;

          .data-item {
            text-align: center;

            .data-label {
              margin-bottom: 4px;
              color: #b0cdff;
              font-size: 12px;
              line-height: 1.2;
            }

            .data-value {
              color: #fff;
              font-weight: 600;
              font-size: 18px;
              line-height: 1.2;
            }
          }
        }
      }
    }
  }
</style>
