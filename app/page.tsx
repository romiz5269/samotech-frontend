"use client";
import {FormEvent, useEffect, useMemo, useState} from "react";
import {motion} from "framer-motion";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const ICONS: Record<string, string> = {
  monitor: "▣",
  camera: "◉",
  globe: "◌",
  code: "⌘",
  mobile: "▯",
  network: "⌁",
};
type Service = {
  id: string;
  title: string;
  description: string;
  eyebrow: string;
  icon: string;
  order: number;
};
type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
};
export default function Home() {
  const [services, setServices] = useState<Service[]>([]),
    [projects, setProjects] = useState<Project[]>([]),
    [status, setStatus] = useState(""),
    [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    fetch(`${API}/services`)
      .then((r) => r.json())
      .then((x) => setServices(x.data ?? []))
      .catch(() => {});
    fetch(`${API}/projects`)
      .then((r) => r.json())
      .then((x) => setProjects(x.data ?? []))
      .catch(() => {});
    const f = () => setScrolled(scrollY > 24);
    addEventListener("scroll", f);
    return () => removeEventListener("scroll", f);
  }, []);
  const fallbackServices: Service[] = useMemo(
    () =>
      [
        [
          "01",
          "زیرساخت و پشتیبانی IT",
          "راه‌اندازی، نگهداری و پشتیبانی تجهیزات و زیرساخت‌های سازمانی.",
          "INFRASTRUCTURE",
          "monitor",
          1,
        ],
        [
          "02",
          "دوربین و سیستم‌های امنیتی",
          "طراحی و اجرای سیستم‌های نظارت تصویری و راهکارهای امنیتی.",
          "SECURITY",
          "camera",
          2,
        ],
        [
          "03",
          "طراحی و توسعه وب",
          "ساخت سایت‌های سریع، مدرن و اختصاصی برای کسب‌وکارها.",
          "DIGITAL",
          "globe",
          3,
        ],
        [
          "04",
          "توسعه نرم‌افزار",
          "پیاده‌سازی سامانه‌های اختصاصی و ابزارهای داخلی.",
          "SOFTWARE",
          "code",
          4,
        ],
        [
          "05",
          "توسعه اپلیکیشن",
          "ساخت اپلیکیشن متناسب با نیاز واقعی محصول.",
          "PRODUCT",
          "mobile",
          5,
        ],
        [
          "06",
          "شبکه و تجهیزات",
          "طراحی، نصب و عیب‌یابی شبکه و تجهیزات ارتباطی.",
          "NETWORK",
          "network",
          6,
        ],
      ].map((x) => ({
        id: x[0] as string,
        title: x[1] as string,
        description: x[2] as string,
        eyebrow: x[3] as string,
        icon: x[4] as string,
        order: x[5] as number,
      })),
    [],
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("در حال ارسال...");
    const form = e.currentTarget;
    try {
      const r = await fetch(`${API}/contact`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const j = await r.json();
      if (!r.ok) throw new Error();
      setStatus(j.message);
      form.reset();
    } catch {
      setStatus("ارسال انجام نشد. اتصال API را بررسی کنید.");
    }
  }
  const list = services.length ? services : fallbackServices;
  return (
    <div className="site-shell">
      <header className={scrolled ? "nav nav-scrolled" : "nav"}>
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <span className="brand-mark">S</span>
            <span>SAMOTECH</span>
          </a>
          <nav>
            <a href="#services">خدمات</a>
            <a href="#projects">پروژه‌ها</a>
            <a href="#about">درباره ما</a>
            <a href="#contact">تماس</a>
          </nav>
          <a className="nav-cta" href="#contact">
            شروع پروژه <span>↗</span>
          </a>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />
          <div className="hero-grid" />
          <div className="container hero-inner">
            <motion.div
              className="hero-kicker"
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7}}
            >
              <span className="pulse" /> Technology · Security · Digital
            </motion.div>
            <motion.h1
              initial={{opacity: 0, y: 35}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.9, delay: 0.08, ease: "easeOut"}}
            >
              فناوری‌ای که
              <br />
              <span>واقعاً کار می‌کند.</span>
            </motion.h1>
            <motion.p
              initial={{opacity: 0, y: 25}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7, delay: 0.18}}
            >
              از زیرساخت، شبکه و دوربین تا طراحی سایت، نرم‌افزار و اپلیکیشن؛ یک
              تیم برای ساختن راهکارهای درست و قابل اتکا.
            </motion.p>
            <motion.div
              className="hero-actions"
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7, delay: 0.26}}
            >
              <a className="btn btn-light" href="#contact">
                شروع یک پروژه <b>↗</b>
              </a>
              <a className="text-link" href="#projects">
                مشاهده پروژه‌ها <span>←</span>
              </a>
            </motion.div>
            <motion.div
              className="hero-meta"
              initial={{opacity: 0, y: 18}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.7, delay: 0.34}}
            >
              <div>
                <strong>01</strong>
                <span>یک تیم</span>
              </div>
              <div>
                <strong>02</strong>
                <span>چند تخصص</span>
              </div>
              <div>
                <strong>03</strong>
                <span>یک راهکار</span>
              </div>
            </motion.div>
          </div>
        </section>
        <section className="marquee" aria-label="Capabilities">
          <div className="marquee-track">
            <motion.div
              className="marquee-content"
              animate={{x: ["0%", "-50%"]}}
              transition={{duration: 22, ease: "linear", repeat: Infinity}}
            >
              <span>INFRASTRUCTURE</span>
              <i>·</i>
              <span>SECURITY</span>
              <i>·</i>
              <span>SOFTWARE</span>
              <i>·</i>
              <span>WEB</span>
              <i>·</i>
              <span>NETWORK</span>
              <i>·</i>
              <span>DIGITAL</span>
              <i>·</i>
              <span>INFRASTRUCTURE</span>
              <i>·</i>
              <span>SECURITY</span>
              <i>·</i>
              <span>SOFTWARE</span>
              <i>·</i>
              <span>WEB</span>
              <i>·</i>
              <span>NETWORK</span>
              <i>·</i>
              <span>DIGITAL</span>
              <i>·</i>
            </motion.div>
          </div>
        </section>
        <section className="section" id="services">
          <div className="container">
            <div className="section-top">
              <div>
                <span className="label">01 / SERVICES</span>
                <h2>
                  هر چیزی که کسب‌وکارت
                  <br />
                  <em>لازم دارد.</em>
                </h2>
              </div>
              <p>
                سخت‌افزار و نرم‌افزار را کنار هم می‌گذاریم تا مسئله از زاویه
                درست حل شود؛ نه با راهکارهای پیچیده و اضافه.
              </p>
            </div>
            <div className="service-grid">
              {list.map((s, i) => (
                <motion.article
                  className="service-card"
                  key={s.id}
                  initial={{opacity: 0, y: 25}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true, amount: 0.2}}
                  transition={{duration: 0.55, delay: i * 0.06}}
                  whileHover={{y: -7}}
                >
                  <div className="service-top">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span className="service-icon">{ICONS[s.icon] ?? "◇"}</span>
                  </div>
                  <div>
                    <span className="label">{s.eyebrow}</span>
                    <h3>{s.title}</h3>
                    <p>{s.description}</p>
                  </div>
                  <span className="arrow">↗</span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
        <section className="section projects-section" id="projects">
          <div className="container">
            <div className="section-top">
              <div>
                <span className="label">02 / SELECTED WORK</span>
                <h2>
                  چیزهایی که
                  <br />
                  <em>ساخته‌ایم.</em>
                </h2>
              </div>
              <p>
                نمونه‌ای از پروژه‌ها و اجراهای ما؛ پنل مدیریت از داخل سایت امکان
                اضافه‌کردن پروژه‌های واقعی را می‌دهد.
              </p>
            </div>
            <div className="project-grid">
              {projects.length ? (
                projects.map((p) => (
                  <motion.article
                    className="project-card"
                    key={p.id}
                    initial={{opacity: 0, y: 28}}
                    whileInView={{opacity: 1, y: 0}}
                    viewport={{once: true, amount: 0.18}}
                    transition={{duration: 0.6}}
                    whileHover={{y: -8}}
                  >
                    {p.image ? (
                      <img
                        src={`${API.replace(/\/api$/, "")}${p.image}`}
                        alt=""
                      />
                    ) : (
                      <div className="project-visual">
                        <span>{p.category}</span>
                        <b>{p.title.slice(0, 1)}</b>
                      </div>
                    )}
                    <div className="project-body">
                      <div>
                        <span className="label">{p.category}</span>
                        <h3>{p.title}</h3>
                        <p>{p.description}</p>
                      </div>
                      <span className="arrow">↗</span>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="empty-projects">
                  <span className="label">SELECTED WORK</span>
                  <h3>پروژه‌های واقعی شما اینجا قرار می‌گیرند.</h3>
                  <p>
                    از پنل مدیریت، پروژه را همراه تصویر، دسته‌بندی و
                    تکنولوژی‌های استفاده‌شده اضافه کنید.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="statement">
          <motion.div
            className="container"
            initial={{opacity: 0, y: 30}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, amount: 0.3}}
            transition={{duration: 0.7}}
          >
            <span className="label">03 / APPROACH</span>
            <h2>
              تکنولوژی را نمی‌فروشیم.
              <br />
              <span>مسئله را حل می‌کنیم.</span>
            </h2>
            <p>
              از اولین کابل تا آخرین خط کد، هدف یکی است: یک راهکار تمیز، پایدار
              و قابل استفاده.
            </p>
          </motion.div>
        </section>
        <section className="section about-section" id="about">
          <div className="container about-grid">
            <div>
              <span className="label">04 / ABOUT</span>
              <h2>
                یک تیم.
                <br />
                <em>چند تخصص.</em>
              </h2>
            </div>
            <div>
              <p className="big-copy">
                ما یک گروه فنی هستیم که سخت‌افزار و نرم‌افزار را جدا از هم
                نمی‌بینیم.
              </p>
              <p>
                زیرساخت، شبکه، دوربین و تجهیزات در کنار طراحی وب، توسعه
                نرم‌افزار و اپلیکیشن؛ نتیجه باید ساده‌تر از چیزی باشد که قبل از
                ما بوده.
              </p>
            </div>
          </div>
        </section>
        <section className="section contact-section" id="contact">
          <div className="container contact-grid">
            <div>
              <span className="label">05 / START A PROJECT</span>
              <h2>
                بیایید درباره
                <br />
                <em>پروژه‌تان حرف بزنیم.</em>
              </h2>
              <p>
                چند خط درباره نیازتان بنویسید. بررسی می‌کنیم، سوال‌های لازم را
                می‌پرسیم و راهکار پیشنهاد می‌دهیم.
              </p>
              <div className="contact-line">
                AVAILABLE FOR NEW PROJECTS <span>●</span>
              </div>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <label>
                نام و نام خانوادگی
                <input name="name" required placeholder="مثلاً مجتبی رضایی" />
              </label>
              <div className="two">
                <label>
                  شماره تماس
                  <input name="phone" required placeholder="09..." />
                </label>
                <label>
                  ایمیل
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </label>
              </div>
              <label>
                نوع خدمت
                <select name="service" defaultValue="">
                  <option value="">انتخاب کنید</option>
                  {list.map((s) => (
                    <option key={s.id}>{s.title}</option>
                  ))}
                </select>
              </label>
              <label>
                توضیحات
                <textarea
                  name="message"
                  placeholder="کوتاه درباره پروژه بنویسید..."
                />
              </label>
              <button className="btn btn-light" type="submit">
                ارسال درخواست <b>↗</b>
              </button>
              {status && <div className="form-status">{status}</div>}
            </form>
          </div>
        </section>
      </main>
      <footer>
        <div className="container footer-inner">
          <a className="brand" href="#top">
            <span className="brand-mark">S</span>
            <span>SAMOTECH</span>
          </a>
          <span>Technology · Security · Digital</span>
          <a href="/admin">Admin ↗</a>
        </div>
      </footer>
    </div>
  );
}
