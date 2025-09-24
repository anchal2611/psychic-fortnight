import { useEffect, useState } from 'react'
import Sentiment from 'sentiment'
import PHQ9GAD7 from './PHQ9GAD7'

const sentiment = new Sentiment()

const SUICIDAL_KEYWORDS = [
  'suicide','kill myself','end my life','i want to die','cant go on','worthless','no reason to live'
]

function hasSuicidalLanguage(text){
  const lower = text.toLowerCase()
  return SUICIDAL_KEYWORDS.some(k=> lower.includes(k))
}

export default function Journal(){
  const [entry, setEntry] = useState('')
  const [history, setHistory] = useState([])
  const [lastAnalysis, setLastAnalysis] = useState(null)
  const [screening, setScreening] = useState(null)

  useEffect(()=>{
    try{ const raw = localStorage.getItem('zen_journal_history'); if(raw) setHistory(JSON.parse(raw)) }catch(e){}
  },[])
  useEffect(()=>{ localStorage.setItem('zen_journal_history', JSON.stringify(history)) },[history])

  async function analyzeTextWithAPI(text){
    try{
      const res = await fetch('/api/analyze', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text})})
      if(!res.ok) throw new Error('analysis failed')
      const data = await res.json()
      // data.emotions is array of {label,score}
      return data.emotions || []
    }catch(e){ console.error(e); return [] }
  }

  async function handleSubmit(e){
    e && e.preventDefault()
    if(!entry.trim()) return
    const s = sentiment.analyze(entry)
    const emotions = await analyzeTextWithAPI(entry)
    const suicidal = hasSuicidalLanguage(entry)
    const item = { id: Date.now(), text: entry, createdAt: new Date().toISOString(), analysis: {score: s.score, comparative: s.comparative, emotions, suicidal } }
    setHistory([item, ...history])
    setLastAnalysis(item.analysis)
    setEntry('')
  }

  function colorForScore(score){ if(score > 1) return 'var(--positive)'; if(score >= 0) return 'var(--neutral)'; return 'var(--negative)'}

  async function handleExport(item){
    // Prepare payload
    const payload = {
      entry: item.text,
      phq9Score: screening?.phq9Score ?? null,
      gad7Score: screening?.gad7Score ?? null,
      meta: { user: 'Anonymous' }
    }
    // Use EXPORT_SECRET header — set this as an environment variable in Vercel and never expose it client-side
    // In a production app, you'd use authenticated user sessions and obtain a temporary token for export.
    const secret = prompt('Enter export secret (stored on server)')
    if(!secret) return alert('Export cancelled')
    try{
      const res = await fetch('/api/export-pdf', {method:'POST', headers:{'Content-Type':'application/json','x-export-secret': secret}, body:JSON.stringify(payload)})
      if(!res.ok){ const txt = await res.json(); throw new Error(txt.error || 'Export failed') }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zen_export_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    }catch(err){ alert('Export failed: '+err.message) }
  }

  return (
    <div className="journal-root">
      <div className="journal-input-area">
        <form onSubmit={handleSubmit} className="entry-form">
          <textarea value={entry} onChange={e=>setEntry(e.target.value)} placeholder="Share how you're feeling..." rows={4}></textarea>
          <button type="submit" className="send-btn">Send</button>
        </form>

        {lastAnalysis && (
          <div className="analysis-card">
            <div className="analysis-row"><strong>Sentiment score:</strong><span style={{color: colorForScore(lastAnalysis.score)}}>{lastAnalysis.score}</span></div>
            <div className="analysis-row"><strong>Emotions (ML):</strong><span>{lastAnalysis.emotions.length? lastAnalysis.emotions.map(e=>e.label+` (${(e.score*100).toFixed(0)}%)`).join(', '): '—'}</span></div>
            <div className="analysis-row"><strong>Suicidal flag:</strong><span>{lastAnalysis.suicidal? '⚠️ yes':'no'}</span></div>
            {lastAnalysis.suicidal && (<div className="crisis">⚠️ It looks like this entry contains language that may suggest you are in crisis. If you are thinking about harming yourself, please contact local emergency services or hotlines right away. In India: 9152987821 (iCall).</div>)}
          </div>
        )}

        <div style={{marginTop:12}}>
          <PHQ9GAD7 onSave={(s)=>{ setScreening(s); alert('Screening saved — PHQ-9: '+s.phq9Score+' GAD-7: '+s.gad7Score) }} />
        </div>
      </div>

      <div className="history-area">
        <h3>Recent entries</h3>
        {history.length===0 && <div className="empty">No entries yet — try writing something small.</div>}
        {history.map(item=> (
          <div className="entry" key={item.id}>
            <div className="entry-meta">
              <div className="entry-date">{new Date(item.createdAt).toLocaleString()}</div>
              <div className="entry-score" style={{background: colorForScore(item.analysis.score)}}>{item.analysis.score}</div>
            </div>
            <div className="entry-text">{item.text}</div>
            <div className="entry-tags">
              {item.analysis.emotions.map((e,idx)=> <span key={idx} className="tag">{e.label}</span>)}
            </div>
            <div style={{marginTop:8}}>
              <button className="send-btn" onClick={()=>handleExport(item)}>Export (PDF)</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
