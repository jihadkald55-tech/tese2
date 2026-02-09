'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Save,
  Download,
  Share2,
  Sparkles,
  Eye,
  Settings,
  MoreVertical,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  ArrowRight,
  Check,
  ChevronDown,
  FileDown
} from 'lucide-react'
import AIAssistant from '@/components/AIAssistant'
import jsPDF from 'jspdf'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'
import { useNotifications } from '@/contexts/NotificationContext'

export default function ResearchPage() {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [content, setContent] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [selectedText, setSelectedText] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSavedNotification, setShowSavedNotification] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const downloadMenuRef = useRef<HTMLDivElement>(null)

  // تحميل المحتوى المحفوظ عند بدء الصفحة
  useEffect(() => {
    const savedResearch = localStorage.getItem('currentResearch')
    if (savedResearch) {
      try {
        const data = JSON.parse(savedResearch)
        setContent(data.content || '')
        setWordCount(data.content?.trim().split(/\s+/).filter(Boolean).length || 0)
        setLastSaved(data.lastSaved ? new Date(data.lastSaved) : null)
      } catch (error) {
        console.error('Error loading research:', error)
      }
    }
  }, [])

  // إغلاق قائمة التحميل عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSave = useCallback((silent = false) => {
    if (!silent) setIsSaving(true)
    
    const researchData = {
      title: 'تطبيقات الذكاء الاصطناعي في التعليم',
      content: content,
      wordCount: wordCount,
      lastSaved: new Date().toISOString()
    }
    
    localStorage.setItem('currentResearch', JSON.stringify(researchData))
    setLastSaved(new Date())
    
    if (!silent) {
      setTimeout(() => {
        setIsSaving(false)
        setShowSavedNotification(true)
        setTimeout(() => setShowSavedNotification(false), 2000)
        
        // إضافة إشعار
        addNotification({
          type: 'research',
          title: 'تم حفظ البحث',
          message: `تم حفظ بحثك بنجاح (${wordCount} كلمة)`,
          link: '/dashboard/research'
        })
      }, 500)
    }
  }, [content, wordCount])

  // حفظ تلقائي كل 30 ثانية
  useEffect(() => {
    if (!content) return
    
    const autoSaveInterval = setInterval(() => {
      handleSave(true) // حفظ صامت
    }, 30000) // 30 ثانية

    return () => clearInterval(autoSaveInterval)
  }, [content, handleSave])

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'بحثي.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setShowDownloadMenu(false)
  }

  const handleDownloadPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // إضافة خط يدعم العربية (سنستخدم خط افتراضي)
      doc.setFont('helvetica')
      doc.setFontSize(12)
      
      // تقسيم النص إلى أسطر
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - (2 * margin)
      const lineHeight = 7
      let yPosition = margin

      // إضافة العنوان
      doc.setFontSize(16)
      doc.text('تطبيقات الذكاء الاصطناعي في التعليم', pageWidth / 2, yPosition, { align: 'center' })
      yPosition += lineHeight * 2

      // إضافة المحتوى
      doc.setFontSize(12)
      const lines = content.split('\n')
      
      for (const line of lines) {
        if (yPosition > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
        
        const wrappedLines = doc.splitTextToSize(line || ' ', maxWidth)
        for (const wrappedLine of wrappedLines) {
          if (yPosition > pageHeight - margin) {
            doc.addPage()
            yPosition = margin
          }
          doc.text(wrappedLine, margin, yPosition, { align: 'right' })
          yPosition += lineHeight
        }
      }

      doc.save('بحثي.pdf')
      setShowDownloadMenu(false)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('حدث خطأ أثناء إنشاء ملف PDF')
    }
  }

  const handleDownloadDocx = async () => {
    try {
      const paragraphs = content.split('\n').map(line => 
        new Paragraph({
          children: [
            new TextRun({
              text: line || ' ',
              font: 'Arial',
              size: 24, // 12pt
              rightToLeft: true
            })
          ],
          bidirectional: true,
          alignment: 'right'
        })
      )

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 720,
                right: 720,
                bottom: 720,
                left: 720
              }
            }
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'تطبيقات الذكاء الاصطناعي في التعليم',
                  font: 'Arial',
                  size: 32, // 16pt
                  bold: true,
                  rightToLeft: true
                })
              ],
              bidirectional: true,
              alignment: 'center',
              spacing: {
                after: 400
              }
            }),
            ...paragraphs
          ]
        }]
      })

      const blob = await Packer.toBlob(doc)
      saveAs(blob, 'بحثي.docx')
      setShowDownloadMenu(false)
    } catch (error) {
      console.error('Error generating DOCX:', error)
      alert('حدث خطأ أثناء إنشاء ملف Word')
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length)
  }

  const handleTextSelection = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const selected = content.substring(start, end)
      if (selected.trim()) {
        setSelectedText(selected)
      }
    }
  }

  const handleApplySuggestion = (aiText: string) => {
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    
    // If text is selected, replace it
    if (start !== end) {
      const newContent = content.substring(0, start) + aiText + content.substring(end)
      setContent(newContent)
      setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length)
    } else {
      // If no selection, append at current cursor position
      const newContent = content.substring(0, start) + aiText + content.substring(start)
      setContent(newContent)
      setWordCount(newContent.trim().split(/\s+/).filter(Boolean).length)
    }
    
    setSelectedText('')
  }

  const toolbarButtons = [
    { icon: Bold, label: 'غامق' },
    { icon: Italic, label: 'مائل' },
    { icon: List, label: 'قائمة' },
    { icon: ListOrdered, label: 'قائمة مرقمة' },
    { icon: Quote, label: 'اقتباس' },
    { icon: Code, label: 'كود' }
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 dark:text-dark-muted hover:text-medad-primary dark:hover:text-primary-400 transition-colors"
      >
        <ArrowRight className="w-5 h-5" />
        <span>رجوع</span>
      </button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medad-ink dark:text-dark-text mb-2">
            تطبيقات الذكاء الاصطناعي في التعليم
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-600 dark:text-dark-muted">
              {lastSaved 
                ? `آخر حفظ: ${lastSaved.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`
                : 'لم يتم الحفظ بعد'}
            </p>
            <AnimatePresence>
              {showSavedNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>تم الحفظ</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative" ref={downloadMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span>تحميل</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {showDownloadMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-2 w-48 bg-white dark:bg-dark-card rounded-lg shadow-lg border border-medad-border dark:border-dark-border overflow-hidden z-10"
                >
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full px-4 py-3 text-right hover:bg-medad-hover dark:hover:bg-dark-hover transition-colors flex items-center gap-3"
                  >
                    <FileDown className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="font-medium text-medad-ink dark:text-dark-text">ملف PDF</div>
                      <div className="text-xs text-gray-500 dark:text-dark-muted">صيغة احترافية</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleDownloadDocx}
                    className="w-full px-4 py-3 text-right hover:bg-medad-hover dark:hover:bg-dark-hover transition-colors flex items-center gap-3 border-t border-medad-border dark:border-dark-border"
                  >
                    <FileDown className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-medad-ink dark:text-dark-text">ملف Word</div>
                      <div className="text-xs text-gray-500 dark:text-dark-muted">قابل للتحرير</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="w-full px-4 py-3 text-right hover:bg-medad-hover dark:hover:bg-dark-hover transition-colors flex items-center gap-3 border-t border-medad-border dark:border-dark-border"
                  >
                    <FileDown className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium text-medad-ink dark:text-dark-text">ملف نصي</div>
                      <div className="text-xs text-gray-500 dark:text-dark-muted">نص بسيط</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="btn-primary flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Save className="w-5 h-5" />
                </motion.div>
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>حفظ</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Toolbar */}
          <div className="card p-4">
            <div className="flex items-center gap-2 flex-wrap">
              {toolbarButtons.map((btn, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-medad-hover dark:hover:bg-dark-hover rounded-lg transition-colors"
                  title={btn.label}
                >
                  <btn.icon className="w-5 h-5 text-gray-600 dark:text-dark-text" />
                </motion.button>
              ))}
              <div className="h-6 w-px bg-medad-border dark:bg-dark-border mx-2"></div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">مساعد الذكاء</span>
              </motion.button>
            </div>
          </div>

          {/* Editor */}
          <div className="card p-8 min-h-[600px]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              onSelect={handleTextSelection}
              onMouseUp={handleTextSelection}
              placeholder="ابدأ الكتابة هنا... حدد أي نص واستخدم المساعد الذكي للحصول على اقتراحات وتحسينات."
              className="w-full h-full min-h-[500px] outline-none resize-none text-lg leading-relaxed text-medad-ink dark:text-dark-text bg-transparent placeholder:text-gray-400 dark:placeholder:text-dark-muted"
              dir="rtl"
            />
          </div>

          {/* Stats Bar */}
          <div className="card p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <span className="text-gray-600 dark:text-dark-muted">
                  <strong className="text-medad-ink dark:text-dark-text">{wordCount}</strong> كلمة
                </span>
                <span className="text-gray-600 dark:text-dark-muted">
                  <strong className="text-medad-ink dark:text-dark-text">{content.length}</strong> حرف
                </span>
                <span className="text-gray-600 dark:text-dark-muted">
                  وقت القراءة: <strong className="text-medad-ink dark:text-dark-text">{Math.ceil(wordCount / 200)}</strong> دقيقة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-dark-muted">تم الحفظ تلقائياً</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Sources & AI */}
        <div className="space-y-4">
          {/* AI Assistant Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-primary-200 dark:border-primary-800/30"
          >
            <AIAssistant 
              selectedText={selectedText} 
              onApplySuggestion={handleApplySuggestion}
            />
          </motion.div>

          {/* Quick Sources */}
          <div className="card p-6">
            <h3 className="font-bold text-medad-ink dark:text-dark-text mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              مصادر سريعة
            </h3>
            <div className="space-y-3">
              {[
                { title: 'الذكاء الاصطناعي في التعليم.pdf', pages: '245 صفحة' },
                { title: 'Machine Learning Basics.pdf', pages: '180 صفحة' },
                { title: 'دراسة تطبيقية.docx', pages: '45 صفحة' }
              ].map((source, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 5 }}
                  className="p-3 bg-medad-paper dark:bg-dark-hover hover:bg-medad-hover dark:hover:bg-dark-border rounded-lg transition-all cursor-pointer border border-medad-border dark:border-dark-border"
                >
                  <p className="font-medium text-sm text-medad-ink dark:text-dark-text mb-1">{source.title}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-muted">{source.pages}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chapter Progress */}
          <div className="card p-6">
            <h3 className="font-bold text-medad-ink dark:text-dark-text mb-4">تقدم الفصول</h3>
            <div className="space-y-3">
              {[
                { name: 'المقدمة', progress: 100 },
                { name: 'الإطار النظري', progress: 85 },
                { name: 'الدراسات السابقة', progress: 70 },
                { name: 'المنهجية', progress: 30 },
                { name: 'النتائج', progress: 0 }
              ].map((chapter, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-medad-ink dark:text-dark-text">{chapter.name}</span>
                    <span className="text-xs text-gray-600 dark:text-dark-muted">{chapter.progress}%</span>
                  </div>
                  <div className="h-2 bg-medad-paper dark:bg-dark-hover rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${chapter.progress}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${
                        chapter.progress === 100
                          ? 'bg-green-500'
                          : chapter.progress > 50
                          ? 'bg-primary-500'
                          : 'bg-orange-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
