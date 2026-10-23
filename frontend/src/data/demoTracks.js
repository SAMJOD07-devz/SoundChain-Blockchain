/**
 * Seeded Demo Tracks Data with Decentralized IPFS Content Identifiers
 * Styled with Studio Ledger palette (Brushed brass, dim brass, and warm ash).
 */
import { getCustomTracks } from "../utils/ipfs";

export const DEMO_TRACKS = [
  {
    id: "track-1",
    bytes32Id: "0x8827a3ed6bfcd7052650855c0a4a2f44b8a8a7b585ec32026997ba6b4d7e2cc0",
    title: "Midnight Signals",
    artist: "Nova Vale",
    album: "Master Lacquer Vol. 1",
    genre: "Analogue Synth",
    duration: "3:42",
    durationSec: 222,
    bpm: 120,
    catalogNo: "SL-001",
    description: "Mastered at 24-bit/96kHz. Pure analogue oscillators over tape-saturated percussion and tight low-end fidelity.",
    ipfsCid: "ipfs://bafybeicv3l6s76evptz7i7y3w3r2764f6oowc4yq4c33f677n6h66s4a2y",
    audioCid: "ipfs://bafybeigx2t52qguzg3t4oimn544d32a4e2s2x3f3g4h5j6k7l8m9n0",
    coverCid: "ipfs://bafybeih5a4s3d2f1g0h9j8k7l6z5x4c3v2b1n0m9a8s7d6f5g4h3j2k",
    isPinnedToIPFS: true,
    splits: [
      { role: "Artist", name: "Nova Vale", percent: 50, bps: 5000, color: "#C9A24B" },
      { role: "Producer", name: "Kaelen Voss", percent: 30, bps: 3000, color: "#8A7238" },
      { role: "Songwriter", name: "Elena Rostova", percent: 20, bps: 2000, color: "#B2ABA0" },
    ]
  },
  {
    id: "track-2",
    bytes32Id: "0x4a785a19c209f4d006cc934b2f946473c94d06f7b050e5189a5aff04d32814c3",
    title: "Glass Horizon",
    artist: "Theo Park",
    album: "Studio Sessions '26",
    genre: "Ambient Minimal",
    duration: "4:15",
    durationSec: 255,
    bpm: 95,
    catalogNo: "SL-002",
    description: "Direct-to-disc lacquer cut. Resonant upright piano layered through spring reverb and room acoustic microphones.",
    ipfsCid: "ipfs://bafybeifk4v2i46a2tcvh7q3q2w7jnv5g3wom5qvwg43v36v45f2a4f4b2y",
    audioCid: "ipfs://bafybeia7u2m5q3p9x4b6n8v0c2z4l6k8j0h2g4f6d8s0a2p4o6i8u0",
    coverCid: "ipfs://bafybeid3f5g7h9j1k3l5z7x9c1v3b5n7m9a1s3d5f7g9h1j3k5l7z9",
    isPinnedToIPFS: true,
    splits: [
      { role: "Artist", name: "Theo Park", percent: 60, bps: 6000, color: "#C9A24B" },
      { role: "Producer", name: "Soren Reed", percent: 25, bps: 2500, color: "#8A7238" },
      { role: "Songwriter", name: "Maya Lin", percent: 15, bps: 1500, color: "#B2ABA0" },
    ]
  },
  {
    id: "track-3",
    bytes32Id: "0xfeebb70b16ef229c833420bc87779d2e0451215eac8f847a68e2e669c68c7e1c",
    title: "Afterglow Circuit",
    artist: "Luma Grey",
    album: "Tape Loops & Wire",
    genre: "Electro Acoustic",
    duration: "3:18",
    durationSec: 198,
    bpm: 128,
    catalogNo: "SL-003",
    description: "Reel-to-reel master transfer with warm tube harmonic distortion, live upright bass, and vintage plate echo.",
    ipfsCid: "ipfs://bafybeih4j3z7a4a2w6c5k6d3y7a5q6w3e2r1t4y5u6i7o8p9a0s1d2f3g4",
    audioCid: "ipfs://bafybeic6x8z0v2b4n6m8a0s2d4f6g8h0j2k4l6z8x0c2v4b6n8m0a2",
    coverCid: "ipfs://bafybeif9s7d5f3g1h9j7k5l3z1x9c7v5b3n1m9a7s5d3f1g9h7j5k3",
    isPinnedToIPFS: true,
    splits: [
      { role: "Artist", name: "Luma Grey", percent: 55, bps: 5500, color: "#C9A24B" },
      { role: "Producer", name: "Zane Vance", percent: 25, bps: 2500, color: "#8A7238" },
      { role: "Songwriter", name: "Nico Thorne", percent: 20, bps: 2000, color: "#B2ABA0" },
    ]
  }
];

/**
 * Returns complete combined catalog: seeded demo masters + user-registered IPFS tracks
 */
export function getAllTracks() {
  const custom = getCustomTracks();
  return [...custom, ...DEMO_TRACKS];
}
