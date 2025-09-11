<template>
  <!-- 发起人节点 -->
  <StartUserNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.START_USER_NODE"
    :flow-node="currentNode"
  />
  <!-- 审批节点 -->
  <UserTaskNodeTenant
    v-if="
      currentNode &&
      (currentNode.type === NodeType.USER_TASK_NODE ||
        currentNode.type === NodeType.TRANSACTOR_NODE)
    "
    :flow-node="currentNode"
    :model-item="modelItem"
    @update:flow-node="handleModelValueUpdate"
    @find:parent-node="findFromParentNode"
  />
  <!-- 抄送节点 -->
  <CopyTaskNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.COPY_TASK_NODE"
    :flow-node="currentNode"
    @update:flow-node="handleModelValueUpdate"
  />
  <!-- 条件节点 -->
  <ExclusiveNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.CONDITION_BRANCH_NODE"
    :flow-node="currentNode"
    @update:model-value="handleModelValueUpdate"
    @find:parent-node="findFromParentNode"
  />
  <!-- 并行节点 -->
  <ParallelNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.PARALLEL_BRANCH_NODE"
    :flow-node="currentNode"
    @update:model-value="handleModelValueUpdate"
    @find:parent-node="findFromParentNode"
  />
  <!-- 包容分支节点 -->
  <InclusiveNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.INCLUSIVE_BRANCH_NODE"
    :flow-node="currentNode"
    @update:model-value="handleModelValueUpdate"
    @find:parent-node="findFromParentNode"
  />
  <!-- 延迟器节点 -->
  <DelayTimerNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.DELAY_TIMER_NODE"
    :flow-node="currentNode"
    @update:flow-node="handleModelValueUpdate"
  />
  <!-- 路由分支节点 -->
  <RouterNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.ROUTER_BRANCH_NODE"
    :flow-node="currentNode"
    @update:flow-node="handleModelValueUpdate"
  />
  <!-- 触发器节点 -->
  <TriggerNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.TRIGGER_NODE"
    :flow-node="currentNode"
    @update:flow-node="handleModelValueUpdate"
  />
  <!-- 子流程节点 -->
  <ChildProcessNodeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.type === NodeType.CHILD_PROCESS_NODE"
    :flow-node="currentNode"
    @update:flow-node="handleModelValueUpdate"
  />
  <!-- 递归显示孩子节点  -->
  <ProcessNodeTreeTenant
    :model-item="modelItem"
    v-if="currentNode && currentNode.childNode"
    v-model:flow-node="currentNode.childNode"
    :parent-node="currentNode"
    @find:recursive-find-parent-node="recursiveFindParentNode"
  />

  <!-- 结束节点 -->
  <EndEventNodeTenant
    v-if="currentNode && currentNode.type === NodeType.END_EVENT_NODE"
    :flow-node="currentNode"
  />
</template>
<script setup lang="ts">
import StartUserNodeTenant from './nodes/StartUserNodeTenant.vue'
import EndEventNodeTenant from './nodes/EndEventNodeTenant.vue'
import UserTaskNodeTenant from './nodes/UserTaskNodeTenant.vue'
import CopyTaskNodeTenant from './nodes/CopyTaskNodeTenant.vue'
import ExclusiveNodeTenant from './nodes/ExclusiveNodeTenant.vue'
import ParallelNodeTenant from './nodes/ParallelNodeTenant.vue'
import InclusiveNodeTenant from './nodes/InclusiveNodeTenant.vue'
import DelayTimerNodeTenant from './nodes/DelayTimerNodeTenant.vue'
import RouterNodeTenant from './nodes/RouterNodeTenant.vue'
import TriggerNodeTenant from './nodes/TriggerNodeTenant.vue'
import ChildProcessNodeTenant from './nodes/ChildProcessNodeTenant.vue'
import { SimpleFlowNode, NodeType } from './consts'
import { useWatchNode } from './node'
defineOptions({
  name: 'ProcessNodeTreeTenant'
})
const props = defineProps({
  parentNode: {
    type: Object as () => SimpleFlowNode,
    default: () => null
  },
  flowNode: {
    type: Object as () => SimpleFlowNode,
    default: () => null
  },
  modelItem: {
    type: Object,
    required: false
  },
})
const emits = defineEmits<{
  'update:flowNode': [node: SimpleFlowNode | undefined]
  'find:recursiveFindParentNode': [
    nodeList: SimpleFlowNode[],
    curentNode: SimpleFlowNode,
    nodeType: number
  ]
}>()

const currentNode = useWatchNode(props)

// 用于删除节点
const handleModelValueUpdate = (updateValue) => {
  emits('update:flowNode', updateValue)
}

const findFromParentNode = (nodeList: SimpleFlowNode[], nodeType: number) => {
  emits('find:recursiveFindParentNode', nodeList, props.parentNode, nodeType)
}

// 递归从父节点中查询匹配的节点
const recursiveFindParentNode = (
  nodeList: SimpleFlowNode[],
  findNode: SimpleFlowNode,
  nodeType: number
) => {
  if (!findNode) {
    return
  }
  if (findNode.type === NodeType.START_USER_NODE) {
    nodeList.push(findNode)
    return
  }

  if (findNode.type === nodeType) {
    nodeList.push(findNode)
  }
  emits('find:recursiveFindParentNode', nodeList, props.parentNode, nodeType)
}
</script>
<style lang="scss" scoped></style>
