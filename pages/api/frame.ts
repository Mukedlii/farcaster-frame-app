import type { NextApiRequest, NextApiResponse } from 'next';

/*
 * Farcaster Frame API
 *
 * Ez az API‑route ellenőrzi, hogy a felhasználó lájkolta és recastolta‑e a megadott castot.
 * Ha mindkettő megvan, megjeleníti a „Minteld az NFT-t” gombot. A mintelés itt nem történik meg,
 * azt külön backenddel kell megoldanod.
 */

// Környezeti változók (állítsd be a .env.local fájlban vagy Vercelben)
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY as string;
const CAST_HASH = process.env.CAST_HASH as string;
const BASE_URL = process.env.BASE_URL as string;

if (!NEYNAR_API_KEY || !CAST_HASH || !BASE_URL) {
  console.warn('Hiányzik a NEYNAR_API_KEY, CAST_HASH vagy BASE_URL változó.');
}

// Segédfüggvény: lekéri a kiválasztott cast like és recast listáját
async function getReactions() {
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=${CAST_HASH}&type=hash`;
  const res = await fetch(url, {
    headers: { api_key: NEYNAR_API_KEY },
  });
  if (!res.ok) throw new Error(`Failed to fetch reactions: ${res.statusText}`);
  const data = await res.json();
  return data.cast.reactions as {
    likes: Array<{ fid: number }>;
    recasts: Array<{ fid: number }>;
  };
}

// Segédfüggvény: validálja a messageBytes‑t, visszaadja az interaktor adatait
async function validateMessage(messageBytes: string) {
  const url = 'https://api.neynar.com/v2/farcaster/frame/validate';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      api_key: NEYNAR_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message_bytes_in_hex: messageBytes }),
  });
  if (!res.ok) throw new Error(`Failed to validate message: ${res.statusText}`);
  const data = await res.json();
  return data.action; // { interactor: { fid, username, custody_address }, tapped_button: { index } }
}

// Segédfüggvény: minimális HTML frame generálása egyetlen gombbal
function renderFrame(content: string, nextUrl: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:button:1" content="${content}" />
  <meta property="fc:frame:post_url" content="${nextUrl}" />
</head>
<body>${content}</body>
</html>`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');
  const { type } = req.query as { type?: string };
  const { trustedData } = req.body as { trustedData: { messageBytes: string } };
  if (!trustedData?.messageBytes) return res.status(400).send('Missing messageBytes');

  try {
    // Üzenet validálása, FID kinyerése
    const action = await validateMessage(trustedData.messageBytes);
    const fid: number = action.interactor.fid;

    switch (type) {
      case 'start': {
        // Kiírjuk, hogy like + recast szükséges
        const html = renderFrame('Lájkold és recastold a castot!', `${BASE_URL}/api/frame?type=recast`);
        return res.status(200).setHeader('Content-Type', 'text/html').send(html);
      }
      case 'recast': {
        // Like/recast ellenőrzés
        const reactions = await getReactions();
        const hasRecasted = reactions.recasts.some((r) => r.fid === fid);
        const hasLiked = reactions.likes.some((r) => r.fid === fid);
        if (!hasRecasted || !hasLiked) {
          const html = renderFrame('Előbb lájkold és recastold a castot!', `${BASE_URL}/api/frame?type=recast`);
          return res.status(200).setHeader('Content-Type', 'text/html').send(html);
        }
        // Mindkettő megvan: mint gomb megjelenítése
        const html = renderFrame('Minteld az NFT-t', `${BASE_URL}/api/frame?type=mint`);
        return res.status(200).setHeader('Content-Type', 'text/html').send(html);
      }
      case 'mint': {
        // Itt hajthatnád végre a valós mintelést – példa csak visszajelzést ad
        const html = renderFrame('Köszönjük, a mintelés megtörtént!', `${BASE_URL}/api/frame?type=start`);
        return res.status(200).setHeader('Content-Type', 'text/html').send(html);
      }
      default:
        return res.status(400).send('Invalid type');
    }
  } catch (err) {
    console.error(err);
    return res.status(500).send('Hiba történt');
  }
}
