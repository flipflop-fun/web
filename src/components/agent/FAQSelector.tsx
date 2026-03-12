"use client"
import { useState, type FC, useEffect, useRef } from "react"
import { LuLightbulb, LuChevronRight, LuX } from "react-icons/lu"
import { useTranslation } from "react-i18next"
import { FAQCategory } from "../../data/faq-data"
import MarkdownWithMath from "./MarkdownWithMath"

type FAQSelectorProps = {
  faqs: FAQCategory[];
  activeTab: number;
  setActiveTab: (value: number) => void;
  setPrompt: (value: string) => void;
  onClose?: () => void;
}

export const FAQSelector: FC<FAQSelectorProps> = ({
  faqs,
  activeTab,
  setActiveTab,
  setPrompt,
  onClose
}) => {
  const { t } = useTranslation()
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // 选择问题
  const handleSelectQuestion = (question: string) => {
    setSelectedQuestion(question)
  }

  // 返回问题列表
  const handleBackToList = () => {
    setSelectedQuestion(null)
  }

  // 如果选择了问题，显示答案
  if (selectedQuestion) {
    const category = faqs[activeTab]
    const qa = category?.questions.find(q => q.question === selectedQuestion)

    return (
      <div ref={containerRef} className="h-full flex flex-col bg-white">
        {/* 头部 */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
          <button
            onClick={handleBackToList}
            className="p-2 hover:bg-gray-100 rounded-full mr-2 transition-colors"
            title={t('aiChat.back')}
          >
            <LuChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-sm font-semibold text-gray-700 truncate flex-1">
            {selectedQuestion}
          </span>
          <button
            onClick={() => {
              setPrompt(selectedQuestion)
              setSelectedQuestion(null)
            }}
            className="text-xs bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-full hover:from-green-600 hover:to-green-700 transition-all mr-2"
          >
            {t('aiChat.sendToChat')}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title={t('aiChat.close')}
            >
              <LuX className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* 答案内容 */}
        <div className="flex-1 overflow-y-auto p-5">
          {qa && (
            <div className="prose prose-sm max-w-none">
              <MarkdownWithMath content={qa.answer} />
            </div>
          )}
        </div>
      </div>
    )
  }

  // 显示问题列表
  const category = faqs[activeTab]

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-white">
      {/* 头部 - Tab 切换和关闭按钮 */}
      <div className="flex items-center bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
        {/* Tab 切换 */}
        <div className="flex flex-1">
          {faqs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                activeTab === index
                  ? 'text-green-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>
              {activeTab === index && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-blue-500"></div>
              )}
            </button>
          ))}
        </div>
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/50 transition-colors"
            title={t('aiChat.close')}
          >
            <LuX className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>

      {/* 问题列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {category?.questions.map((qa, index: number) => (
            <div
              key={qa.id}
              onClick={() => handleSelectQuestion(qa.question)}
              className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-green-50 hover:to-blue-50 p-4 rounded-xl cursor-pointer transition-all duration-200 border border-gray-200 hover:border-green-300 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 group-hover:text-green-700 transition-colors line-clamp-2">
                    {qa.question}
                  </h4>
                </div>
                <LuChevronRight className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部提示 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex-shrink-0">
        <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <LuLightbulb className="w-3 h-3 text-yellow-500" />
          {t('aiChat.clickToViewAnswer')}
        </p>
      </div>
    </div>
  )
}
