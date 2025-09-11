<template>
  <el-card shadow="never">
    <div class="side-header">
      <div class="side-title">
        <el-icon :size="20" color="#409eff" style="margin-right: 8px;"><ChatDotRound /></el-icon>
        智能助手
      </div>
      <el-button 
        type="primary" 
        size="small" 
        @click="openAssistantDialog"
        :icon="ChatDotRound"
      >
        开始对话
      </el-button>
    </div>

    <!-- 卡片内容区域 -->
    <div class="card-content" @click="openAssistantDialog">
      <div class="welcome-section">
        <div class="welcome-title">欢迎使用智能助手</div>
        <div class="welcome-text">我是您的智能助手，可以帮您解答系统安全、网络安全、数据保护等方面的问题</div>
      </div>
    </div>

    <!-- 智能助手对话框 -->
    <el-dialog
      v-model="showAssistantDialog"
      title="智能助手"
      width="800px"
      :close-on-click-modal="false"
      class="assistant-dialog"
      :resize="false"
      :before-close="handleBeforeClose"
    >
      <div class="assistant-container">
        <!-- 对话区域 -->
        <div class="chat-area" ref="chatArea">
          <div 
            v-for="(message, index) in chatMessages" 
            :key="index" 
            :class="['message', message.type]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.type === 'user'" :size="20" color="#409eff"><User /></el-icon>
              <img v-else src="/AI.png" alt="logo" width="40" height="40" />
            </div>
            <div class="message-content">
              <div class="message-text" v-html="renderMarkdown(getSafeMessageContent(message.content))">
              </div>
              <span v-if="message.isStreaming" class="streaming-indicator">▋</span>
            </div>
          </div>
          
          <!-- 空状态提示 -->
          <div v-if="chatMessages.length === 0" class="empty-chat">
            <div class="empty-icon">
              <img src="/AI.png" alt="logo" width="100" height="100" />
            </div>
            <div class="empty-title">欢迎使用智能助手</div>
            <div class="empty-text">我是您的AI安全顾问，可以帮您解答系统安全、网络安全、数据保护等方面的问题</div>
            
            <!-- 建议问题 -->
            <div class="suggested-questions">
              <div class="suggested-title">您可以这样问我：</div>
              <div class="question-tags">
                <el-tag 
                  v-for="question in suggestedQuestions" 
                  :key="question.key"
                  @click="askSuggestedQuestion(question.text)"
                  class="question-tag"
                  effect="light"
                  size="large"
                >
                  {{ question.text }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 输入区域 -->
        <div class="input-area">
          <el-input
            v-model="userInput"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            :disabled="isAssistantLoading"
            class="chat-input"
          >
            <template #append>
              <el-button 
                type="primary" 
                @click="sendMessage"
                :loading="isAssistantLoading"
                :disabled="!userInput.trim()"
                class="send-button"
              >
                发送
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAssistantDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </el-card>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted } from 'vue'
import { ChatDotRound, User } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { chatWithAgent, createSession } from '@/api/ai/assistant'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

defineOptions({ name: 'Assistant' })

const router = useRouter()

// 智能助手对话框状态
const showAssistantDialog = ref(false)
const userInput = ref('')
const isAssistantLoading = ref(false)
const chatMessages = ref<any[]>([])
const chatArea = ref(null)
const aiSessionId = ref<string>('')

// 建议问题列表
const suggestedQuestions = ref([
  { key: 'security', text: '如何提高系统安全性？' },
  { key: 'network', text: '网络安全防护措施有哪些？' },
  { key: 'data', text: '数据保护最佳实践是什么？' },
  { key: 'compliance', text: '安全合规要求有哪些？' },
  { key: 'risk', text: '如何评估安全风险？' },
  { key: 'incident', text: '安全事件如何应急处理？' }
])

// 点击建议问题
const askSuggestedQuestion = (question: string) => {
  // 先打开对话框
  showAssistantDialog.value = true
  // 填入问题到输入框
  userInput.value = question
  // 等待对话框打开后自动发送
  nextTick(() => {
    sendMessage()
  })
}

// 快速操作
const quickAction = (type: string) => {
  let message = ''
  let actions: any[] = []

  switch (type) {
    case 'check':
      message = '您想查看检查任务的最新进展吗？'
      actions = [
        { key: 'check_list', label: '查看检查任务列表' },
        { key: 'create_check', label: '创建新检查任务' },
        { key: 'back', label: '返回' }
      ]
      break
    case 'danger':
      message = '您想查看隐患管理的最新情况吗？'
      actions = [
        { key: 'danger_list', label: '查看隐患清单' },
        { key: 'create_danger', label: '创建新隐患' },
        { key: 'back', label: '返回' }
      ]
      break
    case 'company':
      message = '您想查看企业信息采集的概况吗？'
      actions = [
        { key: 'company_list', label: '查看企业列表' },
        { key: 'company_report', label: '生成企业报表' },
        { key: 'back', label: '返回' }
      ]
      break
    case 'report':
      message = '您想查看报表统计的最新数据吗？'
      actions = [
        { key: 'risk_report', label: '风险管控报表' },
        { key: 'danger_report', label: '隐患治理报表' },
        { key: 'back', label: '返回' }
      ]
      break
    default:
      message = '您想了解什么？'
      actions = [
        { key: 'check', label: '检查任务' },
        { key: 'danger', label: '隐患管理' },
        { key: 'company', label: '企业管理' },
        { key: 'report', label: '报表统计' }
      ]
      break
  }

  addMessage({ content: message, type: 'assistant', actions: actions })
}

// 处理助手动作
const handleAction = (action: any) => {
  addMessage({ content: `您点击了"${action.label}"`, type: 'user' })
  
  if (action.key === 'back') {
    // 返回上一级
    addMessage({ content: '您想了解什么？', type: 'assistant', actions: [
      { key: 'check', label: '检查任务' },
      { key: 'danger', label: '隐患管理' },
      { key: 'company', label: '企业管理' },
      { key: 'report', label: '报表统计' }
    ]})
  } else {
    // 根据action.key执行相应操作
    switch (action.key) {
      case 'check_list':
        router.push('/supervisoryInspect/specialInspectionRecord')
        break
      case 'create_check':
        router.push('/supervisoryInspect/taskDeploy')
        break
      case 'danger_list':
        router.push('/standardized/pitfall/list')
        break
      case 'create_danger':
        router.push('/standardized/pitfall/create')
        break
      case 'company_list':
        router.push('/enterpriseArchives/list')
        break
      case 'company_report':
        router.push('/enterpriseArchives/report')
        break
      case 'risk_report':
        router.push('/standardization/risks/report')
        break
      case 'danger_report':
        router.push('/standardization/overview/report')
        break
    }
  }
}

// 添加消息到聊天记录
const addMessage = (message: any) => {
  chatMessages.value.push(message)
  
  nextTick(() => {
    if (chatArea.value) {
      chatArea.value.scrollTop = chatArea.value.scrollHeight
    }
  })
}

// 更新消息内容
const updateMessage = (index: number, updates: any) => {
  if (chatMessages.value[index]) {
    Object.assign(chatMessages.value[index], updates)
    
    // 强制触发响应式更新
    chatMessages.value = [...chatMessages.value]
  }
}

// 清空聊天记录
const clearChat = () => {
  chatMessages.value = []
  userInput.value = ''
}

// 发送消息到AI API
const sendMessage = async () => {
  if (!userInput.value.trim()) return
  if (!aiSessionId.value) {
    ElMessage.error('正在建立会话，请稍后再试')
    return
  }

  const userMessage = userInput.value
  
  addMessage({ content: userMessage, type: 'user' })
  userInput.value = ''

  isAssistantLoading.value = true
  
  // 添加AI消息占位符
  const aiMessageIndex = chatMessages.value.length
  addMessage({ content: '', type: 'assistant', isStreaming: true })
  
  try {
    // 调用AI API - SSE流式接口
    const cleanup = chatWithAgent(
      aiSessionId.value,
      userMessage,
      // 消息回调 - 处理流式文本片段
      (data) => {
        if (data.type === 'node' && data.text !== undefined && typeof data.text === 'string') {
          // 更新流式消息内容
          if (chatMessages.value[aiMessageIndex]) {
            const currentContent = chatMessages.value[aiMessageIndex].content || ''
            const newContent = currentContent + data.text
            
            // 直接更新消息内容
            chatMessages.value[aiMessageIndex].content = newContent
            
            // 强制触发响应式更新
            chatMessages.value = [...chatMessages.value]
            
            // 强制更新视图
            nextTick(() => {
              if (chatArea.value) {
                chatArea.value.scrollTop = chatArea.value.scrollHeight
              }
            })
          }
        } else if (data.type === 'end_node' && data.text !== undefined && typeof data.text === 'string') {
          // 使用完整的最终文本替换当前内容
          if (chatMessages.value[aiMessageIndex]) {
            chatMessages.value[aiMessageIndex].content = data.text
            chatMessages.value[aiMessageIndex].isStreaming = false
            
            // 强制触发响应式更新
            chatMessages.value = [...chatMessages.value]
            
            // 最终滚动到底部
            nextTick(() => {
              if (chatArea.value) {
                chatArea.value.scrollTop = chatArea.value.scrollHeight
              }
            })
          }
        }
      },
      // 错误回调
      (error) => {
        if (chatMessages.value[aiMessageIndex]) {
          chatMessages.value[aiMessageIndex].content = '抱歉，我遇到了一些问题。请稍后再试。'
          chatMessages.value[aiMessageIndex].isStreaming = false
        }
        isAssistantLoading.value = false
      },
      // 完成回调
      () => {
        if (chatMessages.value[aiMessageIndex]) {
          chatMessages.value[aiMessageIndex].isStreaming = false
          // 添加快速操作按钮
          chatMessages.value[aiMessageIndex].actions = [
            { key: 'check', label: '检查任务' },
            { key: 'danger', label: '隐患管理' },
            { key: 'company', label: '企业管理' },
            { key: 'report', label: '报表统计' }
          ]
          
          // 最终滚动到底部
          nextTick(() => {
            if (chatArea.value) {
              chatArea.value.scrollTop = chatArea.value.scrollHeight
            }
          })
        }
        isAssistantLoading.value = false
      }
    )

    // 设置超时，防止无限等待
    setTimeout(() => {
      if (chatMessages.value[aiMessageIndex]?.isStreaming) {
        chatMessages.value[aiMessageIndex].content = '响应超时，请重试。'
        chatMessages.value[aiMessageIndex].isStreaming = false
        isAssistantLoading.value = false
      }
    }, 30000) // 30秒超时

  } catch (error) {
    if (chatMessages.value[aiMessageIndex]) {
      chatMessages.value[aiMessageIndex].content = '抱歉，我遇到了一些问题。请稍后再试。'
      chatMessages.value[aiMessageIndex].isStreaming = false
    }
    isAssistantLoading.value = false
  }
}

// 打开对话框
const openAssistantDialog = async () => {
  showAssistantDialog.value = true
  // 清空之前的聊天记录
  chatMessages.value = []
  aiSessionId.value = ''
  try {
    aiSessionId.value = await createSession('assistant', 0)
  } catch (e: any) {
    ElMessage.error(e?.message || '创建会话失败')
  }
}

// 处理对话框关闭（确保点击 X 能关闭）
const handleBeforeClose = (done: () => void) => {
  done()
}

// 计算属性：安全地获取消息内容
const getSafeMessageContent = (content: any) => {
  
  if (content === null || content === undefined) {
    return ''
  }
  
  if (typeof content === 'string') {
    return content
  }
  
  if (typeof content === 'number' || typeof content === 'boolean') {
    return String(content)
  }
  
  if (typeof content === 'object') {
    if (Array.isArray(content)) {
      return content.join(', ')
    }
    
    // 如果是对象，尝试提取有用的信息
    if (content.text !== undefined) {
      return content.text
    }
    
    if (content.content !== undefined) {
      return content.content
    }
    
    if (content.message !== undefined) {
      return content.message
    }
    
    // 最后才使用JSON.stringify
    try {
      return JSON.stringify(content)
    } catch (e) {
      return '[无法解析的对象]'
    }
  }
  
  return String(content)
}

// 渲染Markdown
const renderMarkdown = (text: string) => {
  if (!text) return ''
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true,
    quotes: '“”‘’'
  })
  return md.render(text)
}

onMounted(() => {
  // 初始化智能助手欢迎消息
  chatMessages.value = [
    {
      content: '您好！我是您的智能助手。我可以帮助您管理检查任务、隐患和报表。您有什么需要帮助的吗？',
      type: 'assistant',
      actions: [
        { key: 'check', label: '检查任务' },
        { key: 'danger', label: '隐患管理' },
        { key: 'company', label: '企业管理' },
        { key: 'report', label: '报表统计' }
      ]
    }
  ]
})
</script>

<style lang="scss" scoped>
.side-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.side-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.assistant-dialog {
  .el-dialog {
    min-height: 700px;
  }
  
  .el-dialog__header {
    background-color: #f5f7fa;
    border-bottom: 1px solid #e4e7ed;
    padding: 16px 20px;
  }
  .el-dialog__title {
    font-weight: bold;
    font-size: 18px;
    color: #303133;
  }
  .el-dialog__body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    height: 600px;
    min-height: 600px;
    max-height: 600px;
    overflow: hidden;
  }
  .el-dialog__footer {
    background-color: #f5f7fa;
    border-top: 1px solid #e4e7ed;
    padding: 16px 20px;
  }
  .el-dialog__footer .el-button {
    margin-left: 10px;
  }
}

.assistant-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.chat-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding: 20px 8px;
  min-height: 450px;
  max-height: 450px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #fafafa;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  padding: 0 4px;
}

.message.user {
  flex-direction: row-reverse;
}

.message .message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e1f3d8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  margin-left: 12px;
  flex-shrink: 0;
}

.message.assistant .message-avatar {
  background-color: #f5f7fa;
  margin-right: 12px;
  margin-left: 12px;
  flex-shrink: 0;
}

.message .message-content {
  max-width: 80%;
  padding: 16px 20px;
  border-radius: 12px;
  position: relative;
  margin: 0 1px;
}

.message.user .message-content {
  background-color: #e1f3d8;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background-color: #f5f7fa;
  border-bottom-left-radius: 4px;
}

.message .message-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
  
  // Markdown样式
  h1, h2, h3, h4, h5, h6 {
    margin: 16px 0 8px 0;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
  }
  
  h1 { font-size: 20px; }
  h2 { font-size: 18px; }
  h3 { font-size: 16px; }
  h4 { font-size: 15px; }
  h5 { font-size: 14px; }
  h6 { font-size: 13px; }
  
  p {
    margin: 8px 0;
    line-height: 1.6;
  }
  
  strong {
    font-weight: 600;
    color: #303133;
  }
  
  em {
    font-style: italic;
    color: #606266;
  }
  
  ul, ol {
    margin: 8px 0;
    padding-left: 20px;
  }
  
  li {
    margin: 4px 0;
    line-height: 1.5;
  }
  
  blockquote {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid #409eff;
    background-color: #f0f9ff;
    color: #606266;
    border-radius: 0 8px 8px 0;
  }
  
  code {
    background-color: #f5f7fa;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 13px;
    color: #e6a23c;
  }
  
  pre {
    background-color: #f5f7fa;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;
    border: 1px solid #e4e7ed;
    
    code {
      background-color: transparent;
      padding: 0;
      color: #303133;
    }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    
    th, td {
      border: 1px solid #e4e7ed;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background-color: #f5f7fa;
      font-weight: 600;
    }
  }
  
  .streaming-indicator {
    display: inline-block;
    animation: blink 1s infinite;
    color: #409eff;
    font-weight: bold;
  }
}

.message.user .message-text {
  color: #303133;
}

.message.assistant .message-text {
  color: #606266;
}

.message .message-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}

.message.user .message-actions {
  justify-content: flex-end;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
  color: #909399;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 20px;
  color: #303133;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 16px;
  color: #c0c4cc;
  margin-bottom: 20px;
  text-align: center;
}

.suggested-questions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #e4e7ed;
}

.suggested-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  font-weight: 500;
  color: #409eff;
  border: 1px solid #dcdfe6;
  background-color: #ecf5ff;
}

.question-tag:hover {
  background-color: #e1f3d8;
  border-color: #67c23a;
  color: #67c23a;
}

.input-area {
  padding: 16px 20px;
  background-color: #f5f7fa;
  border-top: 1px solid #e4e7ed;
  border-radius: 0 0 8px 8px;
  flex-shrink: 0;
}

.input-area .chat-input {
  width: 100%;
}

.input-area .chat-input .el-input__inner {
  border-radius: 20px;
  padding: 10px 15px;
  border: 1px solid #dcdfe6;
  font-size: 14px;
}

.input-area .chat-input .el-input__inner:focus {
  border-color: #409eff;
}

.input-area .send-button {
  border-radius: 20px;
  padding: 10px 20px;
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
}

.input-area .send-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  color: white;
}

.input-area .send-button:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
  color: white;
}

.input-area .send-button:disabled {
  background-color: #c0c4cc;
  border-color: #c0c4cc;
  color: white;
  cursor: not-allowed;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 卡片内容区域样式 */
.card-content {
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  margin-top: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.card-content:hover {
  background-color: #f0f9ff;
  border-color: #b3d8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.card-content:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.welcome-section {
  text-align: center;
  margin-bottom: 24px;
  padding-top: 20px;
}

.welcome-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.welcome-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.suggested-section {
  border-top: 1px solid #e4e7ed;
  padding-top: 20px;
}

.suggested-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  text-align: center;
}

.suggested-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.suggested-tag {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  color: #409eff;
  border: 1px solid #dcdfe6;
  background-color: #ecf5ff;
}

.suggested-tag:hover {
  background-color: #e1f3d8;
  border-color: #67c23a;
  color: #67c23a;
  transform: translateY(-1px);
}

/* 智能助手对话框样式 */
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style> 