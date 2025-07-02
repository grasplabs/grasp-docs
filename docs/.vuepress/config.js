import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  lang: 'en-US',

  title: 'Grasp Docs',
  description: '',

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
    ]
  }),

  bundler: viteBundler(),
})