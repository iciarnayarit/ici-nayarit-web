import { NextRequest } from 'next/server';
//import { Resend } from 'resend';

//const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  /*try {
    const { email, name, message } = await req.json();

    if (!name || !message) {
      return NextResponse.json({ error: 'Nombre y mensaje son requeridos.' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: email, // This should be a verified domain in Resend
      to: 'iciarnayarit@gmail.com', // Your destination email
      subject: `Nuevo mensaje de contacto de: ${name}`,
      html: `<p>Has recibido un nuevo mensaje desde el formulario de contacto de la web.</p>
             <p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Mensaje:</strong></p>
             <p>${message}</p>`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Correo enviado exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Ocurrió un error al procesar la solicitud.' }, { status: 500 });
  }*/
}
