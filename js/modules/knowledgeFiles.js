export function getLocalFiles(item = {}) {
  return Array.isArray(item.localFiles) ? item.localFiles : [];
}

export function formatFileSize(bytes = 0, safeNumber = Number) {
  const size = safeNumber(bytes);
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileKind(file = {}) {
  const type = String(file.type || '');
  if (type === 'application/pdf' || String(file.name || '').toLowerCase().endsWith('.pdf')) return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'file';
}

export function countPdfPagesFromText(text = '') {
  const matches = String(text).match(/\/Type\s*\/Page(?!s)\b/g);
  return matches ? matches.length : 0;
}

export async function countPdfPagesFromArrayBuffer(buffer) {
  try {
    const bytes = new Uint8Array(buffer);
    let text = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) text += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return countPdfPagesFromText(text);
  } catch { return 0; }
}

export async function readFileAsDataURL(file, { generateId }) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const payload = { id: generateId('file'), name: file.name, type: file.type, size: file.size, kind: getFileKind(file), dataUrl, createdAt: new Date().toISOString(), storageMode: 'local-inline' };
  if (payload.kind === 'pdf') {
    try { payload.pageCount = await countPdfPagesFromArrayBuffer(await file.arrayBuffer()); } catch { payload.pageCount = 0; }
  }
  return payload;
}

export function validateUploads(uploaded = [], knowledgeType = '') {
  if (knowledgeType === 'كتاب PDF' && uploaded.some(file => file.kind !== 'pdf')) throw new Error('نوع الكتاب يقبل ملفات PDF فقط.');
  if (knowledgeType === 'صور' && uploaded.some(file => file.kind !== 'image')) throw new Error('نوع الصور يقبل ملفات صور فقط.');
  if ((knowledgeType === 'فيديو' || knowledgeType === 'Playlist') && uploaded.some(file => file.kind !== 'video')) throw new Error('نوع الفيديو يقبل ملفات فيديو فقط.');
}

export function mergeKnowledgeFiles(existingFiles = [], newFiles = [], knowledgeType = '') {
  if (!newFiles.length) return existingFiles;
  if (knowledgeType === 'صور') return [...existingFiles.filter(file => file.kind === 'image'), ...newFiles];
  if (knowledgeType === 'كتاب PDF') return [...existingFiles.filter(file => file.kind !== 'pdf'), ...newFiles.filter(file => file.kind === 'pdf')].slice(-1);
  if (knowledgeType === 'فيديو') return [...existingFiles.filter(file => file.kind !== 'video'), ...newFiles.filter(file => file.kind === 'video')].slice(-1);
  if (knowledgeType === 'Playlist') return [...existingFiles.filter(file => file.kind !== 'video'), ...newFiles.filter(file => file.kind === 'video')];
  return [...existingFiles, ...newFiles];
}
