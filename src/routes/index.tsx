import { createFileRoute, Link } from "@tanstack/react-router";
import { MODEL_STATS } from "@/lib/disease-model";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Disease Predictor — Symptom-based ML Demo" },
      {
        name: "description",
        content:
          "Select your symptoms and see which conditions a machine learning model considers most likely, with confidence scores. Educational only.",
      },
      { property: "og:title", content: "Smart Disease Predictor" },
      {
        property: "og:description",
        content:
          "A symptom-based machine learning demo with confidence scores, explainability and clear medical safety notices.",
      },
    ],
  }),
  component: Index,
});

const steps = [
  { n: "01", t: "Pick your symptoms", d: "Search and tick everything you're experiencing right now." },
  { n: "02", t: "The model scores them", d: "Your selection becomes a feature vector the classifier evaluates." },
  { n: "03", t: "See ranked results", d: "Top three conditions with confidence and the symptoms that drove them." },
  { n: "04", t: "Talk to a professional", d: "Every result ends with guidance to get a proper medical opinion." },
];

function Index() {
  return (
    <>
      <section className="bg-hero text-primary-foreground">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.15fr_1fr] md:items-center md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-widest">
              Machine learning · educational
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Understand what your symptoms might mean.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/85 md:text-lg">
              Tick the symptoms you have and a trained classification model ranks the conditions most
              consistent with them — with a confidence score and the reasoning behind it. It is a
              learning tool, never a diagnosis.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/predict"
                className="rounded-xl bg-primary-foreground px-6 py-3 font-medium text-foreground shadow-lift transition-transform hover:-translate-y-0.5"
              >
                Start prediction
              </Link>
              <Link
                to="/how-it-works"
                className="rounded-xl border border-primary-foreground/35 px-6 py-3 font-medium transition-colors hover:bg-primary-foreground/10"
              >
                How the model works
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur">
            <p className="text-xs uppercase tracking-widest text-primary-foreground/70">Model report card</p>
            <dl className="mt-5 grid grid-cols-2 gap-5">
              {[
                ["Test accuracy", `${Math.round(MODEL_STATS.accuracy * 100)}%`],
                ["F1-score", MODEL_STATS.f1.toFixed(2)],
                ["Conditions", String(MODEL_STATS.conditions)],
                ["Symptom features", String(MODEL_STATS.features)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm text-primary-foreground/70">{k}</dt>
                  <dd className="font-display text-3xl font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-primary-foreground/20 pt-4 text-sm text-primary-foreground/75">
              {MODEL_STATS.algorithm} · precision {MODEL_STATS.precision.toFixed(2)} · recall{" "}
              {MODEL_STATS.recall.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16">
        <h2 className="text-2xl font-semibold md:text-3xl">Four steps, start to finish</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="font-display text-sm font-semibold text-primary">{s.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20">
        <div className="rounded-2xl border-l-4 border-l-warning border-y border-r border-border bg-card p-6 shadow-card">
          <h2 className="text-lg font-semibold">Important medical notice</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Results here are generated by a machine learning model for informational and educational
            purposes only. They are not a medical diagnosis and must not replace professional advice.
            If your symptoms are severe, persistent, getting worse, or simply worrying you, please see a
            qualified doctor. For chest pain, difficulty breathing, or sudden severe symptoms, seek
            emergency care immediately.
          </p>
        </div>
      </section>
    </>
  );
}
