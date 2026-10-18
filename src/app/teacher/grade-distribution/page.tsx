'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Brain } from 'lucide-react'
import GradeDistribution from '@/components/teacher/GradeDistribution'

const C = {
  bg: '#f8f9fc', text: '#1f2937', textDim: 'rgba(31,41,55,0.55)',
  gradient: 'linear-gradient(135deg,#2563eb,#7c3aed)',
}

export default function GradeDistributionPage() {
  return (
    <div style={{
      minHeight: '100vh', background: C.bg, fontFamily: "'Inter',system-ui,sans-serif",
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 28 }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: C.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain color="white" size={20} />
          </div>
          Smart Grade Distribution
        </h1>
        <p style={{ color: C.textDim, fontSize: 14, marginTop: 4, marginLeft: 50 }}>
          Statistical analysis · Bell curve visualization · AI normalization engine
        </p>
      </motion.div>

      <GradeDistribution />
    </div>
  )
}
