'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-dark-bg dark:to-dark-card">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 p-8"
      >
        <h1 className="text-6xl font-bold text-medad-ink dark:text-dark-text mb-4">
          مداد
          <span className="text-primary-600 dark:text-primary-400">.</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-dark-muted mb-8">
          نظام إدارة أبحاث التخرج
        </p>
        <Link 
          href="/login"
          className="btn-primary inline-block"
        >
          ابدأ الآن
        </Link>
      </motion.div>
    </div>
  )
}
