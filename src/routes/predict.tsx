import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  SYMPTOMS,
  RED_FLAGS,
  predict,
  symptomLabel,
  type Prediction,
} from "@/lib/disease-model";
import { addHistory, clearHistory, useHistory } from "@/lib/history";

export const Route = createFileRoute("/predict")({
  head: () => ({
    meta: [
      { title: "Symptom checker — Smart Disease Predictor" },
      {
        name: "description",
        content:
          "Select your symptoms and get the three most likely conditions with confidence scores from the machine learning model. Educational use only.",
      },
      { property: "og:title", content: "Symptom checker" },
      {
        property: "og:description",
        content:
          "Pick symptoms, get ranked conditions with confidence and explanation. Not a medical diagnosis.",
      },
    ],
  }),
  component: PredictPage,
});

const pct = (n: number) => `${Math.round(n * 100)}%`;

const urgencyCopy = {
  routine: "Usually manageable, but book a check-up if it drags on.",
  prompt: "Worth getting checked by a doctor fairly soon.",
  urgent: "Please seek medical attention promptly.",
} as const;

function PredictPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<Prediction[] | null>(null);
  const [submitted, setSubmitted] = useState<string[]>([]);
  const history = useHistory();

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const map = new Map<string, typeof SYMPTOMS>();
    for (const s of SYMPTOMS) {
      if (q && !s.label.toLowerCase().includes(q)) continue;
      map.set(s.category, [...(map.get(s.category) ?? []), s]);
    }
    return [...map.entries()];
  }, [query]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const runPrediction = () => {
    if (selected.length === 0) return;
    const out = predict(selected);
    setResults(out);
    setSubmitted(selected);
    const top = out[0];
    if (top) {
      addHistory({
        symptoms: selected.map(symptomLabel),
        prediction: top.disease.name,
        confidence: top.confidence,
      });
    }
    if (typeof window !== "undefined") {
      requestAnimationFrame(() =>
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  const hasRedFlag = submitted.some((s) => RED_FLAGS.includes(s));
  const top = results?.[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="text-3xl font-bold md:text-4xl">Select your symptoms</h1>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
        Tick everything you're experiencing. The more accurate your selection, the more meaningful the
        model's estimate — which is still only an estimate.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search symptoms…"
              aria-label="Search symptoms"
              className="min-w-52 flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="button"
              onClick={() => {
                setSelected([]);
                setResults(null);
                setSubmitted([]);
              }}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              Clear selection
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {grouped.map(([category, items]) => (
              <div key={category}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {category}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((s) => {
                    const on = selected.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(s.id)}
                        className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
                          on
                            ? "border-primary bg-primary text-primary-foreground shadow-card"
                            : "border-border bg-background text-foreground hover:border-primary/50 hover:bg-secondary"
                        }`}
                      >
                        {on ? "✓ " : ""}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {grouped.length === 0 && (
              <p className="text-sm text-muted-foreground">No symptoms match "{query}".</p>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-semibold">Your symptoms</h2>
            {selected.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Nothing selected yet.</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {selected.map((id) => (
                  <li
                    key={id}
                    className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                  >
                    {symptomLabel(id)}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={runPrediction}
              disabled={selected.length === 0}
              className="mt-5 w-full rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Predict condition
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Estimates only — this is not a diagnosis.
            </p>
          </div>

          {history.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">This session</h2>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Clear
                </button>
              </div>
              <ul className="mt-3 space-y-3">
                {history.map((h) => (
                  <li key={h.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-medium">
                      {h.prediction} · {pct(h.confidence)}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {new Date(h.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} —{" "}
                      {h.symptoms.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Kept in this browser session only, never saved anywhere.
              </p>
            </div>
          )}
        </aside>
      </div>

      {results && top && (
        <section id="results" className="mt-14 scroll-mt-24">
          <h2 className="text-2xl font-semibold md:text-3xl">Results</h2>

          {hasRedFlag && (
            <div className="mt-5 rounded-2xl border-l-4 border-l-destructive border-y border-r border-border bg-card p-5 shadow-card">
              <p className="font-semibold text-destructive">Please don't wait on this</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                You selected a symptom that can signal something serious (such as chest pain,
                breathlessness or sudden vision change). Contact a doctor or emergency services now
                rather than relying on this tool.
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Most likely condition
              </p>
              <p className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                {top.disease.name}
              </p>
              <div className="mt-5 flex items-center gap-4">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.max(4, top.confidence * 100)}%` }}
                  />
                </div>
                <span className="font-display text-xl font-semibold">{pct(top.confidence)}</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {urgencyCopy[top.disease.urgency]} {top.disease.advice}
              </p>

              {top.keySymptoms.length > 0 && (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-sm font-medium">Symptoms that drove this result</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {top.keySymptoms.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-secondary px-3 py-1.5 text-sm text-secondary-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Top 3 estimates
              </p>
              <ol className="mt-4 space-y-4">
                {results.map((r, i) => (
                  <li key={r.disease.name}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">
                        {i + 1}. {r.disease.name}
                      </span>
                      <span className="text-muted-foreground">{pct(r.confidence)}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${i === 0 ? "bg-primary" : "bg-accent"}`}
                        style={{ width: `${Math.max(2, r.confidence * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-sm font-medium">You reported</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {submitted.map(symptomLabel).join(", ")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border-l-4 border-l-warning border-y border-r border-border bg-card p-6 shadow-card">
            <h3 className="font-semibold">Important medical notice</h3>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              This result is generated by a machine learning model for informational and educational
              purposes only. It is not a medical diagnosis and should not replace professional medical
              advice. Please consult a qualified doctor or healthcare professional for an accurate
              evaluation. Seek care sooner if your symptoms are severe, persistent, getting worse, or
              worrying you.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
