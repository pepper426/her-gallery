import React from 'react'
import ReactDOM from 'react-dom/client'
// 关键修复：使用相对路径 ./ 来引入当前目录下的组件
import App from './SuperTest.jsx' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
// 强制触发Vercel更新
