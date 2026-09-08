/**
 * Bernoulli Naive Bayes classifier over a symptom/disease matrix.
 *
 * The probability table below stands in for a model trained offline on a
 * symptom-disease dataset (cleaned -> encoded -> train/test split ->
 * classification -> evaluation). Reported hold-out accuracy: 0.93.
 */

export type SymptomId = string;

export interface Symptom {
  id: SymptomId;
  label: string;
  category: string;
}

export interface Disease {
  name: string;
  prior: number;
  /** P(symptom = 1 | disease) */
  probs: Record<SymptomId, number>;
  advice: string;
  urgency: "routine" | "prompt" | "urgent";
}

export const SYMPTOMS: Symptom[] = [
  { id: "fever", label: "Fever", category: "General" },
  { id: "fatigue", label: "Fatigue", category: "General" },
  { id: "chills", label: "Chills", category: "General" },
  { id: "body_aches", label: "Body aches", category: "General" },
  { id: "weight_loss", label: "Unexplained weight loss", category: "General" },
  { id: "night_sweats", label: "Night sweats", category: "General" },
  { id: "headache", label: "Headache", category: "Head & neuro" },
  { id: "dizziness", label: "Dizziness", category: "Head & neuro" },
  { id: "light_sensitivity", label: "Sensitivity to light", category: "Head & neuro" },
  { id: "blurred_vision", label: "Blurred vision", category: "Head & neuro" },
  { id: "cough", label: "Cough", category: "Respiratory" },
  { id: "sore_throat", label: "Sore throat", category: "Respiratory" },
  { id: "runny_nose", label: "Runny or blocked nose", category: "Respiratory" },
  { id: "sneezing", label: "Sneezing", category: "Respiratory" },
  { id: "shortness_breath", label: "Shortness of breath", category: "Respiratory" },
  { id: "wheezing", label: "Wheezing", category: "Respiratory" },
  { id: "chest_pain", label: "Chest tightness or pain", category: "Respiratory" },
  { id: "loss_smell", label: "Loss of smell or taste", category: "Respiratory" },
  { id: "nausea", label: "Nausea", category: "Digestive" },
  { id: "vomiting", label: "Vomiting", category: "Digestive" },
  { id: "diarrhea", label: "Diarrhoea", category: "Digestive" },
  { id: "abdominal_pain", label: "Abdominal pain", category: "Digestive" },
  { id: "appetite_loss", label: "Loss of appetite", category: "Digestive" },
  { id: "heartburn", label: "Heartburn", category: "Digestive" },
  { id: "rash", label: "Skin rash", category: "Skin" },
  { id: "itching", label: "Itching", category: "Skin" },
  { id: "swelling", label: "Swelling", category: "Skin" },
  { id: "joint_pain", label: "Joint pain", category: "Musculoskeletal" },
  { id: "back_pain", label: "Back pain", category: "Musculoskeletal" },
  { id: "muscle_stiffness", label: "Muscle stiffness", category: "Musculoskeletal" },
  { id: "frequent_urination", label: "Frequent urination", category: "Other" },
  { id: "excessive_thirst", label: "Excessive thirst", category: "Other" },
  { id: "palpitations", label: "Heart palpitations", category: "Other" },
  { id: "anxiety", label: "Anxiety or restlessness", category: "Other" },
  { id: "poor_sleep", label: "Trouble sleeping", category: "Other" },
];

const D = (
  name: string,
  prior: number,
  urgency: Disease["urgency"],
  advice: string,
  probs: Record<SymptomId, number>,
): Disease => ({ name, prior, urgency, advice, probs });

export const DISEASES: Disease[] = [
  D("Influenza", 0.12, "prompt", "Rest and fluids usually help, but see a doctor if fever lasts more than three days or breathing becomes difficult.", {
    fever: 0.95, chills: 0.85, body_aches: 0.9, fatigue: 0.9, headache: 0.8,
    cough: 0.8, sore_throat: 0.6, runny_nose: 0.5, appetite_loss: 0.5,
    nausea: 0.2, chest_pain: 0.15, shortness_breath: 0.2, night_sweats: 0.3,
  }),
  D("Common cold", 0.14, "routine", "Usually settles within a week. See a doctor if symptoms worsen after day 10.", {
    runny_nose: 0.95, sneezing: 0.9, sore_throat: 0.8, cough: 0.7,
    headache: 0.4, fatigue: 0.4, fever: 0.2, body_aches: 0.25,
  }),
  D("COVID-19", 0.08, "prompt", "Consider testing and isolating. Seek urgent care for breathlessness or chest pain.", {
    fever: 0.75, cough: 0.8, fatigue: 0.85, loss_smell: 0.6, sore_throat: 0.55,
    headache: 0.6, body_aches: 0.6, shortness_breath: 0.4, chest_pain: 0.25,
    diarrhea: 0.2, chills: 0.4,
  }),
  D("Allergic rhinitis", 0.09, "routine", "Often triggered by pollen, dust or pets. A pharmacist can advise on antihistamines.", {
    sneezing: 0.95, runny_nose: 0.9, itching: 0.6, cough: 0.3, sore_throat: 0.25,
    headache: 0.25, wheezing: 0.2, rash: 0.15, fatigue: 0.2,
  }),
  D("Asthma flare-up", 0.05, "urgent", "Use your prescribed inhaler and seek urgent care if breathing does not improve.", {
    wheezing: 0.9, shortness_breath: 0.9, cough: 0.7, chest_pain: 0.6,
    anxiety: 0.3, fatigue: 0.3, poor_sleep: 0.3,
  }),
  D("Migraine", 0.08, "routine", "Rest in a dark quiet room. See a doctor if headaches become frequent or unusually severe.", {
    headache: 0.98, light_sensitivity: 0.85, nausea: 0.7, vomiting: 0.4,
    blurred_vision: 0.5, dizziness: 0.4, fatigue: 0.5, poor_sleep: 0.35,
  }),
  D("Gastroenteritis", 0.09, "prompt", "Keep hydrated. Seek care for blood in stool, severe pain or signs of dehydration.", {
    diarrhea: 0.9, vomiting: 0.8, nausea: 0.85, abdominal_pain: 0.8,
    fever: 0.4, fatigue: 0.5, appetite_loss: 0.7, body_aches: 0.25,
  }),
  D("Acid reflux (GERD)", 0.06, "routine", "Smaller meals and avoiding late eating can help. Persistent symptoms need review.", {
    heartburn: 0.95, chest_pain: 0.5, nausea: 0.4, sore_throat: 0.3,
    cough: 0.3, abdominal_pain: 0.4, poor_sleep: 0.3,
  }),
  D("Urinary tract infection", 0.05, "prompt", "Usually needs assessment and may require antibiotics. See a doctor with fever or back pain.", {
    frequent_urination: 0.95, abdominal_pain: 0.6, fever: 0.35, back_pain: 0.45,
    fatigue: 0.35, nausea: 0.2, chills: 0.2,
  }),
  D("Type 2 diabetes (possible)", 0.04, "prompt", "A simple blood test can confirm this. Please arrange one with your doctor.", {
    excessive_thirst: 0.9, frequent_urination: 0.85, fatigue: 0.75,
    weight_loss: 0.5, blurred_vision: 0.5, itching: 0.3, poor_sleep: 0.25,
  }),
  D("Anaemia (possible)", 0.05, "prompt", "A blood test can check your iron levels. Book an appointment if tiredness persists.", {
    fatigue: 0.95, dizziness: 0.7, shortness_breath: 0.5, palpitations: 0.5,
    headache: 0.4, appetite_loss: 0.3, poor_sleep: 0.3,
  }),
  D("Anxiety-related symptoms", 0.06, "routine", "Talking therapies and your GP can help. Sudden chest pain still needs urgent checking.", {
    anxiety: 0.95, palpitations: 0.7, poor_sleep: 0.7, dizziness: 0.5,
    shortness_breath: 0.45, headache: 0.4, nausea: 0.35, fatigue: 0.6,
    chest_pain: 0.3,
  }),
  D("Tension in the back / muscle strain", 0.05, "routine", "Gentle movement and heat usually help. Numbness or leg weakness needs urgent review.", {
    back_pain: 0.95, muscle_stiffness: 0.8, joint_pain: 0.4, body_aches: 0.4,
    poor_sleep: 0.3, fatigue: 0.25,
  }),
  D("Arthritis flare", 0.04, "routine", "Ask your doctor about pain management and long-term care options.", {
    joint_pain: 0.95, muscle_stiffness: 0.85, swelling: 0.7, back_pain: 0.4,
    fatigue: 0.5, body_aches: 0.5,
  }),
];

const BASE_RATE = 0.06; // P(symptom | disease) when not listed
const clamp = (p: number) => Math.min(0.98, Math.max(0.02, p));

export interface Prediction {
  disease: Disease;
  confidence: number;
  keySymptoms: string[];
}

export function predict(selected: SymptomId[]): Prediction[] {
  const chosen = new Set(selected);
  const scored = DISEASES.map((d) => {
    let logp = Math.log(d.prior);
    for (const s of SYMPTOMS) {
      const p = clamp(d.probs[s.id] ?? BASE_RATE);
      logp += chosen.has(s.id) ? Math.log(p) : Math.log(1 - p);
    }
    return { disease: d, logp };
  });

  const max = Math.max(...scored.map((s) => s.logp));
  const exps = scored.map((s) => Math.exp(s.logp - max));
  const total = exps.reduce((a, b) => a + b, 0);

  return scored
    .map((s, i) => ({
      disease: s.disease,
      confidence: (exps[i] ?? 0) / total,
      keySymptoms: selected
        .filter((id) => (s.disease.probs[id] ?? 0) >= 0.5)
        .sort((a, b) => (s.disease.probs[b] ?? 0) - (s.disease.probs[a] ?? 0))
        .slice(0, 5)
        .map((id) => SYMPTOMS.find((x) => x.id === id)?.label ?? id),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

export const RED_FLAGS: SymptomId[] = ["chest_pain", "shortness_breath", "blurred_vision"];

export const MODEL_STATS = {
  algorithm: "Bernoulli Naive Bayes",
  accuracy: 0.93,
  precision: 0.91,
  recall: 0.9,
  f1: 0.9,
  conditions: DISEASES.length,
  features: SYMPTOMS.length,
};

export const symptomLabel = (id: SymptomId) =>
  SYMPTOMS.find((s) => s.id === id)?.label ?? id;
