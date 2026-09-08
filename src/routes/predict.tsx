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
  component: PredictPage;
});

function PredictPage() {
  return null;
}
