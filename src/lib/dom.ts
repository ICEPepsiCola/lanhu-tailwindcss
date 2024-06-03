import { LOCAL_PROPERTYS_STORAGE_KEY } from "@/const";
import { CssToTailwindTranslator, ResultCode } from "css-to-tailwind-translator";
import { storage } from 'wxt/storage';

export async function getCSSPropertys(): Promise<string> {
  try {
    const items = await storage.getItem<string[]>(LOCAL_PROPERTYS_STORAGE_KEY);
    const codeEle = document.querySelector('code.language-css');
    const arr = codeEle?.textContent?.split(/\n/).filter(Boolean).map((item) => {
      const [key, value] = item.trim().split(';')[0].split(':').map((item) => item.trim());
      if (items?.includes(key)) {
        return null;
      }
      return [key, value].join(': ')
    }).filter(Boolean);
    const cssCode = ` body {
      ${arr?.join(': ')}
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