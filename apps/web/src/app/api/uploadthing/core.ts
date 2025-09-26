import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

const f = createUploadthing();

// Auth function - check if user is authenticated
const auth = async (_req: Request) => {
  // TODO: Implement actual auth check with Supabase
  // For now, return a mock user ID
  return { id: 'user-123' };
};

export const ourFileRouter = {
  // Image uploads - for screenshots, photos, etc.
  imageUpload: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Image upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Document uploads - PDFs, text files, etc.
  documentUpload: f({
    pdf: { maxFileSize: '16MB' },
    text: { maxFileSize: '1MB' },
    'application/msword': { maxFileSize: '10MB' },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxFileSize: '10MB' },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Document upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Audio uploads - voice notes, music, etc.
  audioUpload: f({
    audio: {
      maxFileSize: '32MB',
      maxFileCount: 3,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Audio upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),

  // Video uploads - screen recordings, etc.
  videoUpload: f({
    video: {
      maxFileSize: '64MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Video upload complete for userId:', metadata.userId);
      console.log('File URL:', file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;