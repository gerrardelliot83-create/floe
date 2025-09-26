import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Camera } from 'expo-camera';
import type { MediaFile, UploadProgress, ProcessingStatus } from '@floe/shared';

interface MediaUploadProps {
  onUpload?: (files: MediaFile[]) => void;
  onProgress?: (progress: UploadProgress) => void;
  onProcessingUpdate?: (status: ProcessingStatus) => void;
  maxSize?: number;
  disabled?: boolean;
  style?: any;
}

export function MediaUpload({
  onUpload,
  onProgress,
  onProcessingUpdate,
  maxSize = 10 * 1024 * 1024,
  disabled = false,
  style
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const requestPermissions = useCallback(async () => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
      Alert.alert('Permissions Required', 'Camera and media library permissions are needed to upload media.');
      return false;
    }

    return true;
  }, []);

  const handleCameraCapture = useCallback(async () => {
    if (disabled || uploading) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleSelectedMedia([result.assets[0]]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture media');
      console.error('Camera capture error:', error);
    }
  }, [disabled, uploading, requestPermissions]);

  const handleLibraryPicker = useCallback(async () => {
    if (disabled || uploading) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        await handleSelectedMedia(result.assets);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select media from library');
      console.error('Library picker error:', error);
    }
  }, [disabled, uploading, requestPermissions]);

  const handleDocumentPicker = useCallback(async () => {
    if (disabled || uploading) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        await handleSelectedMedia(result.assets);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select documents');
      console.error('Document picker error:', error);
    }
  }, [disabled, uploading]);

  const handleSelectedMedia = useCallback(async (assets: any[]) => {
    setUploading(true);

    try {
      const uploadedFiles: MediaFile[] = [];

      for (const asset of assets) {
        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert('File Too Large', `${asset.fileName || asset.uri} is too large (max ${Math.round(maxSize / (1024 * 1024))}MB)`);
          continue;
        }

        const mediaFile = await simulateNativeUpload(asset, {
          onProgress: (progress) => {
            setUploadProgress(progress);
            onProgress?.(progress);
          },
          onProcessingUpdate: (status) => {
            onProcessingUpdate?.(status);
          }
        });

        uploadedFiles.push(mediaFile);
      }

      if (uploadedFiles.length > 0) {
        onUpload?.(uploadedFiles);
      }
    } catch (error) {
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Unknown error');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  }, [maxSize, onUpload, onProgress, onProcessingUpdate]);

  const showUploadOptions = useCallback(() => {
    Alert.alert(
      'Upload Media',
      'Choose an option',
      [
        { text: 'Camera', onPress: handleCameraCapture },
        { text: 'Photo Library', onPress: handleLibraryPicker },
        { text: 'Documents', onPress: handleDocumentPicker },
        { text: 'Cancel', style: 'cancel' }
      ],
      { cancelable: true }
    );
  }, [handleCameraCapture, handleLibraryPicker, handleDocumentPicker]);

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.uploadButton,
          disabled && styles.disabled,
          uploading && styles.uploading
        ]}
        onPress={showUploadOptions}
        disabled={disabled || uploading}
        activeOpacity={0.7}
      >
        <View style={styles.uploadContent}>
          <Text style={styles.uploadIcon}>
            {uploading ? '◐' : '⊕'}
          </Text>

          <Text style={styles.uploadText}>
            {uploading ? 'Processing...' : 'Add Media'}
          </Text>

          <Text style={styles.uploadSubtext}>
            Photos, Videos, Documents
          </Text>

          {uploading && uploadProgress && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {Math.round(uploadProgress.percentage)}%
              </Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress.percentage}%` }
                  ]}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
}

interface MediaPreviewProps {
  file: MediaFile;
  onRemove?: () => void;
  style?: any;
}

export function MediaPreview({
  file,
  onRemove,
  style
}: MediaPreviewProps) {
  const isProcessing = file.processing.status === 'processing';
  const hasError = file.processing.status === 'failed';

  return (
    <View style={[styles.previewContainer, style]}>
      <View style={[
        styles.previewContent,
        hasError && styles.previewError
      ]}>
        {file.type === 'image' && (
          <Image
            source={{ uri: file.thumbnailUrl || file.url }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}

        {file.type === 'video' && (
          <View style={styles.videoPreview}>
            {file.thumbnailUrl ? (
              <Image
                source={{ uri: file.thumbnailUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcon}>▶</Text>
              </View>
            )}
            <View style={styles.videoLabel}>
              <Text style={styles.videoLabelText}>Video</Text>
            </View>
          </View>
        )}

        {file.type === 'audio' && (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>♪</Text>
          </View>
        )}

        {file.type === 'document' && (
          <View style={styles.placeholderContainer}>
            {file.thumbnailUrl ? (
              <Image
                source={{ uri: file.thumbnailUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.placeholderIcon}>📄</Text>
            )}
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingIcon}>◐</Text>
            <Text style={styles.processingText}>
              {file.processing.progress}%
            </Text>
          </View>
        )}

        {hasError && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>Failed</Text>
          </View>
        )}
      </View>

      <View style={styles.previewInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.name}
        </Text>

        <Text style={styles.fileSize}>
          {formatFileSize(file.size)}
        </Text>

        {file.extractedText && (
          <Text style={styles.extractedTextLabel}>
            Text detected
          </Text>
        )}
      </View>

      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          activeOpacity={0.7}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface MediaGalleryProps {
  files: MediaFile[];
  onRemove?: (fileId: string) => void;
  style?: any;
}

export function MediaGallery({
  files,
  onRemove,
  style
}: MediaGalleryProps) {
  if (files.length === 0) return null;

  return (
    <View style={[styles.gallery, style]}>
      {files.map((file, index) => (
        <MediaPreview
          key={file.id}
          file={file}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          style={[
            styles.galleryItem,
            index % 2 === 0 ? styles.galleryItemLeft : styles.galleryItemRight
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  disabled: {
    opacity: 0.5,
  },

  uploading: {
    backgroundColor: '#f9fafb',
  },

  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  uploadIcon: {
    fontSize: 24,
    marginBottom: 8,
    color: '#374151',
  },

  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },

  uploadSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },

  progressContainer: {
    marginTop: 16,
    alignItems: 'center',
  },

  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },

  progressBar: {
    width: 120,
    height: 2,
    backgroundColor: '#e5e7eb',
    borderRadius: 1,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#374151',
    borderRadius: 1,
  },

  previewContainer: {
    position: 'relative',
  },

  previewContent: {
    width: 120,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  previewError: {
    borderColor: '#ef4444',
  },

  previewImage: {
    width: '100%',
    height: '100%',
  },

  videoPreview: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  videoLabel: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  videoLabelText: {
    color: 'white',
    fontSize: 10,
  },

  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderIcon: {
    fontSize: 32,
    color: '#6b7280',
  },

  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  processingIcon: {
    fontSize: 24,
    color: '#374151',
    marginBottom: 4,
  },

  processingText: {
    fontSize: 12,
    color: '#6b7280',
  },

  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIcon: {
    fontSize: 24,
    color: '#ef4444',
    marginBottom: 4,
  },

  errorText: {
    fontSize: 12,
    color: '#ef4444',
  },

  previewInfo: {
    marginTop: 8,
  },

  fileName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },

  fileSize: {
    fontSize: 10,
    color: '#6b7280',
  },

  extractedTextLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },

  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 18,
  },

  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },

  galleryItem: {
    marginHorizontal: 8,
    marginBottom: 16,
  },

  galleryItemLeft: {
    alignSelf: 'flex-start',
  },

  galleryItemRight: {
    alignSelf: 'flex-end',
  },
});

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

async function simulateNativeUpload(
  asset: any,
  options: {
    onProgress?: (progress: UploadProgress) => void;
    onProcessingUpdate?: (status: ProcessingStatus) => void;
  }
): Promise<MediaFile> {
  const mediaFile: MediaFile = {
    id: crypto.randomUUID(),
    name: asset.fileName || asset.name || 'Unknown',
    type: getMediaType(asset.mimeType || asset.type || ''),
    mimeType: asset.mimeType || asset.type || 'application/octet-stream',
    size: asset.fileSize || asset.size || 0,
    url: asset.uri,
    metadata: {
      originalName: asset.fileName || asset.name || 'Unknown',
      uploadedBy: '',
      source: 'camera'
    },
    processing: {
      status: 'processing',
      progress: 0,
      steps: [
        { name: 'Processing', status: 'processing', progress: 0 },
        { name: 'Uploading', status: 'pending', progress: 0 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 100));

    const progress: UploadProgress = {
      loaded: (mediaFile.size * i) / 100,
      total: mediaFile.size,
      percentage: i,
      speed: 1024 * 100,
      eta: (100 - i) * 0.1
    };

    options.onProgress?.(progress);

    mediaFile.processing.progress = i;
    mediaFile.processing.steps[0].progress = i;
    options.onProcessingUpdate?.(mediaFile.processing);
  }

  mediaFile.processing.status = 'completed';
  mediaFile.processing.steps[0].status = 'completed';
  mediaFile.processing.steps[1].status = 'completed';
  mediaFile.processing.completedAt = new Date().toISOString();

  options.onProcessingUpdate?.(mediaFile.processing);

  return mediaFile;
}

function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'unknown' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) return 'document';
  return 'unknown';
}