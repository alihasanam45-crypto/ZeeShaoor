'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PaperRenderer from '@/components/PaperRenderer'

export default function PaperPage() {
  const router = useRouter()
  const [paperData, setPaperData] = useState<any>(null)
  const [metadata, setMetadata] = useState<any>(null)

  useEffect(() => {
    // sessionStorage se data lo
    const data = sessionStorage.getItem('zeeshaoor_paper')
    if (!data) {
      // Agar data nahi hai toh generator pe wapas bhejo
      router.replace('/teacher/generator')
      return
    }
    const parsed = JSON.parse(data)
    setPaperData(parsed.paperData)
    setMetadata(parsed.metadata)
  }, [router])

  if (!paperData || !metadata) {
    return (
      <div style={{
        minHeight: '100vh', background: '#050505',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚙️</div>
          <p style={{ color: '#a855f7', fontWeight: '700', letterSpacing: '2px' }}>LOADING PAPER...</p>
        </div>
      </div>
    )
  }

  return (
    <PaperRenderer
      paperData={paperData}
      metadata={metadata}
    />
  )
}
