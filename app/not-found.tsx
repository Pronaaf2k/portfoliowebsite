import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found">
      <div>
        <p className="eyebrow">Signal lost / 404</p>
        <h1>Wrong lobby.</h1>
        <p>The page you followed is not in this build.</p>
        <Link className="button button-primary" href="/">
          <ArrowLeft size={17} aria-hidden="true" />
          Back home
        </Link>
      </div>
    </main>
  );
}
