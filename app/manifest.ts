import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PaperBloom | Stationery & Creative Studio",
    short_name: "PaperBloom",
    description: "PaperBloom stationery, printable designs, and creative templates.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f5",
    theme_color: "#214d3d",
    icons: [{ src: "/bookshop-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }]
  };
}
