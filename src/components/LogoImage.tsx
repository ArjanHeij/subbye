"use client";

import { useEffect, useMemo, useState } from "react";
import { getLocalLogo, getLogoDevUrl, normalizeLogoName } from "@/lib/getLogo";

type Props = {
  name: string;
  className?: string;
  alt?: string;
};

export default function LogoImage({ name, className = "", alt }: Props) {
  const localLogo = useMemo(() => getLocalLogo(name), [name]);
  const normalized = useMemo(() => normalizeLogoName(name), [name]);

  const [src, setSrc] = useState<string>(localLogo ?? "/logos/default.png");

  useEffect(() => {
    let cancelled = false;

    async function resolveLogo() {
      if (localLogo) {
        setSrc(localLogo);
        return;
      }

      const cacheKey = `logo-domain:${normalized}`;
      const cachedDomain =
        typeof window !== "undefined" ? localStorage.getItem(cacheKey) : null;

      if (cachedDomain) {
        setSrc(getLogoDevUrl(cachedDomain));
        return;
      }

      try {
        const res = await fetch("/api/logo/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });

        const data = await res.json().catch(() => null);

        if (!cancelled && res.ok && data?.domain) {
          localStorage.setItem(cacheKey, data.domain);
          setSrc(getLogoDevUrl(data.domain));
        } else if (!cancelled) {
          setSrc("/logos/default.png");
        }
      } catch {
        if (!cancelled) {
          setSrc("/logos/default.png");
        }
      }
    }

    resolveLogo();

    return () => {
      cancelled = true;
    };
  }, [name, normalized, localLogo]);

  return (
    <img
      src={src}
      alt={alt ?? name}
      className={className}
      onError={(e) => {
        e.currentTarget.src = "/logos/default.png";
      }}
    />
  );
}