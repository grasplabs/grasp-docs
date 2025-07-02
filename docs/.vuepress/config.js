import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  // 设置默认语言
  lang: 'en-US',
  
  // 多语言配置
  locales: {
    // 英语 (默认)
    '/': {
      lang: 'en-US',
      title: 'Grasp Docs',
      description: 'TypeScript/Python SDK for browser automation and secure command execution in highly available and scalable cloud browser environments',
    },
    // 简体中文
    '/zh/': {
      lang: 'zh-CN',
      title: 'Grasp 文档',
      description: 'TypeScript/Python SDK，用于在高可用和可扩展的云浏览器环境中进行浏览器自动化和安全命令执行',
    },
    // 日语
    '/ja/': {
      lang: 'ja-JP',
      title: 'Grasp ドキュメント',
      description: '高可用性でスケーラブルなクラウドブラウザ環境でのブラウザ自動化と安全なコマンド実行のためのTypeScript/Python SDK',
    },
  },

  theme: defaultTheme({
    logo: '/grasp-logo.svg',
    
    // 多语言主题配置
    locales: {
      // 英语配置
      '/': {
        selectLanguageName: 'English',
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
        // 导航文本
        selectLanguageText: 'Languages',
        selectLanguageAriaLabel: 'Select language',
        editLinkText: 'Edit this page',
        lastUpdatedText: 'Last Updated',
        contributorsText: 'Contributors',
        notFound: [
          "There's nothing here.",
          "How did we get here?",
          "That's a Four-Oh-Four.",
          "Looks like we've got some broken links."
        ],
        backToHome: 'Take me home',
        openInNewWindow: 'open in new window',
        toggleColorMode: 'toggle color mode',
        toggleSidebar: 'toggle sidebar',
      },
      
      // 简体中文配置
      '/zh/': {
        selectLanguageName: '简体中文',
        navbar: [
          {
            text: 'GitHub',
            link: 'https://github.com/grasplabs',
          },
        ],
        sidebar: [
          {
            text: '快速开始',
            children: [
              '/zh/',
              '/zh/authentication',
            ]
          },
          {
            text: 'SDK 文档',
            children: [
              '/zh/typescript-sdk',
              '/zh/python-sdk',
            ]
          }
        ],
        // 导航文本
        selectLanguageText: '选择语言',
        selectLanguageAriaLabel: '选择语言',
        editLinkText: '编辑此页',
        lastUpdatedText: '上次更新',
        contributorsText: '贡献者',
        notFound: [
          "这里什么都没有",
          "我们怎么到这来了？",
          "这是一个 404 页面",
          "看起来我们进入了错误的链接"
        ],
        backToHome: '返回首页',
        openInNewWindow: '在新窗口打开',
        toggleColorMode: '切换颜色模式',
        toggleSidebar: '切换侧边栏',
      },
      
      // 日语配置
      '/ja/': {
        selectLanguageName: '日本語',
        navbar: [
          {
            text: 'GitHub',
            link: 'https://github.com/grasplabs',
          },
        ],
        sidebar: [
          {
            text: 'はじめに',
            children: [
              '/ja/',
              '/ja/authentication',
            ]
          },
          {
            text: 'SDK ドキュメント',
            children: [
              '/ja/typescript-sdk',
              '/ja/python-sdk',
            ]
          }
        ],
        // 导航文本
        selectLanguageText: '言語',
        selectLanguageAriaLabel: '言語を選択',
        editLinkText: 'このページを編集',
        lastUpdatedText: '最終更新',
        contributorsText: '貢献者',
        notFound: [
          "ここには何もありません",
          "どうやってここに来たのでしょう？",
          "これは404ページです",
          "リンクが壊れているようです"
        ],
        backToHome: 'ホームに戻る',
        openInNewWindow: '新しいウィンドウで開く',
        toggleColorMode: 'カラーモードを切り替え',
        toggleSidebar: 'サイドバーを切り替え',
      },
    },
    
    // 通用配置
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

  // 头部配置
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
  ],
})