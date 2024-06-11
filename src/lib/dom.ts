import { getCanUseFileAPI } from "@/apis/filesystem";
import { saveImageAPI } from "@/apis/img";
import { LOCAL_PROPERTYS_STORAGE_KEY } from "@/const";
import { CssToTailwindTranslator } from "css-to-tailwind-translator";
import { storage } from 'wxt/storage';

export async function getHTMLPropertys(): Promise<string> {
  const items = await storage.getItem<any>(LOCAL_PROPERTYS_STORAGE_KEY);
  const propertys = items?.propertys ?? [];
  const codeEle = document.querySelector('code.language-css');
  const arr = codeEle?.textContent?.split(/\n/).filter(Boolean).map((item) => {
    const [key, value] = item.trim().split(';')[0].split(':').map((item) => item.trim());
    if (propertys?.includes(key)) {
      return null;
    }
    return [key, value + ';'].join(': ');
  }).filter(Boolean) as string[];
  return getCSSPropertys(arr ?? []);
}

export async function getImagePropertys(): Promise<string> {
  const sliceImgBox = document.querySelectorAll('.annotation_container.lanhu_scrollbar.flag-pl .annotation_item');
  if (sliceImgBox && sliceImgBox.length) {
    const item = Array.from(sliceImgBox).find((item) => {
      return item.querySelector('.subtitle')?.textContent?.includes('样式信息');
    })
    const sizeCodeArr = item?.querySelectorAll('li')?.[2]?.querySelectorAll?.('.item_two') ?? [];
    const sizeCode = Array.from(sizeCodeArr).map((item, index) => {
      return [index === 0 ? 'width' : 'height', (item.textContent ?? '').trim() + ';'].join(': ');
    }).filter(Boolean);
    return getCSSPropertys(sizeCode);
  }
  return '';

}
export async function getCSSPropertys(arr: string[]): Promise<string> {
  try {
    const cssCode = ` body {
      ${arr?.join('')}
    }`;
    const conversionResult = CssToTailwindTranslator(cssCode);
    if (conversionResult.code === 'OK') {
      return conversionResult.data[0].resultVal
    }
    return ''
  } catch (error) {
    console.error(error);
    return ''
  }
}
export const imageSrcToBase64 = (src: string) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0, img.width, img.height);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.src = src;
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

export async function saveImage() {
  const items = await storage.getItem<any>(LOCAL_PROPERTYS_STORAGE_KEY);
  const imgSetting = items?.imgSetting ?? {};
  const { autoSave, mainDir, path } = imgSetting;
  if (!autoSave) {
    return;
  }
  const sliceImgBox = document.querySelectorAll('.annotation_container.lanhu_scrollbar.flag-pl .annotation_item');
  if (sliceImgBox && sliceImgBox.length) {
    const item = Array.from(sliceImgBox).find((item) => {
      return item.querySelector('.slice_tab_box')?.textContent?.includes('切图');
    });
    const name = item?.querySelector('.slice_name .copy_text')?.textContent ?? '';
    const preImg = item?.querySelector('.slice_pre img');
    const src = preImg?.getAttribute('src') ?? '';
    if (!preImg || !src) {
      return;
    }
    const canUseFileAPI = await getCanUseFileAPI();
    if (canUseFileAPI) {
      const fileName = await saveImageAPI({ src, name: '', mainDir, path });
      return '/' + path + '/' + fileName;
    } else {
      const base64 = await imageSrcToBase64(src + '?noCache=true');
      const a = document.createElement('a');
      a.href = base64;
      a.download = (name ?? '').trim() + '.png';
      a.target = '_blank';
      a.click();
      return (name ?? '').trim() + '.png';
    }
  }
}