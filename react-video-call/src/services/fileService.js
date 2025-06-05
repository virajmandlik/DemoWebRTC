// File Service for handling file uploads and sharing
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

export class FileService {
  constructor() {
    this.maxFileSize = 50 * 1024 * 1024; // 50MB
    this.allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
  }

  // Validate file
  validateFile(file) {
    const errors = [];

    if (file.size > this.maxFileSize) {
      errors.push(`File size must be less than ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    if (!this.allowedTypes.includes(file.type)) {
      errors.push('File type not supported');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Upload file to Firebase Storage
  async uploadFile(file, roomId, onProgress = null) {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const fileId = uuidv4();
    const fileName = `${fileId}_${file.name}`;
    const filePath = `rooms/${roomId}/files/${fileName}`;
    const fileRef = ref(storage, filePath);

    try {
      // Upload file
      const uploadTask = uploadBytes(fileRef, file);
      
      // Monitor progress if callback provided
      if (onProgress) {
        uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      const snapshot = await uploadTask;
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        url: downloadURL,
        path: filePath,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Delete file from Firebase Storage
  async deleteFile(filePath) {
    try {
      const fileRef = ref(storage, filePath);
      await deleteObject(fileRef);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  // Get file type category
  getFileCategory(fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    if (fileType.startsWith('audio/')) return 'audio';
    if (fileType === 'application/pdf') return 'pdf';
    if (fileType.includes('document') || fileType.includes('text')) return 'document';
    return 'other';
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Create file preview
  createFilePreview(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (e) => {
        reject(e);
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        resolve(null);
      }
    });
  }

  // Send file through data channel (for small files)
  async sendFileViaDataChannel(file, dataChannel, onProgress = null) {
    const chunkSize = 16384; // 16KB chunks
    const fileReader = new FileReader();
    let offset = 0;

    return new Promise((resolve, reject) => {
      const sendChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        fileReader.readAsArrayBuffer(slice);
      };

      fileReader.onload = (e) => {
        if (dataChannel.readyState === 'open') {
          const chunk = {
            type: 'file-chunk',
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            chunk: e.target.result,
            offset: offset,
            isLast: offset + chunkSize >= file.size
          };

          dataChannel.send(JSON.stringify(chunk));
          offset += chunkSize;

          if (onProgress) {
            onProgress((offset / file.size) * 100);
          }

          if (offset < file.size) {
            sendChunk();
          } else {
            resolve();
          }
        } else {
          reject(new Error('Data channel is not open'));
        }
      };

      fileReader.onerror = (e) => {
        reject(e);
      };

      // Start sending
      sendChunk();
    });
  }

  // Receive file through data channel
  receiveFileViaDataChannel(chunks) {
    // Sort chunks by offset
    chunks.sort((a, b) => a.offset - b.offset);

    // Combine chunks
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.chunk.byteLength, 0);
    const combinedArray = new Uint8Array(totalSize);
    let offset = 0;

    chunks.forEach(chunk => {
      combinedArray.set(new Uint8Array(chunk.chunk), offset);
      offset += chunk.chunk.byteLength;
    });

    // Create blob
    const blob = new Blob([combinedArray], { type: chunks[0].fileType });
    
    return {
      blob,
      fileName: chunks[0].fileName,
      fileType: chunks[0].fileType,
      fileSize: chunks[0].fileSize
    };
  }

  // Download file
  downloadFile(url, fileName) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}