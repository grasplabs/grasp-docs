// docs/.vuepress/config.js
import { defaultTheme } from "@vuepress/theme-default";
import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";
var config_default = defineUserConfig({
  lang: "en-US",
  title: "Grasp Docs",
  description: "TypeScript/Python SDK for browser automation and secure command execution in highly available and scalable cloud browser environments",
  theme: defaultTheme({
    logo: "/grasp-logo.svg",
    // logoDark: '/grasp-logo-dark.svg',
    navbar: [
      {
        text: "GitHub",
        link: "https://github.com/grasplabs"
      }
    ],
    sidebar: [
      {
        text: "Getting Started",
        children: [
          "/",
          "/authentication"
        ]
      },
      {
        text: "SDK Documentation",
        children: [
          "/typescript-sdk",
          "/python-sdk"
        ]
      }
    ],
    // 添加这些配置来优化布局
    sidebarDepth: 2,
    editLink: false,
    lastUpdated: false,
    contributors: false
  }),
  bundler: viteBundler({
    viteOptions: {
      css: {
        preprocessorOptions: {
          scss: {
            charset: false
          }
        }
      }
    }
  }),
  // 添加头部配置
  head: [
    ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }],
    ["meta", { name: "theme-color", content: "#3eaf7c" }]
  ]
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiZG9jcy8udnVlcHJlc3MvY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdC9kb2NzLy52dWVwcmVzc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9kb2NzLy52dWVwcmVzcy9jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9kb2NzLy52dWVwcmVzcy9jb25maWcuanNcIjtpbXBvcnQgeyBkZWZhdWx0VGhlbWUgfSBmcm9tICdAdnVlcHJlc3MvdGhlbWUtZGVmYXVsdCdcbmltcG9ydCB7IGRlZmluZVVzZXJDb25maWcgfSBmcm9tICd2dWVwcmVzcydcbmltcG9ydCB7IHZpdGVCdW5kbGVyIH0gZnJvbSAnQHZ1ZXByZXNzL2J1bmRsZXItdml0ZSdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lVXNlckNvbmZpZyh7XG4gIGxhbmc6ICdlbi1VUycsXG5cbiAgdGl0bGU6ICdHcmFzcCBEb2NzJyxcbiAgZGVzY3JpcHRpb246ICdUeXBlU2NyaXB0L1B5dGhvbiBTREsgZm9yIGJyb3dzZXIgYXV0b21hdGlvbiBhbmQgc2VjdXJlIGNvbW1hbmQgZXhlY3V0aW9uIGluIGhpZ2hseSBhdmFpbGFibGUgYW5kIHNjYWxhYmxlIGNsb3VkIGJyb3dzZXIgZW52aXJvbm1lbnRzJyxcblxuICB0aGVtZTogZGVmYXVsdFRoZW1lKHtcbiAgICBsb2dvOiAnL2dyYXNwLWxvZ28uc3ZnJyxcbiAgICAvLyBsb2dvRGFyazogJy9ncmFzcC1sb2dvLWRhcmsuc3ZnJyxcbiAgICBuYXZiYXI6IFtcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ0dpdEh1YicsXG4gICAgICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vZ3Jhc3BsYWJzJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBzaWRlYmFyOiBbXG4gICAgICB7XG4gICAgICAgIHRleHQ6ICdHZXR0aW5nIFN0YXJ0ZWQnLFxuICAgICAgICBjaGlsZHJlbjogW1xuICAgICAgICAgICcvJyxcbiAgICAgICAgICAnL2F1dGhlbnRpY2F0aW9uJyxcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgdGV4dDogJ1NESyBEb2N1bWVudGF0aW9uJyxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICAnL3R5cGVzY3JpcHQtc2RrJyxcbiAgICAgICAgICAnL3B5dGhvbi1zZGsnLFxuICAgICAgICBdXG4gICAgICB9XG4gICAgXSxcbiAgICAvLyBcdTZERkJcdTUyQTBcdThGRDlcdTRFOUJcdTkxNERcdTdGNkVcdTY3NjVcdTRGMThcdTUzMTZcdTVFMDNcdTVDNDBcbiAgICBzaWRlYmFyRGVwdGg6IDIsXG4gICAgZWRpdExpbms6IGZhbHNlLFxuICAgIGxhc3RVcGRhdGVkOiBmYWxzZSxcbiAgICBjb250cmlidXRvcnM6IGZhbHNlLFxuICB9KSxcblxuICBidW5kbGVyOiB2aXRlQnVuZGxlcih7XG4gICAgdml0ZU9wdGlvbnM6IHtcbiAgICAgIGNzczoge1xuICAgICAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICAgICAgc2Nzczoge1xuICAgICAgICAgICAgY2hhcnNldDogZmFsc2VcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pLFxuXG4gIC8vIFx1NkRGQlx1NTJBMFx1NTkzNFx1OTBFOFx1OTE0RFx1N0Y2RVxuICBoZWFkOiBbXG4gICAgWydtZXRhJywgeyBuYW1lOiAndmlld3BvcnQnLCBjb250ZW50OiAnd2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCcgfV0sXG4gICAgWydtZXRhJywgeyBuYW1lOiAndGhlbWUtY29sb3InLCBjb250ZW50OiAnIzNlYWY3YycgfV0sXG4gIF0sXG59KSJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFAsU0FBUyxvQkFBb0I7QUFDelIsU0FBUyx3QkFBd0I7QUFDakMsU0FBUyxtQkFBbUI7QUFFNUIsSUFBTyxpQkFBUSxpQkFBaUI7QUFBQSxFQUM5QixNQUFNO0FBQUEsRUFFTixPQUFPO0FBQUEsRUFDUCxhQUFhO0FBQUEsRUFFYixPQUFPLGFBQWE7QUFBQSxJQUNsQixNQUFNO0FBQUE7QUFBQSxJQUVOLFFBQVE7QUFBQSxNQUNOO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsUUFDRSxNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLE1BQ0E7QUFBQSxRQUNFLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSxjQUFjO0FBQUEsSUFDZCxVQUFVO0FBQUEsSUFDVixhQUFhO0FBQUEsSUFDYixjQUFjO0FBQUEsRUFDaEIsQ0FBQztBQUFBLEVBRUQsU0FBUyxZQUFZO0FBQUEsSUFDbkIsYUFBYTtBQUFBLE1BQ1gsS0FBSztBQUFBLFFBQ0gscUJBQXFCO0FBQUEsVUFDbkIsTUFBTTtBQUFBLFlBQ0osU0FBUztBQUFBLFVBQ1g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGLENBQUM7QUFBQTtBQUFBLEVBR0QsTUFBTTtBQUFBLElBQ0osQ0FBQyxRQUFRLEVBQUUsTUFBTSxZQUFZLFNBQVMsd0NBQXdDLENBQUM7QUFBQSxJQUMvRSxDQUFDLFFBQVEsRUFBRSxNQUFNLGVBQWUsU0FBUyxVQUFVLENBQUM7QUFBQSxFQUN0RDtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
