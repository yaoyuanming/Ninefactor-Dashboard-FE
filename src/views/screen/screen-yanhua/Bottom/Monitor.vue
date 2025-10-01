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
        <div class="sidebar-content">
          <a-tree
            :data="treeData"
            :show-line="false"
            :default-expand-all="true"
            :selectable="true"
            @select="handleSelect"
          >
            <template #title="{ title }">
              <span class="tree-title">{{ title }}</span>
            </template>
          </a-tree>
        </div>
      </div>

      <!-- 右侧视频网格 -->
      <div class="monitor-main">
        <div class="video-grid">
          <div
            v-for="item in videoList"
            :key="item.id"
            class="video-item"
            :class="{ active: selectedVideo === item.id }"
            @click="selectVideo(item.id)"
          >
            <div class="video-placeholder">
              <div class="video-icon">📹</div>
              <div class="video-name">{{ item.name }}</div>
              <div
                class="video-status"
                :class="item.online ? 'online' : 'offline'"
              >
                {{ item.online ? '在线' : '离线' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';

  // 左侧树形数据
  const treeData = ref([
    {
      key: '1',
      title: '企业监控',
      children: [
        {
          key: '1-1',
          title: '企业A监控',
        },
        {
          key: '1-2',
          title: '企业B监控',
        },
      ],
    },
    {
      key: '2',
      title: '仓库监控',
      children: [
        {
          key: '2-1',
          title: '仓库1监控',
        },
        {
          key: '2-2',
          title: '仓库2监控',
        },
      ],
    },
  ]);

  // 视频列表（9宫格）
  const videoList = ref([
    { id: 1, name: '监控点1', online: true },
    { id: 2, name: '监控点2', online: true },
    { id: 3, name: '监控点3', online: false },
    { id: 4, name: '监控点4', online: true },
    { id: 5, name: '监控点5', online: true },
    { id: 6, name: '监控点6', online: true },
    { id: 7, name: '监控点7', online: false },
    { id: 8, name: '监控点8', online: true },
    { id: 9, name: '监控点9', online: true },
  ]);

  const selectedVideo = ref<number | null>(null);

  // 树节点选择
  const handleSelect = (selectedKeys: any) => {
    console.log('选择的节点:', selectedKeys);
    // TODO: 根据选择的节点加载对应的视频列表
  };

  // 选择视频
  const selectVideo = (id: number) => {
    selectedVideo.value = id;
    console.log('选择的视频:', id);
    // TODO: 播放选中的视频
  };
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
          padding: 15px 20px;
          color: #fff;
          font-weight: 600;
          background: rgb(255 255 255 / 8%);
          border-bottom: 1px solid rgb(255 255 255 / 10%);
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
        background: transparent;
        border-radius: 0;

        .video-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          height: 100%;
          padding: 15px;

          .video-item {
            position: relative;
            overflow: hidden;
            background: rgb(0 0 0 / 40%);
            border: 2px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            aspect-ratio: 16/9;

            &:hover {
              border-color: rgb(23 150 250 / 60%);
              box-shadow: 0 4px 12px rgb(23 150 250 / 30%);
              transform: translateY(-2px);
            }

            &.active {
              border-color: #1796fa;
              box-shadow: 0 0 20px rgb(23 150 250 / 50%);
            }

            .video-placeholder {
              display: flex;
              flex-direction: column;
              gap: 10px;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;

              .video-icon {
                font-size: 48px;
                opacity: 0.5;
              }

              .video-name {
                color: #fff;
                font-weight: 500;
                font-size: 14px;
              }

              .video-status {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 4px 12px;
                font-weight: 600;
                font-size: 12px;
                border-radius: 12px;

                &.online {
                  color: #00d68f;
                  background: rgb(0 214 143 / 20%);
                  border: 1px solid #00d68f;
                }

                &.offline {
                  color: #ff6b6b;
                  background: rgb(255 107 107 / 20%);
                  border: 1px solid #ff6b6b;
                }
              }
            }
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
  }
</style>
