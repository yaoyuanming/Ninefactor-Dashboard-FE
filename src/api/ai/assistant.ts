import { fetchEventSource } from '@microsoft/fetch-event-source'

// 智能助手API基础配置
const API_BASE_URL = 'https://ai-base.theninefactor.com'
const API_TOKEN = 'sk-a56ed39db6294f95a970e7de34fb5e22'
const MODEL_ID = '0fb3fd60b5b346829ef707041b10bd47'

// 创建新会话，返回会话 ID（从 msg 字段读取）
export async function createSession(name: string = 'assistant', isTemporary: number = 0): Promise<string> {
  const resp = await fetch(`${API_BASE_URL}/dashscope/openApi/v1/dash/createSession`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Open-Api-Token': `Bearer ${API_TOKEN}`,
      'clientid': 'e5cd7e4891bf95d1d19206ce24a7b32e'
    },
    body: JSON.stringify({ name, isTemporary })
  })

  if (!resp.ok) {
    let text = ''
    try { text = await resp.text() } catch {}
    throw new Error(`createSession failed: ${resp.status}${text ? ' - ' + text : ''}`)
  }

  const json = await resp.json().catch(() => ({} as any))
  const sessionId = json?.msg || ''
  if (!sessionId) {
    throw new Error('createSession failed: empty session id')
  }
  return sessionId
}

// 与智能体对话 - SSE流式接口
export function chatWithAgent(aiSessionId: string, userText: string, onMessage: (data: any) => void, onError: (error: any) => void, onComplete: () => void) {
  // 发送POST请求数据
  const postData = {
    aiSessionId: aiSessionId,
    aiMessageId: "",
    creatorId: "1",
    userText: userText,
    medias: [],
    enableVectorStore: false,
    model: MODEL_ID,
    modelScope: "dashscope",
    historySize: 30,
    embeddingSearchDTO: {
      query: "",
      userId: "2",
      documentIndexIds: ["安全相关知识库"],
      fileNames: []
    }
  }

  // 使用fetchEventSource处理SSE流
  fetchEventSource(`${API_BASE_URL}/dashscope/openApi/v1/dash/chatWithAgent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Open-Api-Token': `Bearer ${API_TOKEN}`,
      'clientid': 'e5cd7e4891bf95d1d19206ce24a7b32e'
    },
    body: JSON.stringify(postData),
    openWhenHidden: true,
    
    onopen: async (response) => {
      if (response.status !== 200) {
        throw new Error(`Server error: ${response.status}`);
      }
    },
    
    onmessage: (event) => {
      try {
        const eventType = event.event
        const data = event.data
        
        switch (eventType) {
          case 'node':
            // 处理流式文本片段
            try {
              const parsed = JSON.parse(data)
              if (parsed.text !== undefined && typeof parsed.text === 'string') {
                onMessage({
                  type: 'node',
                  text: parsed.text,
                  nodeName: parsed.nodeName || '',
                  model: parsed.model || ''
                })
              }
            } catch (e) {
              // 静默处理解析错误
            }
            break
            
          case 'end_node':
            // 处理结束节点事件
            try {
              const parsed = JSON.parse(data)
              if (parsed.text !== undefined && typeof parsed.text === 'string') {
                onMessage({
                  type: 'end_node',
                  text: parsed.text,
                  nodeName: parsed.nodeName || '',
                  model: parsed.model || ''
                })
              }
            } catch (e) {
              // 静默处理解析错误
            }
            break
            
          case 'complete':
            // 处理完成事件
            onComplete()
            break
            
          default:
            // 忽略未知事件类型
            break
        }
      } catch (err) {
        onError(err)
      }
    },
    
    onerror: (err) => {
      onError(err)
      if (err) {
        throw err // rethrow to stop the operation
      }
    },
    
    onclose: () => {
      onComplete()
    },
  })
} 