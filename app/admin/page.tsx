"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, type Database } from "@/lib/supabase";

type LiveEvent = {
  id: string;
  title: string;
  starts_at: string;
  venue: string;
  city: string;
  description: string;
  ticket_url: string | null;
  published: boolean;
};

type EventDraft = {
  title: string;
  startsAt: string;
  venue: string;
  city: string;
  description: string;
  ticketUrl: string;
  published: boolean;
};

const emptyDraft: EventDraft = {
  title: "",
  startsAt: "",
  venue: "",
  city: "",
  description: "",
  ticketUrl: "",
  published: false,
};

function toDateTimeInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [draft, setDraft] = useState<EventDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [configurationMissing, setConfigurationMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadAdminState(client: SupabaseClient<Database>) {
    const { data: { session: nextSession } } = await client.auth.getSession();
    setSession(nextSession);

    if (!nextSession?.user) {
      setIsAdmin(false);
      setEvents([]);
      setLoading(false);
      return;
    }

    const { data: adminRecord, error: adminError } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", nextSession.user.id)
      .maybeSingle();

    if (adminError || !adminRecord) {
      setIsAdmin(false);
      setEvents([]);
      setNotice("로그인은 되었지만 관리자 권한이 없습니다.");
      setLoading(false);
      return;
    }

    setIsAdmin(true);
    const { data, error } = await client
      .from("live_events")
      .select("id, title, starts_at, venue, city, description, ticket_url, published")
      .order("starts_at", { ascending: true });

    if (error) setNotice("공연 목록을 불러오지 못했습니다.");
    else setEvents((data ?? []) as LiveEvent[]);
    setLoading(false);
  }

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      const timer = window.setTimeout(() => {
        setConfigurationMissing(true);
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const initialLoadTimer = window.setTimeout(() => {
      void loadAdminState(client);
    }, 0);
    const { data: { subscription } } = client.auth.onAuthStateChange(() => {
      void loadAdminState(client);
    });
    return () => {
      window.clearTimeout(initialLoadTimer);
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    setNotice("");
    setLoading(true);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setNotice("이메일 또는 비밀번호를 확인해 주세요.");
      setLoading(false);
    }
  }

  async function signOut() {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    await client.auth.signOut();
    setNotice("");
  }

  function beginEdit(event: LiveEvent) {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      startsAt: toDateTimeInput(event.starts_at),
      venue: event.venue,
      city: event.city,
      description: event.description,
      ticketUrl: event.ticket_url ?? "",
      published: event.published,
    });
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(emptyDraft);
    setNotice("");
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const startsAt = new Date(draft.startsAt);
    if (Number.isNaN(startsAt.getTime())) {
      setNotice("공연 일시를 입력해 주세요.");
      return;
    }

    setSaving(true);
    setNotice("");
    const payload = {
      title: draft.title.trim(),
      starts_at: startsAt.toISOString(),
      venue: draft.venue.trim(),
      city: draft.city.trim(),
      description: draft.description.trim(),
      ticket_url: draft.ticketUrl.trim() || null,
      published: draft.published,
      updated_at: new Date().toISOString(),
    };
    const result = editingId
      ? await client.from("live_events").update(payload).eq("id", editingId)
      : await client.from("live_events").insert(payload);

    if (result.error) {
      setNotice("저장하지 못했습니다. 관리자 권한과 필수 항목을 확인해 주세요.");
      setSaving(false);
      return;
    }

    setNotice(editingId ? "공연 정보를 수정했습니다." : "공연을 등록했습니다.");
    setSaving(false);
    setEditingId(null);
    setDraft(emptyDraft);
    await loadAdminState(client);
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("이 공연을 삭제할까요?")) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    const { error } = await client.from("live_events").delete().eq("id", id);
    setNotice(error ? "삭제하지 못했습니다." : "공연을 삭제했습니다.");
    if (!error) await loadAdminState(client);
  }

  if (configurationMissing) return <main className="admin-page admin-login"><Link className="logo" href="/">LACRIMA</Link><section><p className="eyebrow">SETUP REQUIRED</p><h1>SUPABASE<br /><i>NOT FOUND.</i></h1><p>Vercel 환경 변수 등록 후 새 배포가 필요합니다.</p></section></main>;

  if (loading) return <main className="admin-page"><p className="admin-status">LOADING ADMIN…</p></main>;

  if (!session) return <main className="admin-page admin-login"><Link className="logo" href="/">LACRIMA</Link><section><p className="eyebrow">ADMIN ACCESS</p><h1>ENTER THE<br /><i>VEIL.</i></h1><p>공식 사이트 운영자 전용 페이지입니다.</p><form onSubmit={signIn}><label>EMAIL<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label><label>PASSWORD<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label><button className="admin-button" type="submit">SIGN IN <span>→</span></button></form>{notice && <p className="admin-notice">{notice}</p>}</section></main>;

  if (!isAdmin) return <main className="admin-page admin-login"><Link className="logo" href="/">LACRIMA</Link><section><p className="eyebrow">ACCESS DENIED</p><h1>NOT<br /><i>AUTHORIZED.</i></h1><p>{notice || "이 계정은 아직 관리자로 등록되지 않았습니다."}</p><button className="admin-button" type="button" onClick={signOut}>SIGN OUT <span>→</span></button></section></main>;

  return <main className="admin-page"><header className="admin-header"><Link className="logo" href="/">LACRIMA</Link><div><span>{session.user.email}</span><button type="button" onClick={signOut}>SIGN OUT</button></div></header><section className="admin-intro"><p className="eyebrow">ADMIN / LIVE SCHEDULE</p><h1>THE<br /><i>RITUALS.</i></h1><p>공연을 등록하고 공개 여부를 관리합니다. 공개한 공연만 사이트에 표시됩니다.</p></section><section className="admin-grid"><form className="event-form" onSubmit={saveEvent}><div className="form-heading"><p>{editingId ? "EDIT LIVE" : "NEW LIVE"}</p>{editingId && <button type="button" onClick={cancelEdit}>CANCEL</button>}</div><label>공연명<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></label><label>공연 일시 (JST)<input type="datetime-local" value={draft.startsAt} onChange={(event) => setDraft({ ...draft, startsAt: event.target.value })} required /></label><div className="form-row"><label>공연장<input value={draft.venue} onChange={(event) => setDraft({ ...draft, venue: event.target.value })} required /></label><label>도시<input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} required /></label></div><label>상세 내용<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required rows={6} /></label><label>티켓 URL <span>(선택)</span><input type="url" value={draft.ticketUrl} onChange={(event) => setDraft({ ...draft, ticketUrl: event.target.value })} placeholder="https://" /></label><label className="publish-toggle"><input type="checkbox" checked={draft.published} onChange={(event) => setDraft({ ...draft, published: event.target.checked })} /><span>사이트에 공개</span></label><button className="admin-button" type="submit" disabled={saving}>{saving ? "SAVING…" : editingId ? "SAVE CHANGES" : "ADD LIVE"} <span>→</span></button>{notice && <p className="admin-notice">{notice}</p>}</form><section className="event-list"><div className="form-heading"><p>ALL LIVES</p><span>{events.length}</span></div>{events.length === 0 ? <p className="admin-empty">아직 등록된 공연이 없습니다.</p> : events.map((event) => <article key={event.id}><div><p>{new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tokyo" }).format(new Date(event.starts_at))}</p><h2>{event.title}</h2><span>{event.city} · {event.venue}</span></div><div className="event-actions"><b className={event.published ? "is-published" : ""}>{event.published ? "PUBLISHED" : "DRAFT"}</b><button type="button" onClick={() => beginEdit(event)}>EDIT</button><button type="button" onClick={() => deleteEvent(event.id)}>DELETE</button></div></article>)}</section></section></main>;
}
