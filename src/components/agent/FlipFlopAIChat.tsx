"use client"
import { useEffect, useRef, useState } from "react";
import MarkdownWithMath from "./MarkdownWithMath";
import { LuLightbulb, LuLightbulbOff, LuSend, LuMessageSquare } from "react-icons/lu";
import { FAQSelector } from "./FAQSelector";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AI_CHAT_CONFIG } from "../../config/ai-chat";
import { getFAQsByLang, type FAQCategory } from "../../data/faq-data";

// 消息类型定义
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: 'faq' | 'llm' | 'operation_faq';
  similarity?: number;
  faqId?: string;
  timestamp: number;
}

export const FlipFlopAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [faqs, setFaqs] = useState<FAQCategory[] | null>(null);

  const { t, i18n } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 调试：打印配置信息
  useEffect(() => {
    console.log('AI Chat Config:', {
      apiUrl: AI_CHAT_CONFIG.apiUrl,
      chatEndpoint: AI_CHAT_CONFIG.chatEndpoint,
      fullUrl: `${AI_CHAT_CONFIG.apiUrl}${AI_CHAT_CONFIG.chatEndpoint}`,
      hasApiKey: !!AI_CHAT_CONFIG.apiKey,
    });
  }, []);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // 当有新消息时滚动到底部
  useEffect(() => {
    // 只在有新消息时才滚动（消息数量变化时）
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // 从本地存储加载消息历史
  useEffect(() => {
    const saved = localStorage.getItem(AI_CHAT_CONFIG.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (error) {
        console.error("Failed to parse saved messages:", error);
      }
    }
  }, []);

  // 保存消息到本地存储
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(AI_CHAT_CONFIG.storageKey, JSON.stringify(messages));
    }
  }, [messages]);

  // 从本地数据加载 FAQ（根据当前语言）
  useEffect(() => {
    const currentLang = i18n.language || 'zh-CN';
    const faqData = getFAQsByLang(currentLang);
    setFaqs(faqData);
  }, [i18n.language]);

  // 发送消息到 API
  const sendMessage = async (content: string, source?: Message['source'], faqId?: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      source,
      faqId,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue("");

    try {
      const fullUrl = `${AI_CHAT_CONFIG.apiUrl}${AI_CHAT_CONFIG.chatEndpoint}`;
      console.log('Fetching AI chat:', fullUrl);

      const requestBody = {
        messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
      };
      console.log('Request body:', requestBody);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(AI_CHAT_CONFIG.apiKey && { 'x-api-key': AI_CHAT_CONFIG.apiKey }),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      console.log('Starting to read stream...');
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantMessage: Message | null = null;
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('Stream done. Total chunks:', chunkCount);
          console.log('Final content length:', assistantContent.length);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        chunkCount++;
        console.log(`Chunk ${chunkCount}:`, chunk.substring(0, 200));

        const lines = chunk.split('\n');
        console.log('Lines in chunk:', lines.length);

        for (const line of lines) {
          if (!line.trim()) continue; // 跳过空行
          console.log('Processing line:', line.substring(0, 100));

          // 处理通义千问 SSE 格式
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            console.log('SSE data:', data.substring(0, 100));
            if (data === '[DONE]') {
              console.log('Received [DONE]');
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              console.log('Parsed data:', parsed);

              // 支持多种格式：
              // 1. 通义千问格式: {output: {choices: [{message: {content: "..."}}]}}
              // 2. 简化格式: {content: "..."}
              let content = '';
              let source = parsed.source;
              let similarity = parsed.similarity;

              if (parsed.output?.choices?.[0]?.message?.content) {
                content = parsed.output.choices[0].message.content;
              } else if (parsed.content) {
                content = parsed.content;
              }

              if (content) {
                assistantContent += content;
                console.log('Accumulated content:', assistantContent.substring(0, 100));

                // 更新或创建助手消息
                if (!assistantMessage) {
                  const newMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: assistantContent,
                    source: source,
                    similarity: similarity,
                    timestamp: Date.now(),
                  };
                  assistantMessage = newMessage;
                  console.log('Creating new message:', newMessage);
                  setMessages(prev => [...prev, newMessage]);
                } else {
                  // 使用临时变量来避免 null 检查问题
                  const currentMsgId = assistantMessage.id;
                  setMessages(prev => prev.map(msg =>
                    msg.id === currentMsgId
                      ? { ...msg, content: assistantContent }
                      : msg
                  ));
                }
              } else {
                console.log('No content in parsed data:', parsed);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e, 'Data was:', data);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('aiChat.error') || 'Sorry, I encountered an error. Please try again.');

      // 添加错误消息
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('aiChat.error') || 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // FAQ 选择处理
  useEffect(() => {
    if (inputValue && isFAQOpen) {
      sendMessage(inputValue, 'faq');
      setInputValue("");
      setIsFAQOpen(false);
    }
  }, [inputValue, isFAQOpen]);

  // 获取来源标签
  const getSourceLabel = (message: Message) => {
    if (message.source === 'operation_faq') {
      return <span className="text-xs text-green-600 mr-2">⚡ {t('aiChat.quickGuide')}</span>;
    }
    if (message.source === 'faq') {
      return <span className="text-xs text-blue-600 mr-2">✓ {t('aiChat.fromFAQ')}</span>;
    }
    return null;
  };

  // 用户消息组件
  const UserMessage = ({ message }: { message: Message }) => (
    <div className="flex items-center gap-2 justify-end mb-4">
      <div className="bg-green-500 text-white py-2 px-4 rounded-xl break-words flex-shrink-0 max-w-[80%]">
        {message.content}
      </div>
    </div>
  );

  // 助手消息组件
  const AssistantMessage = ({ message }: { message: Message }) => (
    <div className="py-2">
      <div className="flex items-start">
        <div className="bg-gray-100 px-4 rounded-xl py-2 text-sm md:text-md">
          {getSourceLabel(message)}
          <MarkdownWithMath content={message.content} />
        </div>
      </div>
    </div>
  );

  // 关闭状态：浮动按钮
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label={t('aiChat.open') || 'Open AI Chat'}
        >
          <LuMessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  // 打开状态：侧边栏聊天界面
  return (
    <div className="fixed inset-0 z-50">
      {/* 点击外部关闭的遮罩层 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setIsOpen(false)}
      />

      {/* 侧边栏 */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl flex flex-col z-50">
        {/* 头部 */}
        <div className="flex justify-between items-center p-4 border-b mt-16">
          <h2 className="text-lg font-semibold">{t('aiChat.title') || 'FlipFlop AI Assistant'}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label={t('aiChat.close') || 'Close'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 消息区域 / FAQ 面板 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* FAQ 面板 - 占据整个消息区域 */}
          {isFAQOpen && faqs ? (
            <div className="flex-1 overflow-hidden">
              <FAQSelector
                faqs={faqs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setPrompt={(value) => {
                  setInputValue(value);
                  setIsFAQOpen(false);
                  sendMessage(value, 'faq');
                }}
                onClose={() => setIsFAQOpen(false)}
              />
            </div>
          ) : (
            // 消息列表
            <div className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <p className="mb-2">👋</p>
                  <p>{t('aiChat.placeholder') || '请输入关于 FlipFlop 的问题...'}</p>
                </div>
              )}

              {messages.map((message) => (
                message.role === 'user' ? (
                  <UserMessage key={message.id} message={message} />
                ) : (
                  <AssistantMessage key={message.id} message={message} />
                )
              ))}

              {isLoading && (
                <div className="py-2">
                  <div className="bg-gray-100 px-4 rounded-xl py-2 text-sm md:text-md inline-block">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div className="border-t p-4 bg-white">

          {/* 输入框 */}
          <div className="flex gap-2">
            <button
              disabled={isLoading}
              className={`text-sm px-3 py-2 rounded-md transition-colors ${
                isFAQOpen
                  ? 'bg-green-500 text-white'
                  : 'bg-white border-[1px] border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setIsFAQOpen(!isFAQOpen)}
              title={isFAQOpen ? (t('aiChat.closeFAQ') || 'Close FAQ') : (t('aiChat.openFAQ') || 'Open FAQ')}
            >
              {isFAQOpen ? <LuLightbulbOff className="w-4 h-4" /> : <LuLightbulb className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  sendMessage(inputValue);
                }
              }}
              disabled={isLoading}
              placeholder={t('placeholder.copilotKitAskYourQuestion') || '请输入问题...'}
              className="flex-1 text-sm p-2 rounded-md border border-gray-300 focus:outline-none focus:border-green-500 disabled:bg-gray-100"
            />

            <button
              disabled={isLoading || !inputValue.trim()}
              onClick={() => sendMessage(inputValue)}
              className="text-sm px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <LuSend className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
