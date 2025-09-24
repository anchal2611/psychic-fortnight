import Head from 'next/head'
import Journal from '../components/Journal'

export default function Home() {
  return (
    <>
      <Head>
        <title>ZEN — Zone for Emotional Nurturing</title>
        <meta name="description" content="Sentiment-aware journaling aligned with medical guidelines" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="app-root">
        <div className="card">
          <header className="card-header">
            <div className="header-title">🌸 ZEN 🌸</div>
            <div className="header-sub">Zone for Emotional Nurturing</div>
          </header>

          <div className="card-body">
            <Journal />
          </div>
        </div>
      </main>
    </>
  )
}
