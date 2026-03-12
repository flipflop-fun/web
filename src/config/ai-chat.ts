/**
 * FlipFlop AI Chat 配置
 *
 * 配置连接到 flipflop-ai-support Vercel 部署的 API
 */

export const AI_CHAT_CONFIG = {
  // API 服务地址（部署后的 Vercel URL）
  apiUrl: process.env.REACT_APP_AI_CHAT_API_URL || 'https://flipflop-ai-support.vercel.app',

  // API 密钥（当前未设置，如果 Vercel 配置了 API_CLIENT_KEY 则需要填写）
  apiKey: process.env.REACT_APP_AI_CHAT_API_KEY,

  // 是否启用本地存储历史消息
  enableLocalStorage: true,

  // 本地存储键名
  storageKey: 'flipflop-ai-messages',

  // 最大历史消息数
  maxMessagesInHistory: 50,

  // API 端点路径
  chatEndpoint: '/api/chat',
} as const;
