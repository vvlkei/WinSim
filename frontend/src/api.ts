import axios from 'axios'
import type { FileEntry, TrashEntry } from './types'

const api = axios.create({ baseURL: '/api' })

export async function listFiles(path: string): Promise<FileEntry[]> {
  const res = await api.get('/files', { params: { path } })
  return res.data
}

export async function createFile(path: string, isDirectory: boolean): Promise<void> {
  await api.post('/files', { path, isDirectory })
}

export async function deleteFile(path: string): Promise<void> {
  await api.delete('/files', { params: { path } })
}

export async function renameFile(path: string, newName: string): Promise<void> {
  await api.put('/files/rename', { path, newName })
}

export async function readFile(path: string): Promise<string> {
  const res = await api.get('/files/read', { params: { path } })
  return res.data.content
}

export async function writeFile(path: string, content: string): Promise<void> {
  await api.put('/files/write', { path, content })
}

export async function uploadWallpaper(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/wallpaper', form)
  return res.data.path
}

export async function getWallpaper(): Promise<string | null> {
  const res = await api.get('/wallpaper')
  return res.data.path
}

export async function listTrash(): Promise<TrashEntry[]> {
  const res = await api.get('/files/trash')
  return res.data
}

export async function restoreTrash(name: string): Promise<void> {
  await api.post('/files/trash/restore', { name })
}

export async function emptyTrash(): Promise<void> {
  await api.delete('/files/trash')
}
