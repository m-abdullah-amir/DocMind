import { getAppDataFile, updateAppDataFile } from "./google-drive";

export interface Semester {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const SEMESTERS_FILE = "documind_semesters.json";

export async function getSemesters(accessToken: string): Promise<Semester[]> {
  const file = await getAppDataFile(accessToken, SEMESTERS_FILE);
  if (!file) return [];
  return Array.isArray(file.data) ? file.data : [];
}

export async function createSemester(accessToken: string, name: string, startDate: string, endDate: string): Promise<Semester> {
  const semesters = await getSemesters(accessToken);
  
  // If this is the first semester, make it active. Otherwise, inactive by default.
  const isActive = semesters.length === 0;

  const newSemester: Semester = {
    id: `sem_${Date.now()}`,
    name,
    startDate,
    endDate,
    isActive,
  };

  semesters.push(newSemester);
  await updateAppDataFile(accessToken, SEMESTERS_FILE, semesters);
  
  return newSemester;
}

export async function activateSemester(accessToken: string, semesterId: string): Promise<Semester[]> {
  const semesters = await getSemesters(accessToken);
  
  const updatedSemesters = semesters.map(sem => ({
    ...sem,
    isActive: sem.id === semesterId
  }));

  await updateAppDataFile(accessToken, SEMESTERS_FILE, updatedSemesters);
  return updatedSemesters;
}
