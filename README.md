# Farcaster Frame App

This repository contains a minimal Next.js application that serves as a **Farcaster Frame**.  
It demonstrates how to implement gating logic that checks whether a user has **liked** and **recasted** a specific Farcaster cast before allowing them to mint an NFT.  
The minting itself is **not** performed here; you should integrate your own contract call or third‑party service when the user has satisfied the prerequisites.

## Features

* **Next.js API route** (`pages/api/frame.ts`) that:
  * Validates the incoming `messageBytes` from Farcaster via the Neynar API.
  * Fetches likes and recasts for a target cast and checks if the current user appears in both lists.
  * Returns a simple HTML frame with appropriate buttons depending on the current stage (`start`, `recast`, or `mint`).
* Example `.env.example` with placeholders for your **Neynar API key**, **cast hash**, and **base URL**.  Copy this to `.env.local` and set your real values before deploying.
* Standard Next.js project structure (`pages`, `api`, `public`).

## Setup

1. **Clone this repository** and install dependencies:

   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Copy the environment example** and edit values:

   ```bash
   cp .env.example .env.local
   # open .env.local and set NEYNAR_API_KEY, CAST_HASH and BASE_URL
   ```

3. **Run locally**:

   ```bash
   npm run dev
   ```

4. **Deploy** the project to a hosting provider like Vercel.  
   During deployment, set the same environment variables (`NEYNAR_API_KEY`, `CAST_HASH`, `BASE_URL`, and optionally `CONTRACT_ADDRESS`) in the provider’s dashboard.

## Usage

The frame endpoint is served from `/api/frame`.  Farcaster will call this endpoint with a `POST` request. The query parameter `type` should be one of:

* `start` – initial view prompting the user to like and recast.
* `recast` – checks if the user has completed both actions and shows the mint button if so.
* `mint` – final stage; here you can trigger your own mint logic and return a success message.

See `pages/api/frame.ts` for details.  You can customize the HTML returned by modifying the `renderFrame` helper.

## Important

* This project provides only the gating logic; it does **not** mint NFTs on its own.  You must handle minting (e.g. via a web3 backend) separately.
* Be mindful of OpenAI’s and Farcaster’s policies when integrating NFTs; ensure that your implementation complies with all legal and platform requirements.