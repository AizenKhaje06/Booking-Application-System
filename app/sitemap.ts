import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo";

const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/branches", changeFrequency: "monthly", priority: 0.9 },
  { path: "/reservations", changeFrequency: "weekly", priority: 0.9 },
  { path: "/events", changeFrequency: "weekly", priority: 0.9 },
  { path: "/auth/sign-in", changeFrequency: "yearly", priority: 0.3 },
  { path: "/auth/register", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
