'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  XCircle,
  Wand2,
  RefreshCw,
  FileText,
  Maximize2,
  CheckCheck,
  Lightbulb,
  Copy,
  Check
} from 'lucide-react'

interface AIAssistantProps {
  selectedText: string
  onApplySuggestion: (text: string) => void
}

type AIAction = 'improve' | 'rephrase' | 'summarize' | 'expand' | 'grammar' | 'suggest'

export default function AIAssistant({ selectedText, onApplySuggestion }: AIAssistantProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [needsApiKey, setNeedsApiKey] = useState(false)

  const actions = [
    { id: 'improve', label: 'تحسين النص', icon: Wand2, color: 'from-blue-500 to-blue-600' },
    { id: 'rephrase', label: 'إعادة صياغة', icon: RefreshCw, color: 'from-purple-500 to-purple-600' },
    { id: 'summarize', label: 'تلخيص', icon: FileText, color: 'from-green-500 to-green-600' },
    { id: 'expand', label: 'توسيع الفكرة', icon: Maximize2, color: 'from-orange-500 to-orange-600' },
    { id: 'grammar', label: 'تصحيح لغوي', icon: CheckCheck, color: 'from-red-500 to-red-600' },
    { id: 'suggest', label: 'اقتراحات', icon: Lightbulb, color: 'from-yellow-500 to-yellow-600' }
  ] as const

  const handleAction = async (action: AIAction) => {
    if (!selectedText.trim()) {
      setError('الرجاء تحديد نص أولاً')
      setTimeout(() => setError(''), 3000)
      return
    }

    setIsLoading(true)
    setError('')
    setResult('')
    setNeedsApiKey(false)

    try {
      console.log('Sending request to AI assistant:', { action, textLength: selectedText.length })
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text: selectedText })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.success) {
        setResult(data.text)
      } else {
        if (data.needsApiKey) {
          setNeedsApiKey(true)
        }
        setError(data.error || 'حدث خطأ غير معروف')
      }
    } catch (err: any) {
      console.error('Frontend error:', err)
      setError('حدث خطأ في الاتصال بالمساعد الذكي: ' + (err.message || ''))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApply = () => {
    onApplySuggestion(result)
    setResult('')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-2 rounded-xl">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-bold text-medad-ink dark:text-dark-text">المساعد الذكي</h3>
      </div>

      {/* Selected Text Preview */}
      {selectedText && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-google">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">النص المحدد:</p>
          <p className="text-sm text-blue-900 dark:text-blue-300 line-clamp-3">
            {selectedText}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.id as AIAction)}
            disabled={isLoading || !selectedText}
            className={`flex items-center gap-2 p-3 rounded-google transition-all border
              ${!selectedText || isLoading
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border-gray-200 dark:border-gray-700'
                : 'bg-white dark:bg-dark-card hover:bg-gradient-to-r hover:' + action.color + ' hover:text-white border-medad-border dark:border-dark-border text-medad-ink dark:text-dark-text'
              }`}
          >
            <action.icon className="w-4 h-4" />
            <span className="text-xs font-medium">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Loading */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center justify-center gap-2 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-google"
          >
            <Loader2 className="w-5 h-5 animate-spin text-primary-600 dark:text-primary-400" />
            <span className="text-sm text-primary-600 dark:text-primary-400">جاري المعالجة...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-google"
          >
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              {needsApiKey && (
                <div className="mt-2 text-xs text-red-500 dark:text-red-400 space-y-1">
                  <p className="font-medium">للحصول على API Key مجاني:</p>
                  <ol className="list-decimal mr-4 space-y-1">
                    <li>اذهب إلى: <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></li>
                    <li>أنشئ API Key جديد</li>
                    <li>أضفه في ملف .env.local</li>
                    <li>أعد تشغيل الخادم</li>
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-google">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">النتيجة:</span>
              </div>
              <p className="text-sm text-green-900 dark:text-green-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </p>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleApply}
                className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                تطبيق
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="btn-secondary flex items-center justify-center gap-2 text-sm px-4"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'تم النسخ' : 'نسخ'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {!selectedText && !result && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-google">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            💡 حدد نصاً في المحرر واختر إجراء من الأعلى
          </p>
        </div>
      )}
    </div>
  )
}
