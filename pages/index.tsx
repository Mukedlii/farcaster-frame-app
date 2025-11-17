import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Farcaster Frame Demo</title>
        <meta
          name="description"
          content="Farcaster Frame demo for NFT mint gating"
        />
      </Head>
      <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <h1>Farcaster Frame Demo</h1>
        <p>
          Ez a demo alkalmazás egy Farcaster frame létrehozását mutatja be, amely megköveteli a felhasználótól, hogy lájkolja és recastolja a kijelölt castot, mielőtt hozzáférne a mint gombhoz.
        </p>
        <p>
          {/* A következő linkkel manuálisan tesztelheted a frame működését */}
          <Link href="/api/frame?type=start">
            <a>Frame elindítása</a>
          </Link>
        </p>
      </main>
    </div>
  );
}
