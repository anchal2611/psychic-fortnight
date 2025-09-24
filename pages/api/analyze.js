import axios from 'axios'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const { text } = req.body
    if(!text) return res.status(400).json({error:'No text provided'})

    const model = process.env.HUGGINGFACE_MODEL || 'j-hartmann/emotion-english-distilroberta-base'
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if(!apiKey) return res.status(500).json({error:'Hugging Face API key not configured'})

    const hfUrl = `https://api-inference.huggingface.co/models/${model}`
    const hfRes = await axios.post(hfUrl, { inputs: text }, {
      headers: { Authorization: `Bearer ${apiKey}` },
      timeout: 20000
    })

    // The HF model typically returns array of {label,score} for classification models
    const predictions = hfRes.data
    // Normalize to top k emotions
    const emotions = Array.isArray(predictions) ? predictions.slice(0,5).map(p=>({label:p.label,score:p.score})) : []

    return res.status(200).json({emotions, raw: predictions})
  }catch(err){
    console.error(err.response?.data || err.message)
    return res.status(500).json({error:'Analysis failed'})
  }
}
