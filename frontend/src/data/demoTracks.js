/**
 * Seeded Demo Tracks Data
 * Styled with Studio Ledger palette (Brushed brass, dim brass, and warm ash).
 */

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
    splits: [
      { role: "Artist", name: "Luma Grey", percent: 55, bps: 5500, color: "#C9A24B" },
      { role: "Producer", name: "Zane Vance", percent: 25, bps: 2500, color: "#8A7238" },
      { role: "Songwriter", name: "Nico Thorne", percent: 20, bps: 2000, color: "#B2ABA0" },
    ]
  }
];
