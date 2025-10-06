<template>
  <section class="py-4 px-14">
    <nav class="flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2">
        <Signature class="h-6 w-6" />
        <p class="text-xl font-bold">PDF 簽名 DEMO</p>
      </NuxtLink>
      <NavigationMenu class="hidden lg:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink href="/" :class="navigationMenuTriggerStyle()">
              首頁
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>功能</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div class="grid w-[600px] grid-cols-2 p-3">
                <NavigationMenuLink
                  v-for="feature in features"
                  :key="feature.href"
                  :href="feature.href"
                  class="rounded-md p-3 transition-colors hover:bg-muted/70"
                >
                  <div key="{feature.title}">
                    <p class="mb-1 font-semibold text-foreground">
                      {{ feature.title }}
                    </p>
                    <p class="text-sm text-muted-foreground">
                      {{ feature.description }}
                    </p>
                  </div>
                </NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <Sheet>
        <SheetTrigger asChild class="lg:hidden">
          <Button variant="outline" size="icon">
            <Menu class="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" class="max-h-screen overflow-auto">
          <SheetHeader>
            <SheetTitle>
              <NuxtLink to="/" class="flex items-center gap-2">
                <Signature class="h-6 w-6" />
                <p class="text-xl font-bold">PDF 簽名 DEMO</p>
              </NuxtLink>
            </SheetTitle>
          </SheetHeader>
          <div class="flex flex-col p-4">
            <div class="flex flex-col gap-6">
              <a href="#" class="font-medium"> 首頁 </a>
            </div>
            <Accordion type="single" collapsible class="mt-4 mb-2">
              <AccordionItem value="solutions" class="border-none">
                <AccordionTrigger class="text-base hover:no-underline">
                  功能
                </AccordionTrigger>
                <AccordionContent>
                  <div class="grid md:grid-cols-2">
                    <a
                      v-for="feature in features"
                      :key="feature.href"
                      :href="feature.href"
                      class="rounded-md p-3 transition-colors hover:bg-muted/70"
                    >
                      <div key="{feature.title}">
                        <p class="mb-1 font-semibold text-foreground">
                          {{ feature.title }}
                        </p>
                        <p class="text-sm text-muted-foreground">
                          {{ feature.description }}
                        </p>
                      </div>
                    </a>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <!-- <div class="mt-6 flex flex-col gap-4">
                <NuxtLink to="/">
                  <Button variant="outline"> 首頁 </Button>
                </NuxtLink>
                <NuxtLink to="/sign"><Button>簽名</Button> </NuxtLink>
              </div> -->
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, X, Signature, FilePen } from "lucide-vue-next";

const isOpen = ref(false);

const features = [
  {
    title: "PDF簽名",
    description: "能夠在PDF上面簽名的功能(๑•̀ㅂ•́)و✧",
    href: "/sign",
  },
  {
    title: "未知1",
    description: "還不知道要做什麼",
    href: "#1",
  },
  {
    title: "未知2",
    description: "還不知道要做什麼",
    href: "#2",
  },
  {
    title: "未知3",
    description: "還不知道要做什麼",
    href: "#3",
  },
];
</script>
