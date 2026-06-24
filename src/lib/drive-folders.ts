import { getDriveClient } from "./google-drive";

/**
 * Ensures the DocMind root folder exists in the user's Google Drive.
 * Returns the folder ID.
 */
export async function ensureRootFolder(accessToken: string): Promise<string> {
  const drive = getDriveClient(accessToken);

  // Check if DocMind root folder exists
  const res = await drive.files.list({
    q: "name='DocMind' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  // Create the root folder
  const folder = await drive.files.create({
    requestBody: {
      name: "DocMind",
      mimeType: "application/vnd.google-apps.folder",
    },
    fields: "id",
  });

  return folder.data.id!;
}

/**
 * Ensures a subfolder exists inside a parent folder.
 * Returns the subfolder ID.
 */
export async function ensureSubfolder(accessToken: string, parentId: string, folderName: string): Promise<string> {
  const drive = getDriveClient(accessToken);

  const res = await drive.files.list({
    q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!;
  }

  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    },
    fields: "id",
  });

  return folder.data.id!;
}

/**
 * Builds the full folder path: DocMind / <Semester> / <Subject> / <Category>
 * Creates any missing folders along the way.
 * Returns the category folder ID.
 */
export async function ensureCategoryFolder(
  accessToken: string,
  semesterName: string,
  subjectName: string,
  category: string
): Promise<string> {
  const rootId = await ensureRootFolder(accessToken);
  const semesterId = await ensureSubfolder(accessToken, rootId, semesterName);
  const subjectId = await ensureSubfolder(accessToken, semesterId, subjectName);
  const categoryId = await ensureSubfolder(accessToken, subjectId, category);
  return categoryId;
}

/**
 * Check for duplicate files by name within a folder.
 */
export async function checkDuplicate(accessToken: string, folderId: string, fileName: string): Promise<boolean> {
  const drive = getDriveClient(accessToken);

  const res = await drive.files.list({
    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id)",
  });

  return (res.data.files && res.data.files.length > 0) || false;
}

/**
 * Upload a file to a specific Google Drive folder.
 */
export async function uploadFileToDrive(
  accessToken: string,
  folderId: string,
  fileName: string,
  mimeType: string,
  fileBuffer: Buffer
): Promise<{ id: string; name: string }> {
  const drive = getDriveClient(accessToken);

  const { Readable } = require("stream");
  const stream = new Readable();
  stream.push(fileBuffer);
  stream.push(null);

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: "id, name",
  });

  return { id: res.data.id!, name: res.data.name! };
}

/**
 * List files in a specific Google Drive folder.
 */
export async function listFilesInFolder(accessToken: string, folderId: string) {
  const drive = getDriveClient(accessToken);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
    fields: "files(id, name, mimeType, size, createdTime)",
    orderBy: "createdTime desc",
  });

  return res.data.files || [];
}
