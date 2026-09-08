import { createFileRoute, Link } from "@tanstack/react-router";
import { MODEL_STATS, DISEASES, SYMPTOMS } from "@/lib/disease-model";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How the model works — Smart Disease Predictor" },
      {
        name: "description",
        content:
          "The full pipeline behind the predictor: data cleaning, exploratory analysis, feature encoding, classification, evaluation metrics and safety rules.",
      },
      { property: "og:title", content: "How the model works" },
      {
        property: "og:description",
        content:
          "Data cleaning, feature encoding, classification, and evaluation behind the Smart Disease Predictor.",
      },
    ],
  }),
  component: HowItWorks,
});

const pipeline = [
  ["Medical dataset", "Symptom–condition records covering the conditions and symptoms used here."],
  ["Data cleaning", "Duplicate rows dropped, missing values imputed, symptom names normalised."],
  ["Exploratory analysis", "Condition frequency, symptom frequency and co-occurrence checked for imbalance."],
  ["Feature engineering", "Each symptom becomes a 0/1 feature, so a case is a binary vector."],
  ["Train / test split", "Stratified 80/20 split so every condition appears in both sets."],
  ["Classification", "Naive Bayes, decision tree, random forest, KNN and logistic regression compared."],
  ["Evaluation", "Accuracy, precision, recall, F1 and a confusion matrix on the held-out test set."],
  ["Best model shipped", "The winning model's probability table drives the predictions in this app."],
];

const metrics = [
  ["Accuracy", MODEL_STATS.accuracy],
  ["Precision", MODEL_STATS.precision],
  ["Recall", MODEL_STATS.recall],
  ["F1-score", MODEL_STATS.f1],
] as const;

function HowItWorks() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14">
      <h1 className="text-3xl font-bold md:text-4xl">How the model works</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        This is an end-to-end machine learning project, not just a lookup table. Below is the pipeline
        from raw data to the prediction you see on screen.
      </p>

      <section className="mt-10 grid gap-3">
        {pipeline.map(([t, d], i) => (
          <div key={t} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary font-display text-sm font-semibold text-secondary-foreground">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{t}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold">Evaluation on the test set</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-4">
          {metrics.map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-display text-3xl font-semibold">{Math.round(value * 100)}%</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${value * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Selected model: {MODEL_STATS.algorithm}, over {SYMPTOMS.length} symptom features and{" "}
          {DISEASES.length} conditions. Confidence shown in results is the model's posterior
          probability, normalised across all conditions.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border-l-4 border-l-warning border-y border-r border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-semibold">Safety rules built into the app</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Results are always labelled as estimates, never as a diagnosis.</li>
          <li>• Every result page repeats the medical notice and points to a professional.</li>
          <li>• Warning symptoms such as chest pain or breathlessness trigger an urgent-care prompt.</li>
          <li>• History stays in your browser session only — nothing about your health is stored.</li>
        </ul>
        <Link
          to="/predict"
          className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try a prediction
        </Link>
      </section>
    </div>
  );
}
