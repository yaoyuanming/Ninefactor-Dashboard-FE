<template>
  <div class="monitor-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">视频监控</h2>
    </div>

    <div class="monitor-content">
      <!-- 左侧树形菜单 -->
      <div class="monitor-sidebar">
        <div class="sidebar-header">
          <span>监控点列表</span>
        </div>

        <!-- 模式切换 -->
        <div class="mode-switch">
          <div
            class="mode-item"
            :class="{ active: activeMode === 'realtime' }"
            @click="switchMode('realtime')"
          >
            <span class="mode-icon">📹</span>
            <span class="mode-text">实时监控</span>
          </div>
          <div
            class="mode-item"
            :class="{ active: activeMode === 'history' }"
            @click="switchMode('history')"
          >
            <span class="mode-icon">🎬</span>
            <span class="mode-text">历史回放</span>
          </div>
        </div>

        <!-- 历史回放查询面板 -->
        <div v-if="activeMode === 'history'" class="history-query">
          <div class="query-item">
            <label>开始时间</label>
            <a-date-picker
              v-model="historyStartTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              size="small"
              :disabled-date="(current) => current && current > new Date()"
              style="width: 100%"
            />
          </div>
          <div class="query-item">
            <label>结束时间</label>
            <a-date-picker
              v-model="historyEndTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              size="small"
              :disabled-date="(current) => current && current > new Date()"
              style="width: 100%"
            />
          </div>
          <a-button
            type="primary"
            size="small"
            long
            :disabled="
              !selectedCameraIds.length || !historyStartTime || !historyEndTime
            "
            @click="queryPlayback"
          >
            查询回放
          </a-button>
        </div>

        <div class="sidebar-content">
          <a-spin :loading="treeLoading" style="width: 100%">
            <a-tree
              v-if="activeMode === 'realtime'"
              :data="currentTreeData"
              :field-names="{
                key: 'key',
                title: 'title',
                children: 'children',
                isLeaf: 'isLeaf',
              }"
              :show-line="false"
              :default-expand-all="false"
              :selectable="true"
              :load-more="loadTreeNode"
              @select="handleSelect"
            >
              <template #title="{ title }">
                <span class="tree-title">{{ title }}</span>
              </template>
            </a-tree>
            <a-tree
              v-else
              :data="currentTreeData"
              :field-names="{
                key: 'key',
                title: 'title',
                children: 'children',
                isLeaf: 'isLeaf',
              }"
              :show-line="false"
              :default-expand-all="false"
              :checkable="true"
              :only-check-leaf="true"
              :checked-keys="selectedCameraIds"
              :load-more="loadTreeNode"
              @check="handleCheck"
            >
              <template #title="{ title }">
                <span class="tree-title">{{ title }}</span>
              </template>
            </a-tree>
          </a-spin>
        </div>
      </div>

      <!-- 右侧视频网格 -->
      <div class="monitor-main">
        <RealtimeMonitor
          v-if="activeMode === 'realtime'"
          :selected-node="selectedNode"
        />
        <HistoryPlayback
          v-else
          :selected-cameras="selectedCameraMap"
          :start-time="historyStartTime"
          :end-time="historyEndTime"
          :trigger="playbackTrigger"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getCameraTree } from '@/api/camera';
  import RealtimeMonitor from './Monitor/RealtimeMonitor.vue';
  import HistoryPlayback from './Monitor/HistoryPlayback.vue';

  interface TreeNode {
    key: string;
    title: string;
    children?: TreeNode[];
    dataNodeType?: string; // 改名避免与 DOM 的 nodeType 冲突
    isParent?: boolean;
    vendorType?: string;
    isLeaf?: boolean;
    id?: string;
    pId?: string;
  }

  // 当前模式：realtime-实时监控，history-历史回放
  const activeMode = ref<'realtime' | 'history'>('realtime');

  // 实时监控树形数据
  const realtimeTreeData = ref<TreeNode[]>([]);
  const treeLoading = ref(false);

  // 将扁平数据转换为树形结构（参考旧项目逻辑）
  const buildTree = (flatData: any[]): TreeNode[] => {
    if (!flatData || flatData.length === 0) {
      return [];
    }

    const map = new Map();
    const roots: TreeNode[] = [];

    // 创建所有节点的映射
    flatData.forEach((item) => {
      const isCamera = item.nodeType === 'camera';
      const node: TreeNode = {
        key: item.id,
        title: item.name,
        id: item.id,
        pId: item.pId,
        dataNodeType: item.nodeType, // 使用 dataNodeType 避免冲突
        isParent: item.isParent,
        vendorType: item.vendorType,
        isLeaf: isCamera,
      };
      // 只有非叶子节点且是父节点才添加空children以支持懒加载
      // 摄像头节点（叶子节点）不添加children，这样就不会显示展开箭头
      if (!isCamera && item.isParent) {
        node.children = [];
      }
      map.set(item.id, node);
    });

    // 构建树形结构
    flatData.forEach((item) => {
      const node = map.get(item.id);
      // 判断是否为根节点
      if (
        item.pId === '-1' ||
        item.pId === '0' ||
        item.pId === 0 ||
        !item.pId ||
        !map.has(item.pId)
      ) {
        roots.push(node);
      } else {
        const parent = map.get(item.pId);
        if (parent) {
          // 如果父节点没有children，创建一个
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(node);
        }
      }
    });

    return roots;
  };

  // 加载监控树根节点
  const loadCameraTree = async () => {
    treeLoading.value = true;
    try {
      const response: any = await getCameraTree({ menu: 0 });

      let dataArray: any[] = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        dataArray = response.data;
      }

      // 构建树形结构
      realtimeTreeData.value = buildTree(dataArray);
    } catch (error: any) {
      Message.error(error?.message || '加载监控树失败');
      realtimeTreeData.value = [];
    } finally {
      treeLoading.value = false;
    }
  };

  // 历史回放树形数据
  const historyTreeData = ref<TreeNode[]>([]);

  // 加载历史回放树（menu=1）
  const loadHistoryTree = async () => {
    treeLoading.value = true;
    try {
      const response: any = await getCameraTree({ menu: 1 });

      let dataArray: any[] = [];
      if (Array.isArray(response)) {
        dataArray = response;
      } else if (response?.data && Array.isArray(response.data)) {
        dataArray = response.data;
      }

      // 构建树形结构
      historyTreeData.value = buildTree(dataArray);
    } catch (error: any) {
      Message.error(error?.message || '加载历史回放树失败');
      historyTreeData.value = [];
    } finally {
      treeLoading.value = false;
    }
  };

  // 当前显示的树形数据
  const currentTreeData = computed(() => {
    return activeMode.value === 'realtime'
      ? realtimeTreeData.value
      : historyTreeData.value;
  });

  // 历史回放查询参数（使用日期时间选择器）
  const historyStartTime = ref('');
  const historyEndTime = ref('');

  // 历史回放选中的摄像头IDs
  const selectedCameraIds = ref<string[]>([]);
  const selectedCameraMap = ref<Record<string, any>>({});

  // 选中的节点
  const selectedNode = ref<any>(null);

  // 模式切换
  const switchMode = async (mode: 'realtime' | 'history') => {
    activeMode.value = mode;

    // 切换到历史回放模式时，加载历史树并设置默认时间
    if (mode === 'history') {
      if (historyTreeData.value.length === 0) {
        await loadHistoryTree();
      }

      // 设置默认时间为当天 00:00:00 - 23:59:59
      if (!historyStartTime.value || !historyEndTime.value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        historyStartTime.value = `${year}-${month}-${day} 00:00:00`;
        historyEndTime.value = `${year}-${month}-${day} 23:59:59`;
      }

      // 清空选中的摄像头
      selectedCameraIds.value = [];
      selectedCameraMap.value = {};
    }
  };

  // 懒加载子节点（Arco Tree 的 load-more 需要返回 Promise<void>）
  const loadTreeNode = async (node: TreeNode): Promise<void> => {
    // 判断是否为叶子节点
    if (!node || node.isLeaf || node.dataNodeType === 'camera') {
      return;
    }

    // 如果已经加载过子节点，不重复加载
    if (node.children && node.children.length > 0) {
      return;
    }

    try {
      // 根据当前模式使用不同的 menu 参数
      const menu = activeMode.value === 'history' ? 1 : 0;

      const resp: any = await getCameraTree({
        id: node.id || node.key,
        menu,
        vendorType: node.vendorType,
      });

      // 处理响应数据
      let list: any[] = [];
      if (Array.isArray(resp)) {
        list = resp;
      } else if (Array.isArray(resp?.data)) {
        list = resp.data;
      }

      // 转换子节点并直接赋值给 node.children
      node.children = list.map((item: any) => {
        const isCamera = item.nodeType === 'camera';
        const childNode: TreeNode = {
          key: item.id,
          title: item.name,
          id: item.id,
          pId: item.pId,
          dataNodeType: item.nodeType, // 使用 dataNodeType 避免冲突
          isParent: item.isParent,
          vendorType: item.vendorType,
          isLeaf: isCamera,
        };
        // 只有非摄像头且是父节点才添加空children
        // 摄像头节点不添加children，确保不显示展开箭头
        if (!isCamera && item.isParent) {
          childNode.children = [];
        }
        return childNode;
      });
    } catch (error) {
      // 加载失败时设置为空数组
      node.children = [];
    }
  };

  // 树节点选择（仅实时监控模式）
  const handleSelect = (selectedKeys: any, data: any) => {
    if (activeMode.value !== 'realtime') return;

    const { node } = data;
    console.log('树节点点击:', node);

    if (!node) return;

    // 如果不是摄像头节点，不做处理（只是展开/收起）
    if (node.dataNodeType !== 'camera' || !node.isLeaf) {
      console.log('非摄像头节点，不播放');
      return;
    }

    console.log('摄像头节点，准备播放:', node.title);

    // 保存选中的摄像头节点信息
    selectedNode.value = {
      id: node.id || node.key,
      title: node.title,
      dataNodeType: node.dataNodeType,
      vendorType: node.vendorType,
      isLeaf: node.isLeaf,
    };

    console.log('已设置 selectedNode:', selectedNode.value);
  };

  // 树节点复选（仅历史回放模式）
  const handleCheck = (checkedKeys: any, data: any) => {
    if (activeMode.value !== 'history') return;

    console.log('复选框变化:', checkedKeys, data);

    // 级联选择模式下，only-check-leaf=true 时，checkedKeys 只包含叶子节点的 key
    const keys = Array.isArray(checkedKeys) ? checkedKeys : [];
    selectedCameraIds.value = keys;

    // 从 checkedNodes 中提取摄像头节点信息（只收集叶子节点）
    const checkedNodes = data.checkedNodes || [];
    const cameraNodes = checkedNodes.filter(
      (node: TreeNode) => node.isLeaf && node.dataNodeType === 'camera'
    );

    // 保存节点信息用于查询
    const map: Record<string, any> = {};
    cameraNodes.forEach((node: TreeNode) => {
      map[node.key] = {
        id: node.id || node.key,
        title: node.title,
        vendorType: node.vendorType,
      };
    });
    selectedCameraMap.value = map;

    console.log('已选摄像头:', cameraNodes.length, '个');
  };

  // 回放触发器 - 用于强制重新播放
  const playbackTrigger = ref(0);

  // 查询历史回放
  const queryPlayback = () => {
    if (!selectedCameraIds.value.length) {
      Message.warning('请先选择摄像头');
      return;
    }
    if (!historyStartTime.value || !historyEndTime.value) {
      Message.warning('请选择时间段');
      return;
    }

    console.log('查询回放:', {
      cameras: selectedCameraIds.value,
      cameraMap: selectedCameraMap.value,
      startTime: historyStartTime.value,
      endTime: historyEndTime.value,
    });

    // 触发回放（通过改变 trigger 值强制 HistoryPlayback 重新播放）
    playbackTrigger.value += 1;

    Message.success(
      `开始播放 ${selectedCameraIds.value.length} 个摄像头的历史录像`
    );
  };

  // 组件挂载时加载树数据
  onMounted(() => {
    loadCameraTree();
  });
</script>

<style scoped lang="less">
  .monitor-page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    overflow: hidden;

    .page-header {
      display: none;
    }

    .monitor-content {
      display: flex;
      flex: 1;
      gap: 15px;
      overflow: hidden;

      .monitor-sidebar {
        display: flex;
        flex-direction: column;
        width: 220px;
        overflow: hidden;
        background: rgb(255 255 255 / 2%);
        border-radius: 2px;

        .sidebar-header {
          flex-shrink: 0;
          padding: 15px 20px;
          color: #fff;
          font-weight: 600;
          background: rgb(255 255 255 / 8%);
          border-bottom: 1px solid rgb(255 255 255 / 10%);
        }

        .mode-switch {
          display: grid;
          flex-shrink: 0;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 12px;
          background: rgb(255 255 255 / 3%);
          border-bottom: 1px solid rgb(255 255 255 / 8%);

          .mode-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: center;
            justify-content: center;
            padding: 10px 8px;
            color: rgb(255 255 255 / 65%);
            font-size: 12px;
            background: rgb(255 255 255 / 5%);
            border: 1px solid rgb(255 255 255 / 10%);
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              color: rgb(255 255 255 / 85%);
              background: rgb(255 255 255 / 10%);
              border-color: rgb(23 150 250 / 30%);
            }

            &.active {
              color: #1796fa;
              background: rgb(23 150 250 / 15%);
              border-color: #1796fa;
              box-shadow: 0 0 8px rgb(23 150 250 / 30%);
            }

            .mode-icon {
              font-size: 20px;
            }

            .mode-text {
              font-weight: 500;
            }
          }
        }

        .history-query {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          gap: 10px;
          padding: 12px;
          background: rgb(255 255 255 / 3%);
          border-bottom: 1px solid rgb(255 255 255 / 8%);

          .query-item {
            display: flex;
            flex-direction: column;
            gap: 6px;

            label {
              color: rgb(255 255 255 / 75%);
              font-size: 12px;
            }
          }

          :deep(.arco-picker),
          :deep(.arco-input-wrapper) {
            width: 100%;
            color: rgb(255 255 255 / 85%);
            background: rgb(0 0 0 / 30%);
            border-color: rgb(255 255 255 / 15%);

            &:hover {
              border-color: rgb(23 150 250 / 50%);
            }

            input {
              color: rgb(255 255 255 / 85%);
              background: transparent;

              &::placeholder {
                color: rgb(255 255 255 / 40%);
              }
            }
          }

          :deep(.arco-btn-primary) {
            background: linear-gradient(135deg, #1796fa 0%, #0d6fbe 100%);
            border: none;

            &:hover {
              background: linear-gradient(135deg, #2ea3ff 0%, #1796fa 100%);
            }
          }
        }

        .sidebar-content {
          flex: 1;
          padding: 15px;
          overflow-y: auto;

          :deep(.arco-tree) {
            color: #fff;
            background: transparent;

            .arco-tree-node {
              &:hover {
                background: rgb(255 255 255 / 8%);
              }
            }

            .arco-tree-node-selected {
              background: rgb(23 150 250 / 30%);
            }

            .arco-tree-node-title {
              color: rgb(255 255 255 / 90%);
            }

            .arco-tree-node-switcher {
              color: rgb(255 255 255 / 60%);
            }
          }

          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background: rgb(255 255 255 / 20%);
            border-radius: 3px;
          }
        }
      }

      .monitor-main {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }
    }
  }
</style>
