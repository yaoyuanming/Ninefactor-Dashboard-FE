<template>
  <div id="cesiumContainer" ref="viewerContainer" class="cesium-viewer" />
</template>

<script setup lang="ts">
  import { defineEmits, onBeforeUnmount, onMounted, ref } from 'vue';
  import {
    fetchCompanyInfo,
    fetchDeviceList,
    type CompanyInfoResponse as CompanyConfig,
    type DeviceRecord,
  } from '@/api/cesium';

  type TooltipMeta = {
    name: string;
    status: '在线' | '离线';
    color: string;
  };

  type CesiumEntityWithMeta = {
    deviceMeta?: DeviceRecord;
  } & Record<string, any>;

  declare global {
    interface Window {
      Cesium?: any;
    }
  }

  const emit = defineEmits<{
    (event: 'clickJianKong', payload: DeviceRecord): void;
  }>();

  const viewerContainer = ref<HTMLDivElement | null>(null);
  const viewer = ref<any>(null);
  const cesiumRef = ref<any>(null);
  const tooltipElement = ref<HTMLDivElement | null>(null);
  const canvasHandlers = {
    click: null as ((event: MouseEvent) => void) | null,
    mousemove: null as ((event: MouseEvent) => void) | null,
  };
  const activeEntities: CesiumEntityWithMeta[] = [];

  const DEVICE_ICON = `data:image/svg+xml;base64,${btoa(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#62b4ff" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="#2452ff" stop-opacity="0.05"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="55" fill="rgba(16,28,62,0.95)" stroke="#5cc3ff" stroke-width="3"/>
      <circle cx="60" cy="60" r="45" fill="url(#g)"/>
      <rect x="42" y="30" width="36" height="22" rx="6" fill="#101b3c" stroke="#74cfff" stroke-width="3"/>
      <circle cx="60" cy="41" r="6" fill="#75ebff"/>
      <rect x="52" y="60" width="16" height="30" rx="4" fill="#75a7ff"/>
      <rect x="44" y="90" width="32" height="12" rx="6" fill="#0f1d3b"/>
    </svg>`
  )}`;

  const fallbackDeviceRecords: DeviceRecord[] = [
    {
      num: '1',
      channelName: '设备1',
      isOnline: 1,
      longitude: 119.3143313573,
      latitude: 25.9567318007,
      height: 65,
    },
    {
      num: '2',
      channelName: '设备2',
      isOnline: 1,
      longitude: 119.3142613573,
      latitude: 25.9567318007,
      height: 65,
    },
    {
      num: '3',
      channelName: '设备3',
      isOnline: 1,
      longitude: 119.3140713573,
      latitude: 25.9568118007,
      height: 65,
    },
    {
      num: '4',
      channelName: '设备4',
      isOnline: 1,
      longitude: 119.3141513573,
      latitude: 25.9568118007,
      height: 65,
    },
    {
      num: '5',
      channelName: '设备5',
      isOnline: 1,
      longitude: 119.3140713573,
      latitude: 25.9568818007,
      height: 65,
    },
    {
      num: '6',
      channelName: '设备6',
      isOnline: 1,
      longitude: 119.3141513573,
      latitude: 25.9568818007,
      height: 65,
    },
    {
      num: '7',
      channelName: '设备7',
      isOnline: 1,
      longitude: 119.3138713573,
      latitude: 25.9567418007,
      height: 65,
    },
    {
      num: '8',
      channelName: '设备8',
      isOnline: 1,
      longitude: 119.3139513573,
      latitude: 25.9567418007,
      height: 65,
    },
    {
      num: '9',
      channelName: '设备9',
      isOnline: 1,
      longitude: 119.3136813573,
      latitude: 25.9568800684,
      height: 58,
    },
    {
      num: '10',
      channelName: '设备10',
      isOnline: 1,
      longitude: 119.3137513573,
      latitude: 25.9566318007,
      height: 58,
    },
    {
      num: '11',
      channelName: '设备11',
      isOnline: 1,
      longitude: 119.3141013573,
      latitude: 25.9570218007,
      height: 60,
    },
    {
      num: '12',
      channelName: '设备12',
      isOnline: 1,
      longitude: 119.3145013573,
      latitude: 25.9570218007,
      height: 58,
    },
    {
      num: '13',
      channelName: '设备13',
      isOnline: 1,
      longitude: 119.3145613573,
      latitude: 25.9569608007,
      height: 58,
    },
    {
      num: '14',
      channelName: '设备14',
      isOnline: 1,
      longitude: 119.3144513573,
      latitude: 25.9570518007,
      height: 58,
    },
    {
      num: '15',
      channelName: '设备15',
      isOnline: 1,
      longitude: 119.3143103573,
      latitude: 25.9566468007,
      height: 58,
    },
    {
      num: '16',
      channelName: '设备16',
      isOnline: 1,
      longitude: 119.3154984943,
      latitude: 25.9564613322,
      height: 48,
    },
  ];

  const formatTilesetUrl = (url?: string) => {
    if (!url) return '';
    // 直接返回原始 URL，不进行代理转换
    return url.trim();
  };

  const DEFAULT_TILESET_URL = formatTilesetUrl(
    'https://zyrc-prod.oss-cn-hangzhou.aliyuncs.com/risk_monitor/3dtile/3dtile_yhbz/tileset.json'
  );

  const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
    longitude: 140.3165, // 继续往右调整
    latitude: 58.958, // 继续往下调整
    perspectiveHeight: 580, // 提高高度，扩大视野范围
    orientationAngle: 270, // 朝向正西（可根据实际场景调整）
    pitchAngle: -50, // 稍微调整俯仰角，更向下看
    threedTileUrl: DEFAULT_TILESET_URL,
  };

  const normalizeCompanyConfig = (config?: CompanyConfig): CompanyConfig => ({
    longitude: config?.longitude ?? DEFAULT_COMPANY_CONFIG.longitude,
    latitude: config?.latitude ?? DEFAULT_COMPANY_CONFIG.latitude,
    perspectiveHeight:
      config?.perspectiveHeight ?? DEFAULT_COMPANY_CONFIG.perspectiveHeight,
    orientationAngle:
      config?.orientationAngle ?? DEFAULT_COMPANY_CONFIG.orientationAngle,
    pitchAngle: config?.pitchAngle ?? DEFAULT_COMPANY_CONFIG.pitchAngle,
    threedTileUrl:
      formatTilesetUrl(config?.threedTileUrl) || DEFAULT_TILESET_URL,
    cesiumIonToken: config?.cesiumIonToken,
  });

  const normalizeDeviceList = (devices?: DeviceRecord[]): DeviceRecord[] => {
    if (!devices || !devices.length) {
      return fallbackDeviceRecords;
    }
    const normalized: DeviceRecord[] = [];
    devices.forEach((device, index) => {
      const fallback = fallbackDeviceRecords[index] || fallbackDeviceRecords[0];
      const longitude = device.longitude ?? fallback.longitude;
      const latitude = device.latitude ?? fallback.latitude;
      if (longitude == null || latitude == null) {
        return;
      }
      normalized.push({
        num: String(device.num ?? fallback.num ?? index + 1),
        channelName:
          device.channelName || fallback.channelName || `摄像头${index + 1}`,
        isOnline: device.isOnline ?? fallback.isOnline ?? 1,
        longitude,
        latitude,
        height: device.height ?? fallback.height ?? 40,
        icon: device.icon ?? fallback.icon,
      });
    });
    return normalized.length ? normalized : fallbackDeviceRecords;
  };

  const createTooltipElement = () => {
    if (tooltipElement.value) return tooltipElement.value;
    const el = document.createElement('div');
    el.className = 'cesium-tooltip';
    document.body.appendChild(el);
    tooltipElement.value = el;
    return el;
  };

  const updateTooltip = (event: MouseEvent, meta?: TooltipMeta) => {
    if (!meta) {
      if (tooltipElement.value) {
        tooltipElement.value.style.display = 'none';
      }
      return;
    }
    const el = createTooltipElement();
    el.innerHTML = `
    <div class="tooltip-title">${meta.name}</div>
    <div class="tooltip-line">
      状态：<span style="color: ${meta.color}">${meta.status}</span>
    </div>
    <div class="tooltip-line">类型：摄像头</div>
  `;
    el.style.display = 'block';
    el.style.left = `${event.clientX + 12}px`;
    el.style.top = `${event.clientY + 12}px`;
  };

  const removeTooltip = () => {
    if (tooltipElement.value?.parentNode) {
      tooltipElement.value.parentNode.removeChild(tooltipElement.value);
    }
    tooltipElement.value = null;
  };

  const convertToCanvasPosition = (
    event: MouseEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const registerCanvasInteractions = () => {
    if (!viewer.value || !cesiumRef.value) return;
    const canvas: HTMLCanvasElement | undefined = viewer.value?.scene?.canvas;
    if (!canvas) return;

    const pickEntity = (event: MouseEvent): CesiumEntityWithMeta | null => {
      const pos = convertToCanvasPosition(event, canvas);
      const cartesian = new cesiumRef.value.Cartesian2(pos.x, pos.y);
      const picked = viewer.value?.scene.pick(cartesian);
      if (picked && cesiumRef.value.defined(picked.id)) {
        return picked.id as CesiumEntityWithMeta;
      }
      return null;
    };

    canvasHandlers.click = (event: MouseEvent) => {
      const entity = pickEntity(event);
      if (entity?.deviceMeta) {
        emit('clickJianKong', entity.deviceMeta);
      }
    };

    canvasHandlers.mousemove = (event: MouseEvent) => {
      const entity = pickEntity(event);
      if (entity?.deviceMeta) {
        updateTooltip(event, {
          name: entity.deviceMeta.channelName,
          status: entity.deviceMeta.isOnline === 1 ? '在线' : '离线',
          color: entity.deviceMeta.isOnline === 1 ? '#00ff84' : '#ff5a5a',
        });
      } else {
        updateTooltip(event);
      }
    };

    canvas.addEventListener('click', canvasHandlers.click);
    canvas.addEventListener('mousemove', canvasHandlers.mousemove);
  };

  const cleanupCanvasInteractions = () => {
    if (!viewer.value) return;
    const canvas: HTMLCanvasElement | undefined = viewer.value?.scene?.canvas;
    if (!canvas) return;
    if (canvasHandlers.click) {
      canvas.removeEventListener('click', canvasHandlers.click);
      canvasHandlers.click = null;
    }
    if (canvasHandlers.mousemove) {
      canvas.removeEventListener('mousemove', canvasHandlers.mousemove);
      canvasHandlers.mousemove = null;
    }
  };

  const drawDeviceBillboards = (deviceList: DeviceRecord[]) => {
    if (!viewer.value || !cesiumRef.value) return;
    activeEntities.forEach((entity) => viewer.value.entities.remove(entity));
    activeEntities.length = 0;

    deviceList.forEach((device, index) => {
      if (device.longitude == null || device.latitude == null) return;
      const entity = viewer.value.entities.add({
        name: device.channelName || `摄像头 ${device.num || index + 1}`,
        position: cesiumRef.value.Cartesian3.fromDegrees(
          device.longitude,
          device.latitude,
          device.height ?? 40
        ),
        billboard: {
          image: device.icon || DEVICE_ICON,
          horizontalOrigin: cesiumRef.value.HorizontalOrigin.CENTER,
          verticalOrigin: cesiumRef.value.VerticalOrigin.BOTTOM,
          scale: 0.2,
          color:
            device.isOnline === 1
              ? cesiumRef.value.Color.WHITE
              : cesiumRef.value.Color.fromAlpha(
                  cesiumRef.value.Color.GRAY,
                  0.65
                ),
        },
      }) as CesiumEntityWithMeta;

      entity.deviceMeta = { ...device };
      activeEntities.push(entity);
    });

    registerCanvasInteractions();
  };

  const configureSceneEffects = () => {
    if (!viewer.value) return;
    const { scene } = viewer.value;
    const { globe, postProcessStages } = scene;
    postProcessStages.fxaa.enabled = true;
    globe.maximumScreenSpaceError = 1;
    globe.depthTestAgainstTerrain = true;
    scene.logarithmicDepthBuffer = true;
    scene.fog.enabled = false;
    scene.skyAtmosphere.show = false;
  };

  const addAnnotationLayer = () => {
    if (!viewer.value || !cesiumRef.value) return;
    const labelsProvider = new cesiumRef.value.WebMapTileServiceImageryProvider(
      {
        url: 'https://t0.tianditu.gov.cn/cia_w/wmts?tk=5f3d5e07ab4e9727500d388f2f367ac6',
        layer: 'cia',
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18,
      }
    );
    viewer.value.imageryLayers.addImageryProvider(labelsProvider);
  };

  const loadTileset = async (config: CompanyConfig) => {
    if (!viewer.value || !cesiumRef.value) return;
    const tilesetUrl =
      formatTilesetUrl(config.threedTileUrl) || DEFAULT_TILESET_URL;

    console.log('[Cesium] 开始加载 Tileset');
    console.log('[Cesium] Tileset URL:', tilesetUrl);

    try {
      const tilesetOptions = {
        maximumScreenSpaceError: 1,
        maximumMemoryUsage: 2048,
        immediatelyLoadDesiredLevelOfDetail: true,
        skipLevelOfDetail: false,
        preferLeaves: true,
        dynamicScreenSpaceError: true,
        dynamicScreenSpaceErrorDensity: 0.00278,
        dynamicScreenSpaceErrorFactor: 4.0,
        progressiveResolutionHeightFraction: 0.1,
      };

      console.log('[Cesium] 创建 Cesium3DTileset 实例...');
      const tileset = new cesiumRef.value.Cesium3DTileset({
        url: tilesetUrl,
        ...tilesetOptions,
      });

      console.log('[Cesium] Tileset 对象创建成功，添加到场景...');
      viewer.value.scene.primitives.add(tileset);

      console.log('[Cesium] 等待 Tileset 就绪...');
      await tileset.readyPromise;

      const translation = new cesiumRef.value.Cartesian3(0, -30, -20);
      tileset.modelMatrix =
        cesiumRef.value.Matrix4.fromTranslation(translation);

      console.log('[Cesium] Tileset 加载完成！');
    } catch (error) {
      console.error('[Cesium] 3D Tileset 加载失败:', error);
      console.error('[Cesium] 错误详情:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const setInitialCameraView = (config: CompanyConfig) => {
    if (!viewer.value || !cesiumRef.value) return;
    viewer.value.camera.setView({
      destination: cesiumRef.value.Cartesian3.fromDegrees(
        config.longitude,
        config.latitude,
        config.perspectiveHeight
      ),
      orientation: {
        heading: cesiumRef.value.Math.toRadians(config.orientationAngle),
        pitch: cesiumRef.value.Math.toRadians(config.pitchAngle),
        roll: 0,
      },
    });
  };

  const initCesium = async (config: CompanyConfig) => {
    if (!viewerContainer.value) {
      throw new Error('Cesium 容器未就绪');
    }
    const { Cesium } = window;
    if (!Cesium) {
      throw new Error('Cesium 未全局引入，请检查 public/index.html');
    }
    cesiumRef.value = Cesium;
    if (config.cesiumIonToken) {
      Cesium.Ion.defaultAccessToken = config.cesiumIonToken;
    } else if (import.meta.env.VITE_CESIUM_ION_TOKEN) {
      Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;
    }
    viewer.value = new Cesium.Viewer(viewerContainer.value, {
      imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
        url: 'https://t0.tianditu.gov.cn/img_w/wmts?tk=5f3d5e07ab4e9727500d388f2f367ac6',
        layer: 'img',
        style: 'default',
        tileMatrixSetID: 'w',
        format: 'tiles',
        maximumLevel: 18,
      }),
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      infoBox: false,
      vrButton: false,
      requestRenderMode: false,
      maximumRenderTimeChange: Number.POSITIVE_INFINITY,
      scene3DOnly: true,
    });
  };

  const initializeViewer = async () => {
    try {
      console.log('[CesiumViewer] 开始初始化...');
      if (!viewerContainer.value) {
        throw new Error('Cesium 容器未就绪');
      }
      if (!window.Cesium) {
        throw new Error('Cesium 未全局引入');
      }
      const normalizedConfig = normalizeCompanyConfig(await fetchCompanyInfo());
      console.log('[CesiumViewer] 配置信息:', normalizedConfig);
      await initCesium(normalizedConfig);
      configureSceneEffects();
      addAnnotationLayer();
      await loadTileset(normalizedConfig);
      setInitialCameraView(normalizedConfig);
      const deviceList = normalizeDeviceList(await fetchDeviceList());
      drawDeviceBillboards(deviceList);
      console.log('[CesiumViewer] 初始化成功!');
    } catch (error) {
      console.error('[CesiumViewer] 初始化失败:', error);
    }
  };

  onMounted(async () => {
    // 确保 DOM 已完全挂载
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    await initializeViewer();
  });

  onBeforeUnmount(() => {
    cleanupCanvasInteractions();
    removeTooltip();
    if (viewer.value) {
      viewer.value.destroy();
      viewer.value = null;
    }
  });
</script>

<style scoped lang="less">
  .cesium-viewer {
    width: 100%;
    height: 100%;
    min-height: 400px;
    overflow: hidden;
    border: 1px solid rgb(71 128 255 / 35%);
    border-radius: 8px;
    box-shadow: inset 0 0 40px rgb(14 42 84 / 65%);
  }

  .cesium-tooltip {
    position: fixed;
    z-index: 9999;
    min-width: 160px;
    padding: 10px 12px;
    color: #d6edff;
    font-size: 12px;
    line-height: 1.5;
    background: rgb(11 25 52 / 88%);
    border: 1px solid rgb(58 141 255 / 70%);
    border-radius: 4px;
    backdrop-filter: blur(4px);
    pointer-events: none;
  }

  .tooltip-title {
    margin-bottom: 4px;
    font-weight: bold;
    font-size: 13px;
  }

  .tooltip-line {
    display: flex;
    gap: 4px;
  }
</style>
