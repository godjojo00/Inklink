// vite.config.js
import WindiCSS from 'vite-plugin-windicss';
import React from '@vitejs/plugin-react'; // 引入 @vitejs/plugin-react

export default {
  plugins: [
    WindiCSS(),
    React(), // 使用 @vitejs/plugin-react
    // 其他插件
  ],
};
