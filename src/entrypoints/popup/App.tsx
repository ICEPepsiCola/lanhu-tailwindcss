
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { storage } from 'wxt/storage';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMount } from 'react-use';
import { LOCAL_PROPERTYS_STORAGE_KEY } from "@/const";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useSWR from 'swr';
import { getDirTree } from "@/apis/filesystem";

const items = [
  {
    id: "font-family",
    label: "Font Family",
  },
  {
    id: "line-height",
    label: "Line Height",
  }
] as const

const FormSchema = z.object({
  propertys: z.array(z.string()),
  imgSetting: z.object({
    autoSave: z.boolean(),
    mainDir: z.string(),
    path: z.string(),
  })
})

function getItemsFromLocalStorage() {
  const items = localStorage.getItem("items")
  if (items) {
    return JSON.parse(items)
  }
  return ["font-family", "line-height"]
}

function setItemsToLocalStorage(items: any) {
  localStorage.setItem("items", JSON.stringify(items))
}

export function Main() {
  const localItems = getItemsFromLocalStorage()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      propertys: localItems?.propertys || [],
      imgSetting: localItems?.imgSetting ?? {
        // 是否自动保存图片
        autoSave: false,
        mainDir: 'code/zhixing',
        // 图片保存路径
        path: '',
      }
    },
  });
  const { data: dirTree = [] } = useSWR('code,zhixing', getDirTree)
  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log('data', data);
    setItemsToLocalStorage(data)
    storage.setItem(LOCAL_PROPERTYS_STORAGE_KEY, data);
  }
  useMount(async () => {
    storage.getItem(LOCAL_PROPERTYS_STORAGE_KEY).then((data: any) => {
      console.log('data', data);
      const { propertys, imgSetting } = data;
      form.setValue('propertys', propertys);
      form.setValue('imgSetting', imgSetting);
    });
  });

  return (
    <div className="p-[20px]">
      <Form {...form}>
        <form onChange={form.handleSubmit(onSubmit)} className="space-y-3" >
          <FormField
            control={form.control}
            name="propertys"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">过滤CSS属性</FormLabel>
                </div>
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="propertys"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.id
                                    )
                                  )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imgSetting"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">图片设置</FormLabel>
                </div>
                <FormField
                  control={form.control}
                  name="imgSetting.autoSave"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        自动保存图片
                      </FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imgSetting.mainDir"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Input {...field} value={field.value} className="" placeholder="主目录" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imgSetting.path"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Select {...field} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                          <SelectContent>
                            {
                              dirTree.map((item: any) => {
                                return (
                                  <SelectItem key={item} value={item}>
                                    {item}
                                  </SelectItem>
                                )
                              })
                            }
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

function App() {
  return (
    <div className="min-w-[300px]">
      <Main />
    </div>
  )
}

export default App;
