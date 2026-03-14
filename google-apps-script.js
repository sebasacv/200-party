// ============================================
// INSTRUCCIONES PARA CONFIGURAR EL RSVP
// ============================================
//
// 1. Andá a https://sheets.google.com y creá una hoja nueva
//    - Poné estos encabezados en la fila 1: Timestamp | Nombre | Asiste | Cantidad | Mensaje
//
// 2. Andá a Extensiones > Apps Script
//
// 3. Borrá todo lo que haya y pegá este código
//
// 4. Hacé clic en "Implementar" > "Nueva implementación"
//    - Tipo: "Aplicación web"
//    - Ejecutar como: "Yo" (tu cuenta)
//    - Quién tiene acceso: "Cualquier persona"
//    - Hacé clic en "Implementar"
//
// 5. Copiá la URL que te da y reemplazá YOUR_GOOGLE_APPS_SCRIPT_URL_HERE
//    en el archivo index.html
//
// ============================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      data.nombre || '',
      data.asiste || '',
      data.cantidad || '',
      data.mensaje || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('El RSVP de los 200 años está funcionando 🎉')
    .setMimeType(ContentService.MimeType.TEXT);
}
