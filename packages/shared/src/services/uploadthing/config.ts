export const UPLOADTHING_CONFIG = {
  token: process.env.UPLOADTHING_TOKEN ||
         process.env.NEXT_PUBLIC_UPLOADTHING_TOKEN ||
         process.env.EXPO_PUBLIC_UPLOADTHING_TOKEN,

  endpoints: {
    imageUpload: 'imageUpload',
    documentUpload: 'documentUpload',
    audioUpload: 'audioUpload',
    videoUpload: 'videoUpload',
  },

  limits: {
    maxFileSize: '32MB',
    maxFiles: 10,
    allowedTypes: {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'],
      video: ['video/mp4', 'video/webm', 'video/mov', 'video/avi'],
    }
  }
};