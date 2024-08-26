import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  console.log('Raw Request Body:', rawBody);
  return new Response(JSON.stringify({ body: rawBody }), { status: 200 });
};