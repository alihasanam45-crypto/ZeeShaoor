export type MediaType = 'image' | 'video' | 'audio' | 'document' | 'other'

const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const videoTypes = ['video/mp4', 'video/webm', 'video/ogg']
const audioTypes = ['audio/mpeg', 'audio/ogg', 'audio/wav']
const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

export function getFileType(mimeType: string): MediaType {
  if (imageTypes.includes(mimeType)) return 'image'
  if (videoTypes.includes(mimeType)) return 'video'
  if (audioTypes.includes(mimeType)) return 'audio'
  if (documentTypes.includes(mimeType)) return 'document'
  return 'other'
}

export function isValidImageType(mimeType: string): boolean {
  return imageTypes.includes(mimeType)
}

export function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}
