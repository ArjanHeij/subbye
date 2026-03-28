export function normalizeLogoName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getLocalLogo(name: string) {
  const n = normalizeLogoName(name).replace(/\s+/g, "");

  if (n.includes("netflix")) return "/logos/netflix.png";
  if (n.includes("spotify")) return "/logos/spotify.png";
  if (n.includes("disney")) return "/logos/disneyplus.png";
  if (n.includes("youtube")) return "/logos/youtube.png";
  if (n.includes("amazon") || n.includes("prime")) return "/logos/amazon.png";
  if (n.includes("hbo")) return "/logos/hbo.png";
  if (n.includes("basicfit")) return "/logos/basicfit.png";
  if (n.includes("applemusic")) return "/logos/applemusic.png";
  if (n.includes("appletv")) return "/logos/appletv.png";
  if (n.includes("apple")) return "/logos/apple.png";
  if (n.includes("adobe")) return "/logos/adobe.png";
  if (n.includes("notion")) return "/logos/notion.png";

  return null;
}

export function getLogoDevUrl(domain: string) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_PUBLIC_TOKEN;

  if (!token || !domain) return "/logos/default.png";

  return `https://img.logo.dev/${domain}?token=${token}&size=128&format=png`;
}

export function getLogo(name: string) {
  return getLocalLogo(name) ?? "/logos/default.png";
}