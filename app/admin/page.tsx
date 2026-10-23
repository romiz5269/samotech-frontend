"use client";

import {FormEvent, useEffect, useMemo, useState} from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const FILE_BASE = API.replace(/\/api$/, "");
type S = {
  id: string;
  title: string;
  slug: string;
  description: string;
  eyebrow: string;
  icon: string;
  order: number;
  active: boolean;
};
type P = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  featured: boolean;
  order: number;
  active: boolean;
};
type M = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  createdAt: string;
};

type Tab = "dashboard" | "services" | "projects" | "messages";

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null),
    [tab, setTab] = useState<Tab>("dashboard"),
    [stats, setStats] = useState<any>(null),
    [services, setServices] = useState<S[]>([]),
    [projects, setProjects] = useState<P[]>([]),
    [messages, setMessages] = useState<M[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [modal, setModal] = useState<"service" | "project" | null>(null),
    [edit, setEdit] = useState<any>(null),
    [messageFilter, setMessageFilter] = useState("all");
  const api = async (path: string, opt: RequestInit = {}) => {
    const r = await fetch(`${API}${path}`, {
      ...opt,
      credentials: "include",
      headers: {"Content-Type": "application/json", ...(opt.headers || {})},
    });
    if (r.status === 401) {
      setAuthed(false);
      throw new Error("نشست شما منقضی شده است.");
    }
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.message || "خطا در ارتباط با API");
    return j;
  };
  const load = async () => {
    setBusy(true);
    try {
      const [d, s, p, m] = await Promise.all([
        api("/admin/dashboard"),
        api("/admin/services"),
        api("/admin/projects"),
        api(
          `/admin/messages${messageFilter === "all" ? "" : `?status=${messageFilter}`}`,
        ),
      ]);
      setStats(d.stats);
      setServices(s.data ?? []);
      setProjects(p.data ?? []);
      setMessages(m.data ?? []);
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    fetch(`${API}/admin/me`, {credentials: "include"})
      .then((r) => {
        setAuthed(r.ok);
      })
      .catch(() => setAuthed(false));
  }, []);
  useEffect(() => {
    if (authed) load();
  }, [authed, messageFilter]);
  async function login(username: string, password: string) {
    try {
      await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({username, password}),
      });
      setAuthed(true);
      setError("");
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  }
  async function logout() {
    try {
      await api("/admin/logout", {method: "POST"});
    } catch {}
    setAuthed(false);
  }
  async function save(
    kind: "service" | "project",
    data: Record<string, unknown>,
  ) {
    setBusy(true);
    try {
      const base = kind === "service" ? "/admin/services" : "/admin/projects";
      await api(edit?.id ? `${base}/${edit.id}` : base, {
        method: edit?.id ? "PUT" : "POST",
        body: JSON.stringify(data),
      });
      closeModal();
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(path: string) {
    if (!confirm("این مورد برای همیشه حذف شود؟")) return;
    try {
      await api(path, {method: "DELETE"});
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }
  async function setStatus(id: string, status: string) {
    try {
      await api(`/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({status}),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }
  function closeModal() {
    setModal(null);
    setEdit(null);
  }
  if (authed === null)
    return <div className="admin-loading">در حال بررسی نشست…</div>;
  if (!authed) return <Login onLogin={login} error={error} />;
  return (
    <div className="admin-shell">
      <aside>
        <div className="admin-brand">
          SAMOTECH <span>ADMIN</span>
        </div>
        {(
          [
            ["dashboard", "◈ داشبورد"],
            ["services", "◇ خدمات"],
            ["projects", "▱ پروژه‌ها"],
            [
              "messages",
              `✦ پیام‌ها${stats?.newMessages ? ` · ${stats.newMessages}` : ""}`,
            ],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button
            key={k}
            className={tab === k ? "active" : ""}
            onClick={() => setTab(k)}
          >
            {label}
          </button>
        ))}
        <div className="aside-bottom">
          <a href="/">مشاهده سایت ↗</a>
          <button onClick={logout}>خروج از حساب</button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-top">
          <div>
            <span className="label">CONTROL CENTER</span>
            <h1>
              {tab === "dashboard"
                ? "داشبورد"
                : tab === "services"
                  ? "خدمات"
                  : tab === "projects"
                    ? "پروژه‌ها"
                    : "پیام‌های تماس"}
            </h1>
          </div>
          <div className="admin-top-actions">
            <span>
              {new Intl.DateTimeFormat("fa-IR", {dateStyle: "medium"}).format(
                new Date(),
              )}
            </span>
            <button onClick={() => load()} disabled={busy}>
              ↻
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}
        {tab === "dashboard" && (
          <Dashboard stats={stats} messages={messages} setTab={setTab} />
        )}{" "}
        {tab === "services" && (
          <Manager
            items={services}
            kind="service"
            add={() => {
              setEdit(null);
              setModal("service");
            }}
            edit={(x) => {
              setEdit(x);
              setModal("service");
            }}
            remove={(x) => remove(`/admin/services/${x.id}`)}
          />
        )}{" "}
        {tab === "projects" && (
          <Manager
            items={projects}
            kind="project"
            add={() => {
              setEdit(null);
              setModal("project");
            }}
            edit={(x) => {
              setEdit(x);
              setModal("project");
            }}
            remove={(x) => remove(`/admin/projects/${x.id}`)}
          />
        )}{" "}
        {tab === "messages" && (
          <Messages
            items={messages}
            filter={messageFilter}
            setFilter={setMessageFilter}
            status={setStatus}
            remove={(id) => remove(`/admin/messages/${id}`)}
          />
        )}
      </main>
      {modal && (
        <Modal
          title={
            edit
              ? `ویرایش ${modal === "service" ? "خدمت" : "پروژه"}`
              : `${modal === "service" ? "خدمت" : "پروژه"} جدید`
          }
          close={closeModal}
        >
          <ContentForm
            type={modal}
            data={edit}
            save={save}
            close={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

function Login({
  onLogin,
  error,
}: {
  onLogin: (u: string, p: string) => Promise<void>;
  error: string;
}) {
  const [u, setU] = useState(""),
    [p, setP] = useState(""),
    [busy, setBusy] = useState(false),
    [local, setLocal] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLocal("");
    try {
      await onLogin(u, p);
    } catch {
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-login">
      <div className="login-orb" />
      <form onSubmit={submit}>
        <div className="admin-brand">
          SAMOTECH <span>ADMIN</span>
        </div>
        <h1>پنل مدیریت</h1>
        <p>مدیریت محتوای سایت، پروژه‌ها و درخواست‌های مشتری.</p>
        <input
          autoComplete="username"
          required
          placeholder="نام کاربری"
          value={u}
          onChange={(e) => setU(e.target.value)}
        />
        <input
          autoComplete="current-password"
          required
          type="password"
          placeholder="رمز عبور"
          value={p}
          onChange={(e) => setP(e.target.value)}
        />
        <button disabled={busy}>
          {busy ? "در حال ورود…" : "ورود به پنل ↗"}
        </button>
        {(error || local) && <small>{error || local}</small>}
        <a href="/">← بازگشت به سایت</a>
      </form>
    </div>
  );
}

function Dashboard({
  stats,
  messages,
  setTab,
}: {
  stats: any;
  messages: M[];
  setTab: (s: Tab) => void;
}) {
  const cards = [
    ["خدمات", stats?.services ?? 0, "مورد"],
    ["پروژه‌ها", stats?.projects ?? 0, "مورد"],
    ["کل پیام‌ها", stats?.messages ?? 0, "درخواست"],
    ["جدید", stats?.newMessages ?? 0, "نیازمند بررسی"],
  ];
  return (
    <>
      <div className="stats-grid">
        {cards.map(([a, b, c]) => (
          <div className="stat" key={a as string}>
            <span>{a}</span>
            <strong>{b}</strong>
            <small>{c}</small>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="panel">
          <PanelHead
            label="RECENT"
            title="آخرین پیام‌ها"
            button="همه پیام‌ها ↗"
            action={() => setTab("messages")}
          />
          {messages.slice(0, 6).map((m) => (
            <div className="message-row" key={m.id}>
              <div>
                <b>{m.name}</b>
                <span>
                  {m.service || "بدون دسته‌بندی"} · {m.phone}
                </span>
              </div>
              <Status status={m.status} />
            </div>
          ))}
          {!messages.length && (
            <div className="empty">هنوز پیامی ثبت نشده.</div>
          )}
        </div>
        <div className="panel quick">
          <span className="label">QUICK ACTIONS</span>
          <h2>دسترسی سریع</h2>
          <button onClick={() => setTab("services")}>+ مدیریت خدمات</button>
          <button onClick={() => setTab("projects")}>+ مدیریت پروژه‌ها</button>
          <button onClick={() => setTab("messages")}>✦ بررسی پیام‌ها</button>
        </div>
      </div>
    </>
  );
}
function PanelHead({
  label,
  title,
  button,
  action,
}: {
  label: string;
  title: string;
  button?: string;
  action?: () => void;
}) {
  return (
    <div className="panel-head">
      <div>
        <span className="label">{label}</span>
        <h2>{title}</h2>
      </div>
      {button && <button onClick={action}>{button}</button>}
    </div>
  );
}
function Manager({
  items,
  kind,
  add,
  edit,
  remove,
}: {
  items: any[];
  kind: string;
  add: () => void;
  edit: (x: any) => void;
  remove: (x: any) => void;
}) {
  return (
    <div className="panel">
      <PanelHead
        label="CONTENT"
        title={kind === "service" ? "خدمات" : "پروژه‌ها"}
        button="+ افزودن"
        action={add}
      />
      <div className="table">
        {items.map((x, i) => (
          <div className="table-row" key={x.id}>
            <div className="row-main">
              <span className="row-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              {x.image && <img src={`${FILE_BASE}${x.image}`} alt="" />}
              <div>
                <b>{x.title}</b>
                <span>
                  {kind === "service"
                    ? x.description
                    : `${x.category} · ${(x.tags || []).join("، ")}`}
                </span>
              </div>
            </div>
            <div className="row-actions">
              <span className={`mini-state ${x.active ? "on" : "off"}`}>
                {x.active ? "فعال" : "خاموش"}
              </span>
              {kind === "project" && x.featured && (
                <span className="mini-state featured">ویژه</span>
              )}
              <button onClick={() => edit(x)}>ویرایش</button>
              <button onClick={() => remove(x)}>حذف</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="empty">موردی ثبت نشده.</div>}
      </div>
    </div>
  );
}
function Messages({
  items,
  filter,
  setFilter,
  status,
  remove,
}: {
  items: M[];
  filter: string;
  setFilter: (v: string) => void;
  status: (id: string, s: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <span className="label">INBOX</span>
          <h2>{items.length} پیام</h2>
        </div>
        <select
          className="message-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">همه</option>
          <option value="new">جدید</option>
          <option value="read">خوانده شده</option>
          <option value="replied">پاسخ داده شد</option>
          <option value="archived">آرشیو</option>
        </select>
      </div>
      <div className="messages-list">
        {items.map((m) => (
          <article className="message-card" key={m.id}>
            <div className="message-head">
              <div>
                <b>{m.name}</b>
                <span>
                  {m.phone}
                  {m.email ? ` · ${m.email}` : ""}
                </span>
              </div>
              <Status status={m.status} />
            </div>
            <p>{m.message || "بدون توضیحات"}</p>
            <div className="message-foot">
              <span>
                {m.service || "بدون خدمت"} ·{" "}
                {new Date(m.createdAt).toLocaleString("fa-IR")}
              </span>
              <div>
                <select
                  value={m.status}
                  onChange={(e) => status(m.id, e.target.value)}
                >
                  <option value="new">جدید</option>
                  <option value="read">خوانده شده</option>
                  <option value="replied">پاسخ داده شد</option>
                  <option value="archived">آرشیو</option>
                </select>
                <button onClick={() => remove(m.id)}>حذف</button>
              </div>
            </div>
          </article>
        ))}
        {!items.length && <div className="empty">پیامی وجود ندارد.</div>}
      </div>
    </div>
  );
}
function Status({status}: {status: M["status"]}) {
  const map = {
    new: "جدید",
    read: "خوانده شده",
    replied: "پاسخ داده شد",
    archived: "آرشیو",
  };
  return <span className={`status ${status}`}>{map[status]}</span>;
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  return (
    <div className="modal-bg" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={close}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
function ContentForm({
  type,
  data,
  save,
  close,
}: {
  type: "service" | "project";
  data: any;
  save: (
    kind: "service" | "project",
    data: Record<string, unknown>,
  ) => Promise<void>;
  close: () => void;
}) {
  const [image, setImage] = useState(data?.image || ""),
    [uploading, setUploading] = useState(false),
    [error, setError] = useState("");
  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await fetch(`${API}/admin/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message);
      setImage(j.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const raw = Object.fromEntries(new FormData(e.currentTarget).entries());
    const payload: any = {
      ...raw,
      active: raw.active === "on",
      order: Number(raw.order || 0),
    };
    if (type === "project")
      payload.tags = String(raw.tags || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);
    if (type === "project") {
      payload.featured = raw.featured === "on";
      payload.image = image;
    }
    await save(type, payload);
  }
  return (
    <form className="modal-form" onSubmit={submit}>
      {type === "service" ? (
        <>
          <input
            name="title"
            defaultValue={data?.title || ""}
            placeholder="عنوان خدمت"
            required
          />
          <input
            name="slug"
            defaultValue={data?.slug || ""}
            placeholder="slug انگلیسی"
            required
          />
          <input
            name="eyebrow"
            defaultValue={data?.eyebrow || "SERVICE"}
            placeholder="مثلاً SECURITY"
          />
          <input
            name="icon"
            defaultValue={data?.icon || "code"}
            placeholder="monitor / camera / globe / code / mobile / network"
          />
          <textarea
            name="description"
            defaultValue={data?.description || ""}
            placeholder="توضیحات"
            required
          />
        </>
      ) : (
        <>
          <input
            name="title"
            defaultValue={data?.title || ""}
            placeholder="عنوان پروژه"
            required
          />
          <input
            name="slug"
            defaultValue={data?.slug || ""}
            placeholder="slug انگلیسی"
            required
          />
          <input
            name="category"
            defaultValue={data?.category || ""}
            placeholder="Software / Security / Infrastructure"
            required
          />
          <textarea
            name="description"
            defaultValue={data?.description || ""}
            placeholder="توضیحات"
            required
          />
          <input
            name="tags"
            defaultValue={(data?.tags || []).join(", ")}
            placeholder="Next.js, Node.js, PostgreSQL"
          />
          <label className="upload-box">
            {image ? (
              <img src={`${FILE_BASE}${image}`} alt="preview" />
            ) : (
              <span>
                {uploading ? "در حال پردازش تصویر…" : "+ انتخاب تصویر پروژه"}
              </span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
          </label>
          {error && <small className="form-error">{error}</small>}
        </>
      )}
      <div className="form-grid-2">
        <input
          name="order"
          type="number"
          min="0"
          max="9999"
          defaultValue={data?.order ?? 0}
          placeholder="ترتیب نمایش"
        />
        <label className="check">
          <input
            type="checkbox"
            name="active"
            defaultChecked={data?.active !== false}
          />{" "}
          نمایش در سایت
        </label>
        {type === "project" && (
          <label className="check">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={data?.featured === true}
            />{" "}
            پروژه ویژه
          </label>
        )}
      </div>
      <div className="modal-actions">
        <button type="button" onClick={close}>
          انصراف
        </button>
        <button className="primary-small" disabled={uploading}>
          ذخیره
        </button>
      </div>
    </form>
  );
}
