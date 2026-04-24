import Link from "next/link";
import styles from "./page.module.css";

const landingShowcaseImages = [
  {
    src: "/landing/dashboard-salary-trends.png",
    alt: "Salary trends chart from the dashboard",
  },
  {
    src: "/landing/dashboard-advanced-filtering.png",
    alt: "Advanced filtering panel with role and salary filters",
  },
  {
    src: "/landing/dashboard-salary-by-title.png",
    alt: "Salary by job title visualization",
  },
  {
    src: "/landing/dashboard-salary-benchmarks.png",
    alt: "Salary benchmark cards across technical roles",
  },
  {
    src: "/landing/dashboard-top-countries.png",
    alt: "Top countries ranked by job count",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>Job Data Analytics</div>

          <nav className={styles.desktopNav} aria-label="Primary">
            <a href="#" className={styles.navActive}>
              Platform
            </a>
          </nav>

          <Link href="/dashboard" className={styles.headerCta}>
            Go to Dashboard
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              <span className={styles.gradientText}>
                Navigate Your Data Career
              </span>
              <span className={styles.titleLine}>
                with Real Market Insights
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              Analyze real job postings, track global salary trends, and
              discover in-demand skills to land your dream role.
            </p>

            <div className={styles.heroActions}>
              <Link href="/dashboard" className={styles.primaryCta}>
                Explore Dashboard
              </Link>
              <div className={styles.badge}>
                <span className={styles.badgeDot}>✓</span>
                No credit card required
              </div>
            </div>
          </div>

          <div className={styles.previewWrap}>
            <div className={styles.previewCard}>
              <div className={styles.previewTopBar}>
                <p>Live Product Preview</p>
                <span>Scroll Gallery</span>
              </div>

              <div className={styles.previewGallery}>
                {landingShowcaseImages.map((image, index) => (
                  <figure className={styles.previewShot} key={image.src}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className={styles.previewImage}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </figure>
                ))}
              </div>

              <div className={styles.floatingChip}>
                <div className={styles.chipIcon}>↗</div>
                <div>
                  <p className={styles.chipLabel}>AVG. DATA SCIENTIST</p>
                  <p className={styles.chipValue}>
                    $142,500 <span className={styles.chipGrowth}>+8.4%</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.featuresSection}>
          <div className={styles.featuresIntro}>
            <h2>Tools Built for Career Precision</h2>
            <p>
              Stop guessing what the market wants. Leverage billions of data
              points to optimize your career trajectory.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>⌁</div>
              <h3>Precision Job Filtering</h3>
              <p>
                Cut through generic job boards. Filter roles by specific tech
                stacks, remote policies, and true seniority requirements based
                on historical hiring data.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>◉</div>
              <h3>Global Salary Insights</h3>
              <p>
                Navigate compensation negotiations with confidence. View
                verified salary bands adjusted for local cost-of-living and
                total compensation packages.
              </p>
            </article>

            <article className={styles.featureCard}>
              <div className={styles.featureIcon}>⌃</div>
              <h3>In-Demand Skill Tracking</h3>
              <p>
                Identify which frameworks and tools are surging in job
                descriptions before they become mainstream. Future-proof your
                learning roadmap.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>Job Data Analytics</div>
          <p>© 2024 Job Data Analytics. Data-driven career intelligence.</p>
        </div>
      </footer>
    </div>
  );
}
