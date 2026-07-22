import Link from "next/link";

const navigation = [
  { href: "/schedule", label: "スケジュール" },
  { href: "/news", label: "ニュース" },
  { href: "/media", label: "メディア" },
  { href: "/profile", label: "プロフィール" },
  { href: "https://thebase.com/", label: "グッズ", external: true },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteNavigation({ active }: { active?: string }) {
  return <header className="inner-nav site-navigation">
    <Link className="logo" href="/">LACRIMA</Link>
    <nav aria-label="Site navigation">
      {navigation.map((item) => item.external ? <a href={item.href} target="_blank" rel="noreferrer" key={item.href}>{item.label}</a> : <Link className={active === item.href ? "is-active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
    </nav>
    <Link href="/" className="back-link">HOME</Link>
  </header>;
}
