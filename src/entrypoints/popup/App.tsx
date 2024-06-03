
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { storage } from 'wxt/storage';
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMount } from 'react-use';
import { LOCAL_PROPERTYS_STORAGE_KEY } from "@/const";

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
  items: z.array(z.string())
})

function getItemsFromLocalStorage() {
  const items = localStorage.getItem("items")
  if (items) {
    return JSON.parse(items)
  }
  return ["font-family", "line-height"]
}

function setItemsToLocalStorage(items: string[]) {
  localStorage.setItem("items", JSON.stringify(items))
}

export function Main() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: getItemsFromLocalStorage(),
    },
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setItemsToLocalStorage(data.items)
    storage.setItem(LOCAL_PROPERTYS_STORAGE_KEY, data.items);
  }
  useMount(() => {
    // @ts-expect-error
    storage.getItem(LOCAL_PROPERTYS_STORAGE_KEY).then((items: string[]) => {
      if (Array.isArray(items)) {
        form.setValue('items', items);
      }
    });
  });
  return (
    <div className="p-8">
      <Form {...form}>
        <form onChange={form.handleSubmit(onSubmit)} className="space-y-8" >
          <FormField
            control={form.control}
            name="items"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">过滤CSS属性</FormLabel>
                  <FormDescription>
                    选择你想要过滤的CSS属性
                  </FormDescription>
                </div>
                {items.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="items"
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
