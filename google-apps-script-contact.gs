/**
 * Google Apps Script endpoint for the Vorgangskern contact form.
 * 1. Create a new Apps Script project under the business Google account.
 * 2. Paste this file, set SCRIPT_SECRET in Project Settings -> Script Properties.
 * 3. Deploy as Web App, execute as yourself, access only as appropriate for the deployment.
 * 4. Store the deployment URL as CONTACT_WEBHOOK_URL and the same secret as
 *    CONTACT_WEBHOOK_SECRET in Cloudflare Pages environment variables.
 */
function doPost(e) {
  try {
    const expected = PropertiesService.getScriptProperties().getProperty('SCRIPT_SECRET');
    const received = e && e.parameter && e.parameter.secret;
    // Apps Script does not expose arbitrary headers reliably in all deployments.
    // For production, use a secret query parameter in CONTACT_WEBHOOK_URL or a dedicated mail provider.
    if (expected && received !== expected) {
      return ContentService.createTextOutput(JSON.stringify({ok:false,error:'unauthorized'})).setMimeType(ContentService.MimeType.JSON);
    }
    const data = JSON.parse(e.postData.contents || '{}');
    if (!data.email || !data.name || !data.company) throw new Error('Pflichtfelder fehlen');
    const subject = 'Projektanfrage: ' + (data.service || 'Digitales Vorhaben') + ' – ' + data.company;
    const body = [
      'Neue Anfrage über vorgangskern.com', '',
      'Organisation: ' + (data.company || data.organization || '—'),
      'Ansprechpartner: ' + (data.name || '—'),
      'E-Mail: ' + (data.email || '—'),
      'Telefon: ' + (data.phone || '—'),
      'Status: ' + (data.phase || '—'),
      'Leistungsfeld: ' + (data.service || '—'),
      'Termin: ' + (data.deadline || '—'),
      'Referenz / Link: ' + (data.reference || '—'), '',
      'Beschreibung:', data.message || '—'
    ].join('\n');
    MailApp.sendEmail({to:'info@vorgangskern.com',subject:subject,body:body,replyTo:data.email,name:'Vorgangskern Website'});
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:String(err)})).setMimeType(ContentService.MimeType.JSON);
  }
}
