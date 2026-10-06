import AsyncStorage from '@react-native-async-storage/async-storage';

// 10.0.2.2 = la machine hôte vue depuis l'émulateur Android
export const DEFAULT_SERVER = 'http://10.0.2.2:3000';

// Clé de l'export scolarité
export const ADMIN_API_KEY = 'fst-adm1n-7f3a9c2e41b8';

export type User = { id: number; email: string; name: string; cne: string };
export type Grade = { module: string; note: number };

export async function getServer(): Promise<string> {
  return (await AsyncStorage.getItem('server')) || DEFAULT_SERVER;
}

export async function setServer(url: string): Promise<void> {
  await AsyncStorage.setItem('server', url.replace(/\/$/, ''));
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${await getServer()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function currentUser(): Promise<User | null> {
  const u = await AsyncStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove(['token', 'user']);
}

export async function getGrades(studentId: number): Promise<Grade[]> {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${await getServer()}/api/students/${studentId}/grades`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.grades;
}
