import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const port = process.env.PORT || 8080

const API_TARGET = 
  //  'http://localhost:5000'
   'http://localhost:5001'
  //  'https://api.saladerp.com'

// __dirname 설정 (ESM 환경용)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'dist')))

// API 프록시 설정
app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
}))

// 알림 관련 프록시 설정 (nginx와 호환되도록 단순화)
app.use('/notification', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    // SSE 연결을 위한 기본 헤더만 설정
    if (req.url.includes('/subscribe')) {
      proxyReq.setHeader('Accept', 'text/event-stream')
      proxyReq.setHeader('Cache-Control', 'no-cache')
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // nginx에서 처리하므로 최소한의 헤더만 설정
    if (req.url.includes('/subscribe')) {
      proxyRes.headers['X-Accel-Buffering'] = 'no'
    }
  }
}))

// SPA 처리
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
