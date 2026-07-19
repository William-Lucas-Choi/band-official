"use client";

import { useEffect, useState } from "react";

const schedules = [
  ["08.24", "SUN", "TOKYO", "Shibuya REX", "ONEMAN LIVE 2026 \"SILENCE OF ROSES\""],
  ["09.06", "SAT", "OSAKA", "OSAKA MUSE", "ECLIPSE TOUR 2026"],
  ["09.21", "SUN", "NAGOYA", "ell.FITS ALL", "ECLIPSE TOUR 2026"],
];

const members = [
  ["REI", "VOCAL", "The voice that turns silence into a scar."],
  ["KAI", "GUITAR", "Melody, distortion, devotion."],
  ["YU", "BASS", "A pulse beneath the velvet."],
  ["SENA", "DRUMS", "Beautifully merciless rhythm."],
];

type Language = "ja" | "en";

const copy = {
  ja: {
    nav: ["スケジュール", "ニュース", "メディア", "プロフィール", "コンタクト"], menu: "メニュー", heroLabel: "ヴィジュアルロックバンド · 東京",
    heroDescription: <>美しさと轟音のあいだ。<br />LACRIMAの新しい章が始まります。</>, upcoming: "次回のライヴ", scroll: "SCROLL TO DESCEND",
    scheduleLabel: "01 / ライヴスケジュール", scheduleButton: "すべてのスケジュール", calendar: "Google Calendar連携予定 · スケジュールは管理画面から即時更新されます。",
    newsLabel: "02 / 最新ニュース", news: [["2026.07.12", "RELEASE", "New single ‘Lily in the Ashes’ 配信開始"], ["2026.07.01", "LIVE", "ECLIPSE TOUR 2026 開催決定"], ["2026.06.18", "MEDIA", "最新アーティスト写真を公開しました"]],
    mediaLabel: "03 / ビデオ & フォト", mediaDescription: <>ライヴの余韻と、新しい映像たち。<br />LACRIMAの世界をスクリーンの向こうで。</>, youtube: "YOUTUBEで見る", youtubeNote: "YouTubeに公開した映像が自動で表示されます。",
    profileLabel: "04 / プロフィール", history: "バンドヒストリー", historyText: <>結成 · 1st single ‘Veil’ リリース <span>—</span> <b>2023</b> 全国12都市ツアー <span>—</span> <b>2026</b> NEW ERA BEGINS</>,
    contactLabel: "05 / コンタクト & グッズ", contactDescription: <>出演依頼・取材・ファンレターはこちらから。<br />オフィシャルグッズはBASEストアでお求めいただけます。</>, contact: "お問い合わせ", goods: "オフィシャルグッズ",
    videoInfo: "オフィシャルミュージックビデオ", videoDescription: "オフィシャルMVの表示エリアです。公開時には、管理画面で登録したYouTube動画をこの場所で再生できます。", videoButton: "YOUTUBE連携準備中", openMenu: "メニューを開く", closeMenu: "メニューを閉じる", closeVideo: "動画ウィンドウを閉じる",
  },
  en: {
    nav: ["SCHEDULE", "NEWS", "MEDIA", "PROFILE", "CONTACT"], menu: "MENU", heroLabel: "VISUAL ROCK BAND · TOKYO",
    heroDescription: <>Between beauty and distortion.<br />A new chapter of LACRIMA begins.</>, upcoming: "UPCOMING LIVE", scroll: "SCROLL TO DESCEND",
    scheduleLabel: "01 / LIVE SCHEDULE", scheduleButton: "ALL SCHEDULE", calendar: "Google Calendar integration coming soon · Schedules update instantly from the admin panel.",
    newsLabel: "02 / LATEST NEWS", news: [["2026.07.12", "RELEASE", "New single ‘Lily in the Ashes’ is out now"], ["2026.07.01", "LIVE", "ECLIPSE TOUR 2026 announced"], ["2026.06.18", "MEDIA", "New artist photography released"]],
    mediaLabel: "03 / VIDEO & PHOTO", mediaDescription: <>The afterglow of the stage, and new moving images.<br />Step inside the world of LACRIMA.</>, youtube: "WATCH ON YOUTUBE", youtubeNote: "New YouTube uploads will appear here automatically.",
    profileLabel: "04 / PROFILE", history: "OUR HISTORY", historyText: <>Formed · debut single ‘Veil’ <span>—</span> <b>2023</b> 12-city tour across Japan <span>—</span> <b>2026</b> NEW ERA BEGINS</>,
    contactLabel: "05 / CONTACT & GOODS", contactDescription: <>For booking, press, and fan mail.<br />Official goods are available on our BASE store.</>, contact: "CONTACT US", goods: "OFFICIAL GOODS",
    videoInfo: "OFFICIAL MUSIC VIDEO", videoDescription: "This is the official music video area. Once connected, a YouTube video registered in the admin will play here.", videoButton: "YOUTUBE CONNECTION SOON", openMenu: "Open menu", closeMenu: "Close menu", closeVideo: "Close video window",
  },
} as const;

export default function Home() {
  const [language, setLanguage] = useState<Language>("ja");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const languageTimer = window.setTimeout(() => {
      if (navigator.language.toLowerCase().startsWith("en")) setLanguage("en");
    }, 0);

    return () => window.clearTimeout(languageTimer);
  }, []);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const t = copy[language];
  const closeMenu = () => setIsMenuOpen(false);

  return <main>
    <section className="hero" id="home">
      <nav className="nav" aria-label="Main menu">
        <a className="logo" href="#home">LACRIMA</a>
        <div className="nav-links">
          <a href="#schedule">{t.nav[0]}</a><a href="#news">{t.nav[1]}</a><a href="#media">{t.nav[2]}</a><a href="#profile">{t.nav[3]}</a><a href="#contact">{t.nav[4]}</a>
        </div>
        <div className="language-switcher" aria-label="Language selector"><button type="button" className={language === "ja" ? "active" : ""} onClick={() => setLanguage("ja")}>JP</button><span>/</span><button type="button" className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button></div>
        <button className="menu" type="button" onClick={() => setIsMenuOpen(true)} aria-label={t.openMenu}>{t.menu}</button>
      </nav>
      <div className="hero-copy"><p className="eyebrow">{t.heroLabel}</p><h1>BEAUTY<br /><em>IN THE</em> DARK.</h1><p className="hero-description">{t.heroDescription}</p><a className="text-link" href="#schedule">{t.upcoming} <span>↘</span></a></div>
      <p className="scroll">{t.scroll} <span>↓</span></p>
    </section>

    <div className={`mobile-menu ${isMenuOpen ? "is-open" : ""}`} aria-hidden={!isMenuOpen}>
      <button className="mobile-menu-close" type="button" onClick={closeMenu} aria-label={t.closeMenu}>×</button><a className="logo" href="#home" onClick={closeMenu}>LACRIMA</a>
      <div className="mobile-menu-links"><a href="#schedule" onClick={closeMenu}>{t.nav[0]}</a><a href="#news" onClick={closeMenu}>{t.nav[1]}</a><a href="#media" onClick={closeMenu}>{t.nav[2]}</a><a href="#profile" onClick={closeMenu}>{t.nav[3]}</a><a href="#contact" onClick={closeMenu}>{t.nav[4]}</a></div><p>{t.heroLabel}</p>
    </div>

    <section className="section schedule-section" id="schedule"><div className="section-heading"><p>{t.scheduleLabel}</p><h2>THE NEXT<br /><i>RITUALS</i></h2></div><div className="schedule-list">
      {schedules.map(([date, day, city, venue, title]) => <article className="schedule-item" key={date}><div className="date"><strong>{date}</strong><span>{day}</span></div><div><p className="city">{city}</p><h3>{venue}</h3><p>{title}</p></div><a href="#contact" aria-label={`${venue} details`}>↗</a></article>)}
      <a className="outline-button" href="#contact">{t.scheduleButton} <span>→</span></a><p className="integration-note">{t.calendar}</p>
    </div></section>

    <section className="section news-section" id="news"><div className="section-heading"><p>{t.newsLabel}</p><h2>FROM<br /><i>THE VEIL</i></h2></div><div className="news-list">{t.news.map(([date, category, title]) => <a href="#contact" className="news-item" key={title}><time>{date}</time><b>{category}</b><h3>{title}</h3><span>→</span></a>)}</div></section>

    <section className="media" id="media"><div className="media-video"><button type="button" onClick={() => setIsVideoOpen(true)} aria-label={t.videoInfo}>▶</button><p>{t.videoInfo}</p><h2>LILY IN THE<br /><i>ASHES</i></h2></div><div className="media-copy"><p className="eyebrow">{t.mediaLabel}</p><h2>TAKE A<br />LOOK <i>INSIDE.</i></h2><p>{t.mediaDescription}</p><a className="text-link" href="#contact">{t.youtube} <span>↗</span></a><small>{t.youtubeNote}</small></div></section>

    <section className="section profile-section" id="profile"><div className="section-heading"><p>{t.profileLabel}</p><h2>FOUR SOULS,<br /><i>ONE ECLIPSE.</i></h2></div><div className="member-grid">{members.map(([name, role, quote], index) => <article className={`member member-${index + 1}`} key={name}><div className="member-portrait"><span>{String(index + 1).padStart(2, "0")}</span></div><p>{role}</p><h3>{name}</h3><blockquote>{quote}</blockquote></article>)}</div><div className="history"><p className="eyebrow">{t.history}</p><p><b>2021</b> {t.historyText}</p></div></section>

    <section className="contact" id="contact"><p className="eyebrow">{t.contactLabel}</p><h2>LET&apos;S MAKE<br />SOME <i>NOISE.</i></h2><p>{t.contactDescription}</p><div><a className="solid-button" href="mailto:contact@lacrima-band.jp">{t.contact} <span>↗</span></a><a className="outline-button light" href="https://thebase.com/" target="_blank" rel="noreferrer">{t.goods} <span>↗</span></a></div></section>
    <footer><a className="logo" href="#home">LACRIMA</a><p>© 2026 LACRIMA. ALL RIGHTS RESERVED.</p><div><a href="#contact">INSTAGRAM</a><a href="#contact">YOUTUBE</a><a href="#contact">X / TWITTER</a></div></footer>

    {isVideoOpen && <div className="video-modal" role="dialog" aria-modal="true" aria-labelledby="video-modal-title"><button className="video-modal-backdrop" type="button" onClick={() => setIsVideoOpen(false)} aria-label={t.closeVideo} /><div className="video-modal-panel"><button className="video-modal-close" type="button" onClick={() => setIsVideoOpen(false)} aria-label={t.closeVideo}>×</button><p className="eyebrow">{t.videoInfo}</p><h2 id="video-modal-title">LILY IN THE<br /><i>ASHES</i></h2><p>{t.videoDescription}</p><a className="solid-button" href="#contact" onClick={() => setIsVideoOpen(false)}>{t.videoButton} <span>↗</span></a></div></div>}
  </main>;
}
