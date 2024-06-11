import { httpPost } from "@/lib/http"


export function saveImageAPI(params: { src: string, name?: string, mainDir?: string, path?: string }) {
  return httpPost('http://localhost:1323/img/saveImage', params)
}
