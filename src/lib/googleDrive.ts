import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase with auto-imported workspace config
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Required Scope for Google Drive file manipulation and metadata reading
provider.addScope('https://www.googleapis.com/auth/drive');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Get or restore token helper
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // Since we are doing client-side in-memory caching, if they reload they can sign in with popup again
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('無法取得 Google API 存取權杖！');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- Google Drive REST API Integration Helpers ---

export interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  webViewLink?: string;
}

// 1. Find or create the root folder "哆咪音樂坊-雲端教材與備份"
export const getOrCreateAppFolder = async (accessToken: string): Promise<string> => {
  const folderName = '哆咪音樂坊-雲端教材與備份';
  
  // Search if folder exists
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error('搜尋 Google Drive 資料夾時發生錯誤');
  }
  
  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  
  // Create it if it doesn't exist
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });
  
  if (!createRes.ok) {
    throw new Error('無法在 Google Drive 上建立專屬資料夾');
  }
  
  const folder = await createRes.json();
  return folder.id;
};

// 2. List items in folder
export const listFilesInFolder = async (accessToken: string, folderId: string): Promise<DriveItem[]> => {
  const query = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,webViewLink)&orderBy=createdTime desc`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!res.ok) {
    throw new Error('無法讀取 Google Drive 檔案清單');
  }
  
  const data = await res.json();
  return data.files || [];
};

// 3. Upload File to Google Drive Folder (using Multipart upload for robust handling of metadata and content)
export const uploadFileToFolder = async (
  accessToken: string,
  folderId: string,
  fileName: string,
  fileContent: string | Blob,
  mimeType: string
): Promise<DriveItem> => {
  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: mimeType,
  };

  const boundary = '314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  
  // Wrap file loading in a Promise
  const fileDataPromise = new Promise<string>((resolve) => {
    if (typeof fileContent === 'string') {
      resolve(fileContent);
    } else {
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsBinaryString(fileContent);
    }
  });

  const rawData = await fileDataPromise;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: ' + mimeType + '\r\n' +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    (typeof fileContent === 'string' ? btoa(unescape(encodeURIComponent(rawData))) : btoa(rawData)) +
    closeDelimiter;

  const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,webViewLink';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Upload Error:', errText);
    throw new Error('上傳檔案至 Google Drive 失敗');
  }

  return await res.json();
};

// 4. Download file content text description (mainly for local database restoration)
export const downloadFileContent = async (accessToken: string, fileId: string): Promise<string> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('無法從 Google Drive 下載該備份檔案內容');
  }

  return await res.text();
};

// 5. Delete file
export const deleteFile = async (accessToken: string, fileId: string): Promise<void> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('刪除 Google Drive 檔案失敗');
  }
};
