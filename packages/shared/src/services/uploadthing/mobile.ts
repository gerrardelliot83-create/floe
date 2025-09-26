import { UPLOADTHING_CONFIG } from './config';

export interface UploadResponse {
  url: string;
  key: string;
  name: string;
  size: number;
}

export interface UploadError {
  message: string;
  code?: string;
}

export class MobileUploadService {
  private token: string;
  private baseUrl = 'https://api.uploadthing.com';

  constructor(token?: string) {
    this.token = token || UPLOADTHING_CONFIG.token || '';
    if (!this.token) {
      throw new Error('UploadThing token is required');
    }
  }

  async uploadFile(
    file: {
      uri: string;
      type: string;
      name?: string;
    },
    endpoint: string
  ): Promise<UploadResponse> {
    try {
      // First, get the presigned URL
      const presignedResponse = await this.getPresignedUrl(file, endpoint);

      // Upload the file using the presigned URL
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name || `upload-${Date.now()}`,
      } as any);

      const uploadResponse = await fetch(presignedResponse.presignedUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Return the file info
      return {
        url: presignedResponse.url,
        key: presignedResponse.key,
        name: file.name || 'upload',
        size: 0, // Size not easily available in React Native
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  private async getPresignedUrl(
    file: { type: string; name?: string },
    endpoint: string
  ): Promise<{ presignedUrl: string; url: string; key: string }> {
    const response = await fetch(`${this.baseUrl}/api/uploadthing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        files: [{
          name: file.name || `upload-${Date.now()}`,
          type: file.type,
        }],
        routeSlug: endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get presigned URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0];
  }

  async uploadImage(imageUri: string, name?: string): Promise<UploadResponse> {
    return this.uploadFile(
      {
        uri: imageUri,
        type: 'image/jpeg',
        name: name || `image-${Date.now()}.jpg`,
      },
      UPLOADTHING_CONFIG.endpoints.imageUpload
    );
  }

  async uploadDocument(documentUri: string, name?: string): Promise<UploadResponse> {
    return this.uploadFile(
      {
        uri: documentUri,
        type: 'application/pdf',
        name: name || `document-${Date.now()}.pdf`,
      },
      UPLOADTHING_CONFIG.endpoints.documentUpload
    );
  }

  async uploadAudio(audioUri: string, name?: string): Promise<UploadResponse> {
    return this.uploadFile(
      {
        uri: audioUri,
        type: 'audio/m4a',
        name: name || `audio-${Date.now()}.m4a`,
      },
      UPLOADTHING_CONFIG.endpoints.audioUpload
    );
  }

  async uploadVideo(videoUri: string, name?: string): Promise<UploadResponse> {
    return this.uploadFile(
      {
        uri: videoUri,
        type: 'video/mp4',
        name: name || `video-${Date.now()}.mp4`,
      },
      UPLOADTHING_CONFIG.endpoints.videoUpload
    );
  }

  // Delete file
  async deleteFile(key: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/deleteFile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({ fileKeys: [key] }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }
  }
}