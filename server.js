import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createProxyMiddleware } from 'http-proxy-middleware'

const app = express()
const port = process.env.PORT || 8080

const API_TARGET = 
  //  'http://localhost:5000'
  //  'http://localhost:5001'
   'https://api.saladerp.com'

// __dirname 설정 (ESM 환경용)
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'dist')))

// 👉 API 프록시 설정 (Spring Boot 서버 주소로 변경!)
app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
}))

// 👉 SSE 구독용 프록시 (웹소켓 포함)
app.use('/notification/subscribe', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  ws: true
}))

// SPA 처리
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
