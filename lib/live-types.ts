export type SignalState = "live" | "snapshot" | "offline";

export type LivePayload = {
  generatedAt: string;
  github: {
    state: SignalState;
    title: string;
    detail: string;
    meta: string;
    href: string;
  };
  steam: {
    state: SignalState;
    title: string;
    detail: string;
    meta: string;
    href: string;
  };
  spotify: {
    state: SignalState;
    title: string;
    detail: string;
    meta: string;
    href: string;
  };
};
