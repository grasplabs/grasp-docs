import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  title: 'Grasp Docs',
  description: 'TypeScript/Python SDK for browser automation and secure command execution in highly available and scalable cloud browser environments',

  theme: defaultTheme({
    logo: '/grasp-logo.svg',
    // logoDark: '/grasp-logo-dark.svg',
    navbar: [
      {
        text: 'GitHub',
        link: 'https://github.com/grasplabs',
      },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        children: [
          '/',
          '/authentication',
        ]
      },
      {
        text: 'SDK Documentation',
        children: [
          '/typescript-sdk',
          '/python-sdk',
        ]
      }
    ],
    // 添加这些配置来优化布局
    sidebarDepth: 2,
    editLink: false,
    lastUpdated: false,
    contributors: false,
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
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],
})