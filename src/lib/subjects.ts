import { getAppDataFile, updateAppDataFile } from "./google-drive";

export interface Subject {
  id: string;
  name: string;
  semesterId: string;
  categories: string[]; // ["Course Data", "Assignments", "Quizzes"]
  driveFolderId?: string; // Google Drive folder ID once created
}

const SUBJECTS_FILE = "documind_subjects.json";

export async function getSubjects(accessToken: string): Promise<Subject[]> {
  const file = await getAppDataFile(accessToken, SUBJECTS_FILE);
  if (!file) return [];
  return Array.isArray(file.data) ? file.data : [];
}

export async function getSubjectsBySemester(accessToken: string, semesterId: string): Promise<Subject[]> {
  const subjects = await getSubjects(accessToken);
  return subjects.filter(s => s.semesterId === semesterId);
}

export async function createSubject(accessToken: string, name: string, semesterId: string): Promise<Subject> {
  const subjects = await getSubjects(accessToken);

  const newSubject: Subject = {
    id: `subj_${Date.now()}`,
    name,
    semesterId,
    categories: ["Course Data", "Assignments", "Quizzes"],
  };

  subjects.push(newSubject);
  await updateAppDataFile(accessToken, SUBJECTS_FILE, subjects);

  return newSubject;
}

export async function updateSubject(accessToken: string, subjectId: string, updates: Partial<Subject>): Promise<Subject | null> {
  const subjects = await getSubjects(accessToken);
  const index = subjects.findIndex(s => s.id === subjectId);
  if (index === -1) return null;

  subjects[index] = { ...subjects[index], ...updates };
  await updateAppDataFile(accessToken, SUBJECTS_FILE, subjects);
  return subjects[index];
}
