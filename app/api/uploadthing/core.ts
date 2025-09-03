import { createUploadthing, type FileRouter } from "uploadthing/next";
import { createClient } from '@/lib/supabase/server';

const f = createUploadthing();

export const ourFileRouter = {
  // Background image uploader
  backgroundUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // Check if user is authenticated
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Unauthorized");
      
      // Check if user is admin (you can modify this check)
      const isAdmin = user.email?.endsWith('@getfloe.app');
      if (!isAdmin) throw new Error("Only admins can upload backgrounds");
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Background uploaded by user", metadata.userId);
      console.log("File URL:", file.url);
      
      // Here you would save to Supabase
      // const supabase = await createClient();
      // await supabase.from('backgrounds').insert({
      //   url: file.url,
      //   uploaded_by: metadata.userId,
      //   title: file.name,
      //   active: true
      // });
      
      return { uploadedBy: metadata.userId };
    }),
    
  // Profile avatar uploader
  avatarUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Unauthorized");
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar uploaded by user", metadata.userId);
      console.log("File URL:", file.url);
      
      // Update user profile with avatar URL
      // const supabase = await createClient();
      // await supabase.from('profiles').update({
      //   avatar_url: file.url
      // }).eq('id', metadata.userId);
      
      return { uploadedBy: metadata.userId };
    }),
    
  // Task attachment uploader
  taskFileUploader: f({ 
    image: { maxFileSize: "4MB" },
    pdf: { maxFileSize: "8MB" },
    text: { maxFileSize: "1MB" }
  })
    .middleware(async ({ req }) => {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Unauthorized");
      
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Task file uploaded by user", metadata.userId);
      console.log("File URL:", file.url);
      
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;