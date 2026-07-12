/**
 * Parse YouTube / Vimeo / direct video URLs for course lesson playback.
 */
export function parseVideoPlayback(url: string):
  | { kind: "youtube"; embedSrc: string }
  | { kind: "vimeo"; embedSrc: string }
  | { kind: "direct"; src: string }
  | { kind: "external"; href: string } {
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      let vid = u.searchParams.get("v");
      if (!vid && u.pathname.startsWith("/embed/")) {
        vid = u.pathname.slice("/embed/".length).split("/")[0] || null;
      }
      if (!vid && u.pathname.startsWith("/shorts/")) {
        vid = u.pathname.slice("/shorts/".length).split("/")[0] || null;
      }
      if (vid && /^[\w-]{6,}$/.test(vid)) {
        return {
          kind: "youtube",
          embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0`,
        };
      }
    }

    if (host === "youtu.be") {
      const vid = u.pathname.replace(/^\//, "").split("/")[0];
      if (vid && /^[\w-]{6,}$/.test(vid)) {
        return {
          kind: "youtube",
          embedSrc: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(vid)}?rel=0`,
        };
      }
    }

    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) {
        return { kind: "vimeo", embedSrc: `https://player.vimeo.com/video/${id}` };
      }
    }

    if (/\.(mp4|webm|ogg)(\?|$)/i.test(u.pathname)) {
      return { kind: "direct", src: trimmed };
    }

    return { kind: "external", href: trimmed };
  } catch {
    return { kind: "external", href: trimmed };
  }
}
