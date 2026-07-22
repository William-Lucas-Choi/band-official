import Image from "next/image";
import { SiteNavigation } from "@/app/components/SiteNavigation";

const photos = [
  ["/member-rei.png", "REI — VOCAL"],
  ["/member-kai.png", "KAI — GUITAR"],
  ["/member-yu.png", "YU — BASS"],
  ["/member-sena.png", "SENA — DRUMS"],
];

export default function MediaPage() {
  return <main className="content-page"><SiteNavigation active="/media" /><section className="content-hero"><p className="eyebrow">MEDIA</p><h1>LOOK<br /><i>INSIDE.</i></h1><p>映像と写真 / Video and artist photography</p></section><section className="media-page-content"><a className="featured-video" href="https://www.youtube.com/" target="_blank" rel="noreferrer"><span>▶</span><div><p className="eyebrow">OFFICIAL MUSIC VIDEO</p><h2>LILY IN THE<br /><i>ASHES</i></h2><small>WATCH ON YOUTUBE ↗</small></div></a><div className="photo-grid">{photos.map(([src, alt]) => <figure key={src}><div><Image src={src} alt={alt} fill sizes="(max-width: 760px) 50vw, 25vw" /></div><figcaption>{alt}</figcaption></figure>)}</div></section></main>;
}
