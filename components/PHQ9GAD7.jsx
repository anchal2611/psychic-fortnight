import { useState } from 'react'

const PHQ9_ITEMS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed OR being so fidgety or restless that you have been moving a lot more than usual',
  'Thoughts that you would be better off dead or of hurting yourself in some way'
]

const GAD7_ITEMS = [
  'Feeling nervous, anxious or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid as if something awful might happen'
]

export default function PHQ9GAD7({onSave}){
  const [phq9, setPhq9] = useState(Array(9).fill(0))
  const [gad7, setGad7] = useState(Array(7).fill(0))

  function handleChange(setter, arr, idx, value){
    const copy = [...arr]
    copy[idx] = Number(value)
    setter(copy)
  }

  function score(arr){ return arr.reduce((a,b)=>a+b,0) }

  function handleSave(){
    const phq9Score = score(phq9)
    const gad7Score = score(gad7)
    onSave({ phq9Score, gad7Score, phq9Responses: phq9, gad7Responses: gad7 })
  }

  return (
    <div className="screening-root">
      <h4>PHQ-9 (Depression)</h4>
      <p>Over the last 2 weeks, how often have you been bothered by any of the following problems?</p>
      {PHQ9_ITEMS.map((q,i)=> (
        <div key={i} className="q-row">
          <div className="q-text">{i+1}. {q}</div>
          <select value={phq9[i]} onChange={e=>handleChange(setPhq9, phq9, i, e.target.value)}>
            <option value={0}>Not at all (0)</option>
            <option value={1}>Several days (1)</option>
            <option value={2}>More than half the days (2)</option>
            <option value={3}>Nearly every day (3)</option>
          </select>
        </div>
      ))}

      <h4>GAD-7 (Anxiety)</h4>
      {GAD7_ITEMS.map((q,i)=> (
        <div key={i} className="q-row">
          <div className="q-text">{i+1}. {q}</div>
          <select value={gad7[i]} onChange={e=>handleChange(setGad7, gad7, i, e.target.value)}>
            <option value={0}>Not at all (0)</option>
            <option value={1}>Several days (1)</option>
            <option value={2}>More than half the days (2)</option>
            <option value={3}>Nearly every day (3)</option>
          </select>
        </div>
      ))}

      <div style={{marginTop:12}}>
        <button className="send-btn" onClick={handleSave}>Save screening results</button>
      </div>
    </div>
  )
}
