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
            The page you followed is not in this build. Repair the panel to
            unlock the route home.
          </p>
        </div>
        <ErrorSignalGame />
      </div>
    </main>
  );
}
