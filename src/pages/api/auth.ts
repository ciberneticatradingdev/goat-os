import type { APIRoute } from 'astro';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = import.meta.env.JWT_SECRET;

export const POST: APIRoute = async ({ request }) => {
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7, authHeader.length);

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                return new Response(
                    JSON.stringify({ account: decoded.account }),
                    { status: 200, headers: { 'Content-Type': 'application/json' } }
                );
            } catch (error) {
                console.error('Token inválido o expirado:', error);
                return new Response(
                    JSON.stringify({ error: 'Token inválido o expirado' }),
                    { status: 401, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Leer el cuerpo de la solicitud
        const requestBody = await request.text();
        const { account, signature, message } = JSON.parse(requestBody);

        // Verificar que todos los campos requeridos están presentes
        if (!account || !signature || !message) {
            console.error("Solicitud inválida. Faltan campos:", { account, signature, message });
            return new Response(
                JSON.stringify({ error: 'Solicitud inválida: faltan campos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Verificar la firma utilizando ethers.js
        const signerAddress = ethers.verifyMessage(message, signature);

        // Comparar la dirección firmante con la cuenta proporcionada
        if (signerAddress.toLowerCase() === account.toLowerCase()) {
            // Generar un token JWT si la firma es válida
            const token = jwt.sign(
                { account },
                JWT_SECRET,
                { expiresIn: '1h' } // El token expira en 1 hora
            );

            return new Response(
                JSON.stringify({ token }),
                { status: 200, headers: { 'Content-Type': 'application/json' } }
            );
        } else {
            console.error("Firma no válida:", { account, signerAddress, signature, message });
            return new Response(
                JSON.stringify({ error: 'Firma no válida' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }
    } catch (error) {
        console.error('Error al procesar la solicitud:', error);
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
