export function getLogo(name: string) {
  const n = name.toLowerCase();

  if (n.includes("netflix")) return "/logos/netflix.png";
  if (n.includes("spotify")) return "/logos/spotify.png";
  if (n.includes("disney")) return "/logos/disney.png";
  if (n.includes("youtube")) return "/logos/youtube.png";
  if (n.includes("amazon")) return "/logos/amazonprime.png";
  if (n.includes("hbo")) return "/logos/hbo.png";
  if (n.includes("basic")) return "/logos/basicfit.png";
  if (n.includes("apple")) return "/logos/apple.png";
  if (n.includes("adobe")) return "/logos/adobe.png";
  if (n.includes("notion")) return "/logos/notion.png";

  return "/logos/default.png";
}