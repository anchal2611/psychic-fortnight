import PDFDocument from 'pdfkit'

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'})
  const secret = req.headers['x-export-secret']
  if(!secret || secret !== process.env.EXPORT_SECRET) return res.status(401).json({error:'Unauthorized'})

  try{
    const { entry, phq9Score, gad7Score, meta } = req.body
    // Create PDF in memory and stream back
    const doc = new PDFDocument({size:'A4', margin:50})
    res.setHeader('Content-Type','application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="zen_export_${Date.now()}.pdf"`)

    doc.fontSize(18).text('ZEN — Clinical Export', {align:'center'})
    doc.moveDown()
    doc.fontSize(12).text(`Exported at: ${new Date().toLocaleString()}`)
    if(meta?.user) doc.text(`User: ${meta.user}`)
    doc.moveDown()

    doc.fontSize(14).text('PHQ-9 Score: ' + (phq9Score ?? 'N/A'))
    doc.text('GAD-7 Score: ' + (gad7Score ?? 'N/A'))
    doc.moveDown()

    doc.fontSize(13).text('Journal Entry:', {underline:true})
    doc.moveDown(0.5)
    doc.fontSize(11).text(entry || '', {align:'left'})

    doc.end()
    doc.pipe(res)
  }catch(err){
    console.error(err)
    res.status(500).json({error:'Failed to create PDF'})
  }
}
