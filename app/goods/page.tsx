import { SiteNavigation } from "@/app/components/SiteNavigation";

export default function GoodsPage() {
  return <main className="content-page"><SiteNavigation active="/goods" /><section className="content-hero"><p className="eyebrow">OFFICIAL GOODS</p><h1>WEAR THE<br /><i>DARK.</i></h1><p>オフィシャルグッズ / Official merchandise</p></section><section className="goods-page-content"><div><p className="eyebrow">LACRIMA OFFICIAL STORE</p><h2>オフィシャルグッズ</h2><p>ツアーグッズ、限定アイテムなどはBASEオフィシャルストアでご案内します。</p><a className="solid-button" href="https://thebase.com/" target="_blank" rel="noreferrer">OPEN BASE STORE <span>↗</span></a></div></section></main>;
}
