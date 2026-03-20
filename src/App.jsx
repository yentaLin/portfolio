import React, { useMemo } from "react";

export default function App() {
  const cmuLogo = `${import.meta.env.BASE_URL}CMU_logo_stack_cmyk_red.jpg`;
  const nckuLogo = `${import.meta.env.BASE_URL}ncku-logo1.jpg`;
  const githubUrl = "https://github.com/yentaLin";
  const linkedinUrl = "https://linkedin.com/in/yenta1129";
  const email = "linyanda7@gmail.com";

  const experiences = useMemo(
    () => [
      {
        role: "R&D Intern",
        org: "Mobagel",
        period: "Feb 2025 – Sep 2025",
        summary:
          "Worked on production-facing forecasting systems and the reliability of the training-to-deployment workflow.",
        bullets: [
          "Built and deployed forecasting models in production, reducing MSE by 25.2% versus internal baselines.",
          "Improved Airflow-based training workflows to increase stability, reduce latency, and speed up iteration.",
          "Built internal dashboards to monitor model outputs and workflow health for cross-functional teams.",
        ],
        stack: ["Python", "Airflow", "Forecasting", "Production ML"],
      },
    ],
    []
  );

  const projects = useMemo(
    () => [
      {
        title: "LLM Quantization for Edge Devices",
        tag: "Research",
        summary:
          "Post-training quantization for large language models targeting static integer-only inference on constrained devices.",
        impact:
          "Perplexity 12.72 on WikiText-2 vs. 9.75 FP16 with under 0.1% compute overhead.",
        bullets: [
          "Used 2D DCT with piecewise INT4 encoding to reduce activation outliers.",
          "Focused on the trade-off between memory efficiency, compute cost, and accuracy.",
        ],
        stack: ["LLM", "INT4", "Quantization", "Edge Inference"],
      },
      {
        title: "Autonomous UAV Rescue Detection",
        tag: "Deployment",
        summary:
          "Real-time UAV visual recognition pipeline for disaster search-and-rescue, from training to live field deployment.",
        impact:
          "32 mAP, 89% recall, and adopted in Tainan Fire Department scenarios.",
        bullets: [
          "Trained and deployed a streamlined RT-DETR detector for real-time inference.",
          "Won two first-place awards through real-world system delivery.",
        ],
        stack: ["RT-DETR", "Computer Vision", "UAV", "Real-time Inference"],
      },
      {
        title: "Medical Imaging AI for Ki-67 Detection",
        tag: "Applied AI",
        summary:
          "Semi-supervised breast cancer cell segmentation pipeline built for practical diagnostic use under limited-label conditions.",
        impact: "Reached 79% mIoU and supported deployment in Taiwanese hospitals.",
        bullets: [
          "Combined UniMatch with watershed-based post-processing.",
          "Improved segmentation quality in limited-label settings.",
        ],
        stack: ["Medical Imaging", "Semi-supervised Learning", "Segmentation", "UniMatch"],
      },
      {
        title: "AIoT Elderly Protection Robot",
        tag: "Systems",
        summary:
          "AIoT system integration project centered on embedded implementation, practical assistance, and real-world usability.",
        impact: "Received NCKU startup project sponsorship.",
        bullets: [
          "Combined software, hardware, and deployment-oriented design.",
          "Reflects long-term interest in embedded systems beyond model research alone.",
        ],
        stack: ["AIoT", "Embedded Systems", "System Integration", "Robotics"],
      },
    ],
    []
  );

  const skillGroups = useMemo(
    () => [
      {
        title: "Programming",
        items: ["C/C++", "Python"],
      },
      {
        title: "Embedded & Systems",
        items: ["STM32", "Jetson Nano", "Raspberry Pi", "Linux", "On-device Inference"],
      },
      {
        title: "ML & Optimization",
        items: ["Model Quantization", "Computer Vision", "Time-series Forecasting", "Semi-supervised Learning"],
      },
      {
        title: "Workflow & Tooling",
        items: ["Git", "CI/CD", "Airflow", "Model Training Workflows"],
      },
    ],
    []
  );

  const awards = useMemo(
    () => [
      "1st Place, NCKU EE Undergraduate Project — Autonomous UAV-Based Rescue Detection",
      "1st Place, Tainan City Hackathon — Autonomous UAV-Based Rescue Detection",
      "NCKU Startup Project Sponsorship — AIoT Elderly Protection Robot",
    ],
    []
  );

  return (
    <>
      <style>{`
        :root {
          --bg: #f6f8fc;
          --surface: #ffffff;
          --surface-soft: #f3f6fb;
          --text: #0f172a;
          --muted: #5b6475;
          --line: #e2e8f0;
          --accent: #2563eb;
          --accent-soft: #dbeafe;
          --shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
          --radius-xl: 28px;
          --radius-lg: 22px;
          --radius-md: 16px;
          --max: 1120px;
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: var(--text);
          text-align: left;
          background:
            radial-gradient(circle at top left, rgba(191, 219, 254, 0.9), transparent 22%),
            linear-gradient(180deg, #fbfdff 0%, var(--bg) 100%);
        }

        a {
          color: inherit;
          text-decoration: none;
        }

        .page {
          max-width: var(--max);
          margin: 0 auto;
          padding: 24px 20px 72px;
          text-align: left;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          margin-bottom: 34px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          background: rgba(255, 255, 255, 0.86);
          border-radius: 999px;
          box-shadow: var(--shadow);
        }

        .brand-name {
          font-size: 0.98rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .brand-sub {
          margin-top: 3px;
          color: var(--muted);
          font-size: 0.88rem;
        }

        .nav-links {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 15px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 0.92rem;
          font-weight: 700;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .btn-primary {
          color: white;
          background: var(--text);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          border-color: var(--line);
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
          align-items: stretch;
          margin-bottom: 56px;
        }

        .hero-main {
          padding: 14px 6px 0;
          max-width: 860px;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.86rem;
          font-weight: 800;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(2.9rem, 5vw, 4.9rem);
          line-height: 0.95;
          letter-spacing: -0.06em;
          max-width: 760px;
        }

        .hero h1 span {
          color: var(--accent);
        }

        .hero-copy {
          max-width: 700px;
          margin: 18px 0 0;
          font-size: 1.06rem;
          line-height: 1.85;
          color: #475569;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 24px;
        }

        .hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
          color: var(--muted);
          font-size: 0.94rem;
        }

        .panel {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow);
        }

        .profile-panel {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          justify-content: flex-start;
          text-align: left;
        }

        .hero-side-card {
          padding: 20px;
          border-radius: var(--radius-lg);
          background: var(--surface-soft);
          border: 1px solid var(--line);
        }

        .hero-side-card.featured {
          padding: 22px;
          background: linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%);
          border-color: #bfdbfe;
        }

        .hero-side-kicker {
          margin-bottom: 10px;
          color: var(--accent);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-side-title {
          margin: 0;
          font-size: 1.28rem;
          line-height: 1.3;
          letter-spacing: -0.03em;
        }

        .hero-side-copy {
          margin: 10px 0 0;
          color: var(--muted);
          font-size: 0.95rem;
          line-height: 1.75;
        }

        .hero-mini-list {
          display: grid;
          gap: 12px;
        }

        .hero-mini-item {
          display: grid;
          gap: 4px;
        }

        .hero-mini-label {
          color: var(--muted);
          font-size: 0.74rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hero-mini-value {
          color: var(--text);
          font-size: 0.96rem;
          font-weight: 700;
          line-height: 1.6;
        }

        .hero-tag-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .hero-tag {
          padding: 8px 12px;
          border-radius: 999px;
          background: white;
          border: 1px solid var(--line);
          color: #334155;
          font-size: 0.84rem;
          font-weight: 700;
        }

        .section {
          margin-bottom: 68px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: end;
          margin-bottom: 22px;
          text-align: left;
        }

        .section-kicker {
          margin-bottom: 10px;
          color: var(--accent);
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .section h2 {
          margin: 0;
          font-size: clamp(1.85rem, 3vw, 2.6rem);
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .section-copy {
          margin: 10px 0 0;
          max-width: 760px;
          color: var(--muted);
          line-height: 1.8;
        }

        .about-panel {
          padding: 28px;
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(260px, 0.75fr);
          gap: 22px;
        }

        .about-text {
          color: #475569;
          line-height: 1.9;
          font-size: 1rem;
        }

        .focus-list {
          display: grid;
          gap: 12px;
        }

        .focus-item {
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: var(--surface-soft);
          border: 1px solid var(--line);
        }

        .focus-item strong {
          display: block;
          margin-bottom: 4px;
          font-size: 0.95rem;
        }

        .focus-item span {
          color: var(--muted);
          font-size: 0.92rem;
          line-height: 1.65;
        }

        .timeline {
          display: grid;
          gap: 18px;
        }

        .timeline-item {
          padding: 24px;
        }

        .timeline-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: start;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }

        .timeline-role {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .timeline-org {
          color: var(--accent);
          font-weight: 700;
        }

        .timeline-period {
          color: var(--muted);
          font-size: 0.93rem;
          white-space: nowrap;
        }

        .timeline-summary {
          color: #475569;
          line-height: 1.8;
          margin-bottom: 12px;
        }

        .timeline-item ul,
        .detail-list {
          margin: 0;
          padding-left: 18px;
          color: #334155;
          line-height: 1.8;
        }

        .stack,
        .skill-group,
        .project-stack {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 16px;
        }

        .chip {
          padding: 8px 12px;
          border-radius: 999px;
          background: #f8fafc;
          border: 1px solid var(--line);
          color: #334155;
          font-size: 0.86rem;
          font-weight: 700;
        }

        .project-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .project-card,
        .skill-card,
        .education-card,
        .contact {
          padding: 24px;
        }

        .card-tag {
          display: inline-flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin-bottom: 14px;
        }

        .project-card h3,
        .skill-card h3,
        .education-card h3 {
          margin: 0 0 10px;
          font-size: 1.08rem;
          line-height: 1.4;
        }

        .education-card {
          text-align: left;
        }

        .school-name {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          text-align: left;
          gap: 12px;
          margin: 0 0 10px;
          font-size: 1.08rem;
          line-height: 1.4;
        }

        .school-name span {
          display: block;
          text-align: left;
        }

        .school-logo {
          width: 32px;
          height: 32px;
          object-fit: contain;
          flex: none;
          border-radius: 8px;
          background: white;
        }

        .project-summary,
        .education-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.78;
        }

        .project-impact {
          margin: 14px 0;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          background: var(--surface-soft);
          border: 1px solid var(--line);
          font-weight: 700;
          line-height: 1.7;
        }

        .skills-grid,
        .education-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .awards-panel {
          padding: 24px;
        }

        .awards-list {
          display: grid;
          gap: 12px;
          margin-top: 14px;
        }

        .award-item {
          padding: 12px 14px;
          border-radius: var(--radius-md);
          background: var(--surface-soft);
          border: 1px solid var(--line);
          color: #334155;
          line-height: 1.7;
        }

        .contact {
          display: flex;
          justify-content: space-between;
          gap: 22px;
          align-items: flex-start;
          text-align: left;
          color: white;
          background: linear-gradient(135deg, #0f172a, #111827 62%, #1d4ed8 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 22px 55px rgba(15, 23, 42, 0.18);
        }

        .contact p {
          margin: 10px 0 0;
          max-width: 680px;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.8;
        }

        .contact-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .btn-light {
          background: white;
          color: var(--text);
        }

        .btn-ghost {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        @media (max-width: 960px) {
          .hero,
          .about-panel,
          .project-grid,
          .education-grid,
          .skills-grid {
            grid-template-columns: 1fr;
          }

          .contact {
            flex-direction: column;
          }
        }

        @media (max-width: 720px) {
          .page {
            padding: 18px 14px 56px;
          }

          .topbar {
            border-radius: 24px;
            align-items: flex-start;
            flex-direction: column;
          }

          .hero h1 {
            font-size: 2.6rem;
          }

          .profile-panel,
          .about-panel,
          .timeline-item,
          .project-card,
          .skill-card,
          .education-card,
          .awards-panel,
          .contact {
            padding: 20px;
          }
        }
      `}</style>

      <div className="page">
        <header className="topbar">
          <div>
            <div className="brand-name">Yen-Ta Lin</div>
            <div className="brand-sub">Embedded Systems · Edge AI · Deployment-minded Engineering</div>
          </div>

          <nav className="nav-links">
            <a className="btn btn-secondary" href="#about">
              About
            </a>
            <a className="btn btn-secondary" href="#education">
              Education
            </a>
            <a className="btn btn-secondary" href="#experience">
              Experience
            </a>
            <a className="btn btn-secondary" href="#projects">
              Projects
            </a>
            <a className="btn btn-secondary" href="#contact">
              Contact
            </a>
            <a className="btn btn-primary" href={linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-main">
            <div className="eyebrow">Incoming Carnegie Mellon M.S. in ECE</div>
            <h1>
              I build <span>edge AI systems</span> that hold up in the real world.
            </h1>
            <p className="hero-copy">
              My work spans embedded systems, model optimization, and deployment-minded machine learning — with a focus on latency, reliability, and hardware constraints from the start.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#projects">
                View selected work
              </a>
              <a className="btn btn-secondary" href={githubUrl} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="btn btn-secondary" href={`mailto:${email}`}>
                Email
              </a>
            </div>

            <div className="hero-meta">
              <span>Based in Taiwan</span>
              <span>•</span>
              <span>Interested in embedded, firmware, and edge AI roles</span>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section-head">
            <div>
              <div className="section-kicker">About</div>
              <h2>I like building systems that have to work beyond the demo</h2>
              <p className="section-copy">
                I care most about systems where the real challenge is not just model quality, but making the whole pipeline usable, efficient, and dependable in practice.
              </p>
            </div>
          </div>

          <div className="panel about-panel">
            <div className="about-text">
              I’ve built production forecasting systems, optimized models for constrained hardware, and shipped real-time UAV vision pipelines. Across those projects, the pattern is the same: start from the constraint, make trade-offs explicit, and build something that people can actually rely on.
            </div>

            <div className="focus-list">
              <div className="focus-item">
                <strong>Embedded-first thinking</strong>
                <span>Designing around device limits, inference cost, and system reliability.</span>
              </div>
              <div className="focus-item">
                <strong>Applied AI</strong>
                <span>Turning models into field-ready or production-ready systems.</span>
              </div>
              <div className="focus-item">
                <strong>Systems mindset</strong>
                <span>Balancing accuracy, latency, maintainability, and deployment effort.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="education">
          <div className="section-head">
            <div>
              <div className="section-kicker">Education</div>
              <h2>Academic background shaped by hands-on system building</h2>
              <p className="section-copy">
                Electrical engineering training supported by project work in embedded systems, deployment, and applied machine learning.
              </p>
            </div>
          </div>

          <div className="education-grid">
            <div className="panel education-card">
              <div className="card-tag">Starting Sep 2026</div>
              <h3 className="school-name">
                <img className="school-logo" src={cmuLogo} alt="Carnegie Mellon University logo" />
                <span>Carnegie Mellon University</span>
              </h3>
              <p>M.S. in Electrical and Computer Engineering</p>
              <p style={{ marginTop: 8 }}>Pittsburgh, Pennsylvania, USA</p>
            </div>

            <div className="panel education-card">
              <div className="card-tag">Sep 2021 – Jun 2025</div>
              <h3 className="school-name">
                <img className="school-logo" src={nckuLogo} alt="National Cheng Kung University logo" />
                <span>National Cheng Kung University</span>
              </h3>
              <p>B.S. in Electrical Engineering</p>
              <p style={{ marginTop: 8 }}>GPA: 4.01 / 4.3 · Tainan, Taiwan</p>
            </div>
          </div>
        </section>

        <section className="section" id="experience">
          <div className="section-head">
            <div>
              <div className="section-kicker">Experience</div>
              <h2>Production work with measurable outcomes</h2>
              <p className="section-copy">
                Industry experience focused on reliable ML systems, deployment workflows, and outcomes that matter in production.
              </p>
            </div>
          </div>

          <div className="timeline">
            {experiences.map((exp) => (
              <article key={exp.role + exp.org} className="panel timeline-item">
                <div className="timeline-top">
                  <div>
                    <div className="timeline-role">{exp.role}</div>
                    <div className="timeline-org">{exp.org}</div>
                  </div>
                  <div className="timeline-period">{exp.period}</div>
                </div>

                <div className="timeline-summary">{exp.summary}</div>

                <ul>
                  {exp.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>

                <div className="stack">
                  {exp.stack.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="projects">
          <div className="section-head">
            <div>
              <div className="section-kicker">Projects</div>
              <h2>Selected work across research, systems, and deployment</h2>
              <p className="section-copy">
                These projects best reflect the range I enjoy most: efficient models, real-time systems, and practical deployment.
              </p>
            </div>
          </div>

          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.title} className="panel project-card">
                <div className="card-tag">{project.tag}</div>
                <h3>{project.title}</h3>
                <p className="project-summary">{project.summary}</p>
                <div className="project-impact">{project.impact}</div>
                <ul className="detail-list">
                  {project.bullets.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <div className="project-stack">
                  {project.stack.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section" id="skills">
          <div className="section-head">
            <div>
              <div className="section-kicker">Skills</div>
              <h2>Technical toolkit</h2>
              <p className="section-copy">
                Tools and platforms I use most often in embedded systems and applied AI work.
              </p>
            </div>
          </div>

          <div className="skills-grid">
            {skillGroups.map((group) => (
              <div key={group.title} className="panel skill-card">
                <h3>{group.title}</h3>
                <div className="skill-group">
                  {group.items.map((item) => (
                    <span key={item} className="chip">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="section-kicker">Recognition</div>
              <h2>Selected awards</h2>
            </div>
          </div>

          <div className="panel awards-panel">
            <div className="awards-list">
              {awards.map((award) => (
                <div key={award} className="award-item">
                  {award}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel contact" id="contact">
          <div>
            <div className="section-kicker" style={{ color: "#bfdbfe", marginBottom: 8 }}>
              Contact
            </div>
            <h2 style={{ margin: 0, fontSize: "2rem", letterSpacing: "-0.04em", color: "#ffffff" }}>
              Open to practical embedded and edge AI work.
            </h2>
            <p>
              I’m especially interested in roles involving embedded systems, firmware, edge AI, and system-level engineering where reliable deployment matters.
            </p>
          </div>

          <div className="contact-actions">
            <a className="btn btn-light" href={`mailto:${email}`}>
              Email me
            </a>
            <a className="btn btn-ghost" href={githubUrl} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="btn btn-ghost" href={linkedinUrl} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
