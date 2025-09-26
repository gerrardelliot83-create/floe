export * from './config';
export * from './mobile';

// Utility function to detect file type from extension
export const getFileType = (filename: string): 'image' | 'document' | 'audio' | 'video' | 'unknown' => {
  const extension = filename.toLowerCase().split('.').pop();

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const documentExts = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac'];
  const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

  if (extension && imageExts.includes(extension)) return 'image';
  if (extension && documentExts.includes(extension)) return 'document';
  if (extension && audioExts.includes(extension)) return 'audio';
  if (extension && videoExts.includes(extension)) return 'video';

  return 'unknown';
};

// File size formatter
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};