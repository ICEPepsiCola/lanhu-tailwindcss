import { httpGet } from "@/lib/http"

export function getDirTree(dirPath: string) {
  return httpGet<string[]>('http://localhost:1323/dir/getDirTree?dir=' + dirPath)
}
export function getCanUseFileAPI() {
  return httpGet('http://localhost:1323/canUseFileAPI')
}