import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend) // 允许从服务器或本地文件加载翻译
  .use(LanguageDetector) // 自动检测用户语言
  .use(initReactI18next) // 绑定 React
  .init({
    fallbackLng: 'en', // 默认语言
    debug: true, // 开启调试模式，发布时可设为 false
    interpolation: {
      escapeValue: false, // React 已经安全处理 HTML
    },
    backend: {
      loadPath: '/assets/i18n/{{lng}}.json', // 指定语言 JSON 文件路径
    },
  });

export default i18n;
