import type { Paper } from "@/types/journal";

export const papers: Record<
  Paper,
  {
    background: string;
    border: string;
  }
> = {
  cream: {
    background: "#FBF6EE",
    border: "#E8DCC8",
  },

  sage: {
    background: "#F0F5EE",
    border: "#D6E3D0",
  },

  mist: {
    background: "#F2F5F7",
    border: "#D8E1E6",
  },

  peach: {
    background: "#FBF1EB",
    border: "#E8D4C6",
  },

  linen: {
    background: "#F6F3EF",
    border: "#E1D9CF",
  },
};