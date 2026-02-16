import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { refreshAccessToken } from '../lib/api'
import Layout from '../components/Layout'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(()=>{
    async function init() {
      await refreshAccessToken()
    }
    init()
  },[])
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
