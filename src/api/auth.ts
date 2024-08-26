import type { APIRoute } from 'astro';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET; // Debería estar en un archivo .env

export const post: APIRoute = async ({ request }) => {
  console.log('estoy aqui')
  const { account, signature, message } = await request.json();
  console.log(JWT_SECRET)

  if (!account || !signature || !message) {
    return new Response(
      JSON.stringify({ error: 'Solicitud inválida' }),
      { status: 400 }
    );
  }

  try {
    // Recuperar la dirección de la cuenta firmante desde la firma
    const signerAddress = ethers.verifyMessage(message, signature);

    // Verificar si la dirección firmante es la misma que la cuenta
    if (signerAddress.toLowerCase() === account.toLowerCase()) {
      // Generar un token JWT válido por 1 hora
      const token = jwt.sign(
        { account },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return new Response(
        JSON.stringify({ token }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Firma no válida' }),
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error al verificar la firma:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500 }
    );
  }
};
