import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ErrorSignalGame } from "@/components/error-signal-game";

export default function NotFound() {
  return (
    <main className="not-found">
      <div className="not-found-shell">
        <div className="not-found-copy">
          <p className="eyebrow">Signal lost / 404</p>
          <h1>
            Wrong
            <br />
            lobby.
          </h1>
          <p>
            The page you followed is not in this build. Find another route or
            head home.
          </p>
          <Link className="button button-primary" href="/">
            <ArrowLeft size={17} aria-hidden="true" />
            Back home
          </Link>
        </div>
        <ErrorSignalGame />
      </div>
    </main>
  );
}
