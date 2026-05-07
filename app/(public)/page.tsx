import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="unz-landing">
      <header className="unz-landing-header">
        <Image
          src="/unzipets/ui/logo.png"
          alt="UNZIPETS"
          width={360}
          height={140}
          className="unz-landing-logo"
          priority
        />
      </header>

      <section className="unz-landing-hero">
        <h1 className="unz-landing-title">
          THEY&apos;RE NOT NORMAL PLUSHIES.
        </h1>

        <div className="unz-landing-subtitle">
          <span>THEY ARE</span>

          <Image
            src="/unzipets/ui/logo.png"
            alt="UNZIPETS"
            width={280}
            height={110}
            className="unz-landing-inline-logo"
          />
        </div>

        <div className="unz-landing-plushies-wrap">
          <Image
            src="/unzipets/landing/Peluches_landing.png"
            alt="UNZIPETS plushies"
            width={1400}
            height={760}
            className="unz-landing-plushies"
            priority
          />
        </div>
      </section>

      <section className="unz-landing-socials">
        <a href="#" className="unz-landing-social">
          Instagram
        </a>

        <a href="#" className="unz-landing-social">
          YouTube
        </a>

        <a href="#" className="unz-landing-social">
          TikTok
        </a>
      </section>

      <section className="unz-landing-features">
        <ul>
          <li>UNIQUE ZIPPER DESIGN</li>
          <li>SOFT PREMIUM PLUSH</li>
          <li>COLLECTIBLE CHARACTERS</li>
          <li>PERFECT FOR GIFTS</li>
        </ul>
      </section>

      <footer className="unz-landing-footer">
        <Link href="/case/flash" className="unz-landing-cta">
          EXPLORE MORE
        </Link>
      </footer>
    </main>
  );
}