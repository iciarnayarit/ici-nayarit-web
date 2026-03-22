import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    // 1. Extraemos metadata de los headers en lugar de FormData
    const songName = decodeURIComponent(req.headers.get('X-Song-Name') || 'Desconocida');
    const author = decodeURIComponent(req.headers.get('X-Author') || 'Desconocido');
    const originalFileName = decodeURIComponent(req.headers.get('X-File-Name') || 'audio.mp3');
    const fileType = req.headers.get('X-File-Type') || 'audio/mpeg';

    // 2. Leemos todo el cuerpo binario de la subida
    const arrayBuffer = await req.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'No se recibió ningún archivo o está vacío.' }, { status: 400 });
    }

    // 1. Verificamos si tenemos las credenciales en el archivo .env.local
    if (
      !process.env.GOOGLE_CLIENT_EMAIL ||
      !process.env.GOOGLE_PRIVATE_KEY ||
      !process.env.GOOGLE_DRIVE_FOLDER_ID
    ) {
      console.warn(
        '⚠️ Aviso: Faltan credenciales de Google Drive en las variables de entorno. Simulando subida.'
      );
      // Para no romper la interfaz del usuario antes de que configuren el Drive,
      // devolvemos un éxito simulado si no hay credenciales.
      return NextResponse.json({
        success: true,
        warning: 'API not configured, simulating success',
      });
    }

    // 2. Autenticamos con Google usando la cuenta de servicio
    
    // Formateamos la clave para evitar el error ERR_OSSL_UNSUPPORTED
    // Removemos comillas extrañas al inicio/final e interpretamos los saltos de línea
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      .replace(/^"|"$/g, '')
      .replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // 5. Convertimos el archivo binario a Stream para Google Drive
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    // 6. Creamos el nombre final del archivo
    const extension = originalFileName.includes('.') ? originalFileName.substring(originalFileName.lastIndexOf('.')) : '';
    const fileName = `${songName} - ${author}${extension}`;

    // 7. Subimos directament a Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // El folder donde queremos guardar
      },
      media: {
        mimeType: fileType,
        body: stream,
      },
      fields: 'id',
    });

    return NextResponse.json({ success: true, fileId: driveResponse.data.id });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json(
      { error: 'Fallo al subir el archivo a Google Drive' },
      { status: 500 }
    );
  }
}
