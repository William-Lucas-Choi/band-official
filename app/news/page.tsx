import { SiteNavigation } from "@/app/components/SiteNavigation";

const news = [
  ["2026.07.12", "RELEASE", "New single ‘Lily in the Ashes’ 配信開始", "各ストリーミングサービスにて配信開始。"],
  ["2026.07.01", "LIVE", "ECLIPSE TOUR 2026 開催決定", "東京・大阪・名古屋を巡るワンマンツアーを開催します。"],
  ["2026.06.18", "MEDIA", "最新アーティスト写真を公開しました", "LACRIMAの新しいビジュアルを公開しました。"],
  ["2026.05.28", "LIVE", "SHIBUYA REX ワンマン公演決定", "チケットの詳細はスケジュールページをご確認ください。"],
];

export default function NewsPage() {
  return <main className="content-page"><SiteNavigation active="/news" /><section className="content-hero"><p className="eyebrow">NEWS</p><h1>FROM THE<br /><i>VEIL.</i></h1><p>バンドからのお知らせ / Latest news from LACRIMA</p></section><section className="content-list news-page-list">{news.map(([date, category, title, description]) => <article key={title}><div><time>{date}</time><b>{category}</b></div><h2>{title}</h2><p>{description}</p></article>)}</section></main>;
}
