import Image from "next/image";
import { SiteNavigation } from "@/app/components/SiteNavigation";

const members = [
  ["REI", "VOCAL", "The voice that turns silence into a scar.", "/member-rei.png"],
  ["KAI", "GUITAR", "Melody, distortion, devotion.", "/member-kai.png"],
  ["YU", "BASS", "A pulse beneath the velvet.", "/member-yu.png"],
  ["SENA", "DRUMS", "Beautifully merciless rhythm.", "/member-sena.png"],
];

export default function ProfilePage() {
  return <main className="content-page"><SiteNavigation active="/profile" /><section className="content-hero"><p className="eyebrow">PROFILE</p><h1>FOUR SOULS,<br /><i>ONE ECLIPSE.</i></h1><p>LACRIMA メンバープロフィール / Members</p></section><section className="profile-page-grid">{members.map(([name, role, quote, image], index) => <article key={name}><div className="profile-page-photo"><Image src={image} alt={`${name}, ${role}`} fill sizes="(max-width: 760px) 100vw, 50vw" /><span>{String(index + 1).padStart(2, "0")}</span></div><p>{role}</p><h2>{name}</h2><blockquote>{quote}</blockquote></article>)}</section></main>;
}
