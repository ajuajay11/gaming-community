"use client";

import { useRouter } from "@/i18n/navigation";
import { useRef, useState, useTransition } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import {
  KycFaceCapture,
  type KycFaceCaptureHandle,
} from "@/components/kyc/KycFaceCapture";
import { kycService } from "@/services/kyc.service";
import { ApiError } from "@/lib/api/types";
import { SELECT_OPTION_CLASS } from "@/lib/listingRegions";

const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
type Gender = (typeof GENDERS)[number];

const COUNTRIES = [
  { code: "IN", label: "India", nationality: "Indian" },
  { code: "AE", label: "United Arab Emirates", nationality: "Emirati" },
  { code: "US", label: "United States", nationality: "American" },
  { code: "GB", label: "United Kingdom", nationality: "British" },
  { code: "SG", label: "Singapore", nationality: "Singaporean" },
];

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface FormState {
  fullName: string;
  dateOfBirth: string;
  gender: Gender | "";
  nationality: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const INITIAL: FormState = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "Indian",
  address: "",
  city: "",
  state: "Kerala",
  zipCode: "",
  country: "IN",
};

function isAdult(isoDate: string): boolean {
  if (!isoDate) return false;
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  const age = today.getFullYear() - d.getFullYear() - (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0);
  return age >= 18;
}

export function KycForm() {
  const router = useRouter();
  const captureRef = useRef<KycFaceCaptureHandle>(null);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [faceValid, setFaceValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const onCountryChange = (code: string) => {
    const match = COUNTRIES.find((c) => c.code === code);
    update("country", code);
    if (match && !form.nationality) update("nationality", match.nationality);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!faceValid) {
      return setError(
        "Center your face until the frame turns green, then submit.",
      );
    }
    if (!form.fullName.trim()) return setError("Enter your full legal name.");
    if (!form.dateOfBirth) return setError("Enter your date of birth.");
    if (!isAdult(form.dateOfBirth))
      return setError("You must be 18 or older to verify on Kerala Hub.");
    if (!form.gender) return setError("Select a gender.");
    for (const k of ["nationality", "address", "city", "state", "zipCode", "country"] as const) {
      if (!form[k]) return setError("Please fill every address field.");
    }

    start(async () => {
      try {
        const photo = await captureRef.current?.captureFrame();
        if (!photo) {
          setError("Could not capture from camera. Check permissions and try again.");
          return;
        }
        if (photo.size > MAX_PHOTO_BYTES) {
          setError("Captured image is too large. Try better lighting or reload.");
          return;
        }
        await kycService.submitKyc({
          fullName: form.fullName.trim(),
          dateOfBirth: form.dateOfBirth,
          gender: form.gender as Gender,
          nationality: form.nationality.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zipCode: form.zipCode.trim(),
          country: form.country,
          profilePicture: photo,
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not submit.");
      }
    });
  };

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5 md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col items-center gap-3 md:items-start">
        <KycFaceCapture
          ref={captureRef}
          onValidityChange={setFaceValid}
        />
        <p className="max-w-[280px] text-[11px] leading-relaxed text-gray-500">
          We store one live snapshot with your KYC record. It is not your public
          profile photo — that avatar is set in{" "}
          <span className="text-gray-300">Profile → Edit</span>.
        </p>
      </aside>

      <div className="flex flex-col gap-5">
        <Section title="Identity">
          <Field label="Full legal name">
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="As shown on your government ID"
              required
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Date of birth">
              <input
                type="date"
                className="input"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
            </Field>
            <Field label="Gender">
              <select
                className="input capitalize"
                value={form.gender}
                onChange={(e) => update("gender", e.target.value as Gender)}
                required
              >
                <option value="" className={SELECT_OPTION_CLASS}>
                  Select…
                </option>
                {GENDERS.map((g) => (
                  <option key={g} value={g} className={SELECT_OPTION_CLASS}>
                    {g.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Nationality">
            <input
              className="input"
              value={form.nationality}
              onChange={(e) => update("nationality", e.target.value)}
              placeholder="Indian, American…"
              required
            />
          </Field>
        </Section>

        <Section title="Address">
          <Field label="Street address">
            <textarea
              className="input min-h-[80px]"
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Flat / house, street, landmark"
              required
            />
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="City">
              <input
                className="input"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </Field>
            <Field label="State / Region">
              <input
                className="input"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                required
              />
            </Field>
            <Field label="ZIP / Postal code">
              <input
                className="input"
                value={form.zipCode}
                onChange={(e) => update("zipCode", e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Country">
            <select
              className="input"
              value={form.country}
              onChange={(e) => onCountryChange(e.target.value)}
              required
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code} className={SELECT_OPTION_CLASS}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-gray-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
          <p>
            By submitting, you confirm the information is accurate. We store it
            securely and share it only with regulators when legally required.
            See our{" "}
            <a href="/privacy" className="text-gray-200 underline">
              privacy policy
            </a>
            .
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300"
          >
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending || !faceValid}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 px-6 py-3 text-sm font-bold text-black disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Submit verification
          </button>
        </div>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 0.6rem 0.8rem;
          font-size: 0.875rem;
          color: inherit;
          outline: none;
        }
        .input:focus {
          border-color: rgba(34, 211, 238, 0.6);
        }
      `}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-300">
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </span>
      {children}
    </label>
  );
}
