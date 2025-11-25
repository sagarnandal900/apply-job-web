// File size in bytes
const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PHOTO_SIZE = 2 * 1024 * 1024; // 2MB

// Allowed file types
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export const validateResumeFile = (file) => {
  if (!file) {
    return { valid: false, message: 'Resume is required' };
  }

  if (file.size > MAX_RESUME_SIZE) {
    return { valid: false, message: 'Resume size must not exceed 5MB' };
  }

  if (!ALLOWED_RESUME_TYPES.includes(file.type)) {
    return { valid: false, message: 'Resume must be PDF, DOC, or DOCX format' };
  }

  return { valid: true };
};

export const validatePhotoFile = (file) => {
  if (!file) {
    return { valid: true }; // Photo is optional
  }

  if (file.size > MAX_PHOTO_SIZE) {
    return { valid: false, message: 'Photo size must not exceed 2MB' };
  }

  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { valid: false, message: 'Photo must be JPG, JPEG, or PNG format' };
  }

  return { valid: true };
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};
