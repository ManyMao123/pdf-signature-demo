// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

// @ts-ignore
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["shadcn-nuxt", "@pinia/nuxt"],
  shadcn: {
    prefix: "",
    componentDir: "./components/ui",
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
  components: [
    {
      path: "~/components",
      pathPrefix: false,
      extensions: ["vue"],
    },
  ],
});
