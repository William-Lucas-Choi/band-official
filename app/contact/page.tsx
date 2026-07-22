import { SiteNavigation } from "@/app/components/SiteNavigation";

export default function ContactPage() {
  return <main className="content-page"><SiteNavigation active="/contact" /><section className="content-hero"><p className="eyebrow">CONTACT & GOODS</p><h1>LET&apos;S MAKE<br />SOME <i>NOISE.</i></h1><p>出演依頼・取材・ファンレターはこちらから。</p></section><section className="contact-page-content"><div><p className="eyebrow">INQUIRIES</p><h2>お問い合わせ</h2><p>出演依頼、取材、その他のお問い合わせはメールでお送りください。</p><a className="solid-button" href="mailto:contact@lacrima-band.jp">CONTACT US <span>↗</span></a></div><div><p className="eyebrow">OFFICIAL GOODS</p><h2>オフィシャルグッズ</h2><p>限定アイテムやツアーグッズは、BASEオフィシャルストアでご案内します。</p><a className="outline-button" href="https://thebase.com/" target="_blank" rel="noreferrer">BASE STORE <span>↗</span></a></div></section></main>;
}
