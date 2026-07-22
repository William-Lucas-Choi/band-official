import Link from "next/link";

const navigation = [
  { href: "/schedule", label: "スケジュール" },
  { href: "/news", label: "ニュース" },
  { href: "/media", label: "メディア" },
  { href: "/profile", label: "プロフィール" },
  { href: "/goods", label: "グッズ" },
  { href: "/contact", label: "お問い合わせ" },
];

export function SiteNavigation({ active }: { active?: string }) {
  return <header className="inner-nav site-navigation">
    <Link className="logo" href="/">LACRIMA</Link>
    <nav aria-label="Site navigation">
      {navigation.map((item) => <Link className={active === item.href ? "is-active" : ""} href={item.href} key={item.href}>{item.label}</Link>)}
    </nav>
    <Link href="/" className="back-link">HOME</Link>
  </header>;
}
