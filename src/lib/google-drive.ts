import { google } from "googleapis";

export function getDriveClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth });
}

export async function getAppDataFile(accessToken: string, fileName: string) {
  const drive = getDriveClient(accessToken);
  
  // Find the file in appDataFolder
  const res = await drive.files.list({
    spaces: "appDataFolder",
    q: `name='${fileName}'`,
    fields: "files(id, name)",
  });

  const files = res.data.files;
  if (!files || files.length === 0) {
    return null;
  }

  const fileId = files[0].id!;
  
  // Get file content
  const contentRes = await drive.files.get({
    fileId,
    alt: "media",
  });

  return { id: fileId, data: contentRes.data };
}

export async function updateAppDataFile(accessToken: string, fileName: string, content: any) {
  const drive = getDriveClient(accessToken);
  const existingFile = await getAppDataFile(accessToken, fileName);
  
  const fileMetadata = {
    name: fileName,
    parents: ["appDataFolder"],
  };

  const media = {
    mimeType: "application/json",
    body: JSON.stringify(content),
  };

  if (existingFile) {
    // Update existing file
    await drive.files.update({
      fileId: existingFile.id,
      media: media,
    });
  } else {
    // Create new file
    await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
  }
}
