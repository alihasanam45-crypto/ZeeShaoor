'use server'

import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import { getServerSession } from 'next-auth'

const URDU_TEMPLATES = {
  absent: {
    title: 'غیر حاضری',
    content: 'بچے کی غیر حاضری کے حوالے سے',
    icon: '⚠️',
  },
  lowMarks: {
    title: 'کم نمبر',
    content: 'حالیہ ٹیسٹ میں کم نمبر',
    icon: '📉',
  },
  emergency: {
    title: 'ہنگامی',
    content: 'ہنگامی اطلاع',
    icon: '🚨',
  },
  feeReminder: {
    title: 'فیس یاد دہانی',
    content: 'فیس جمع کرانے کی یاد دہانی',
    icon: '💰',
  },
  progressReport: {
    title: 'پیش رفت رپورٹ',
    content: 'بچے کی تعلیمی کارکردگی کی رپورٹ',
    icon: '📊',
  },
}

export type UrduTemplateKey = keyof typeof URDU_TEMPLATES

export async function getUrduTemplates() {
  return URDU_TEMPLATES
}

export interface SendMessageInput {
  teacherId: string
  classId: string
  subject?: string
  recipients: string[]
  content: string
  type: 'Urdu_Template' | 'Custom' | 'Emergency'
  scheduledFor?: string
  language?: 'urdu' | 'english'
}

/**
 * Creates a message record. If scheduledFor is set, status = 'Scheduled';
 * otherwise status = 'Sent' with sentAt = now.
 * In production, a Cron Job / BullMQ worker picks up Scheduled messages.
 */
export async function sendOrScheduleMessage(input: SendMessageInput) {
  await connectDB()

  const session = await getServerSession()
  if (!session?.user) throw new Error('Unauthorized')

  const scheduledDate = input.scheduledFor ? new Date(input.scheduledFor) : undefined
  const hasSchedule = !!scheduledDate

  if (scheduledDate && scheduledDate <= new Date()) {
    throw new Error('Scheduled time must be in the future')
  }

  const message = await Message.create({
    teacherId: input.teacherId,
    classId: input.classId,
    subject: input.subject,
    recipients: input.recipients,
    content: input.content,
    type: input.type,
    status: hasSchedule ? 'Scheduled' : 'Sent',
    scheduledFor: scheduledDate || undefined,
    sentAt: hasSchedule ? undefined : new Date(),
    readReceipts: [],
    language: input.language || 'urdu',
  })

  return message.toObject()
}

/**
 * Track a read receipt. Called when a parent opens/reads the message.
 */
export async function markAsRead(messageId: string, parentId: string) {
  await connectDB()

  const message = await Message.findById(messageId)
  if (!message) throw new Error('Message not found')

  const alreadyRead = message.readReceipts.some(
    (r) => r.parentId === parentId,
  )
  if (alreadyRead) return message.toObject()

  message.readReceipts.push({ parentId, readAt: new Date() })

  // Update status to Read if all recipients have read it
  const allRecipients = message.recipients.length
  const readCount = message.readReceipts.length
  if (readCount >= allRecipients) {
    message.status = 'Read'
  } else {
    message.status = 'Delivered'
  }

  await message.save()
  return message.toObject()
}

/**
 * Cron worker simulator: picks up all Scheduled messages past their time
 * and marks them as Sent. In production, call this from a Vercel Cron Job.
 */
export async function dispatchScheduledMessages() {
  await connectDB()

  const now = new Date()
  const due = await Message.find({
    status: 'Scheduled',
    scheduledFor: { $lte: now },
  })

  let dispatched = 0
  for (const msg of due) {
    msg.status = 'Sent'
    msg.sentAt = now
    await msg.save()
    dispatched++
  }

  console.log(`[MessageDispatch] ${dispatched} messages dispatched at ${now.toISOString()}`)
  return dispatched
}
