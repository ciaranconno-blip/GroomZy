"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, limit, getDocs, doc, updateDoc } from "firebase/firestore";
import { Loader2, Save, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";
import type { Business } from "@/lib/business";

export default function BusinessSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState<Business["hours"]>([]);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [googleReviews, setGoogleReviews] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "businesses"), where("ownerId", "==", user.uid), limit(1));
    getDocs(q).then((snap) => {
      if (snap.empty) {
        router.push("/signup?step=2");
        return;
      }
      const d = snap.docs[0];
      const b = { id: d.id, ...d.data() } as Business;
      setBusiness(b);
      setTagline(b.tagline ?? "");
      setPhone(b.phone ?? "");
      setHours(b.hours ?? []);
      setInstagram(b.socials?.instagram ?? "");
      setFacebook(b.socials?.facebook ?? "");
      setGoogleReviews(b.socials?.googleReviews ?? "");
      setLoading(false);
    });
  }, [user, router]);

  function updateHour(day: string, field: "open" | "close" | "closed", value: string | boolean) {
    setHours((prev) => prev.map((h) => (h.day === day ? { ...h, [field]: value } : h)));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateDoc(doc(db, "businesses", business.id), {
        tagline,
        phone,
        hours,
        socials: {
          ...(instagram && { instagram }),
          ...(facebook && { facebook }),
          ...(googleReviews && { googleReviews }),
        },
      });
      setSaved(true);
    } catch (err) {
      console.error("Failed to save business settings:", err);
      setError("Couldn't save your changes — please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading || !business) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Business Settings</h1>
          <p className="text-xs text-white/50">{business.businessName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="glass-card p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Profile</label>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Tagline"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            required
            className="w-full glass-input text-sm px-3 py-2.5"
          />
        </div>

        <div className="glass-card p-4 space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Social &amp; Reviews</label>
          <p className="text-[11px] text-white/40 -mt-1">
            Shown as links on your public booking page. Leave blank to hide.
          </p>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram URL (e.g. https://instagram.com/yourbusiness)"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <input
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="Facebook URL"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
          <input
            value={googleReviews}
            onChange={(e) => setGoogleReviews(e.target.value)}
            placeholder="Google Reviews URL"
            className="w-full glass-input text-sm px-3 py-2.5"
          />
        </div>

        <div className="glass-card p-4 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50">Opening Hours</label>
          {hours.map((h) => (
            <div key={h.day} className="flex items-center gap-2">
              <span className="text-xs text-white/70 w-9 flex-shrink-0">{h.day}</span>
              <input
                type="time"
                value={h.open}
                disabled={h.closed}
                onChange={(e) => updateHour(h.day, "open", e.target.value)}
                className="glass-input text-xs px-2 py-1.5 flex-1 disabled:opacity-30"
              />
              <span className="text-white/30 text-xs">–</span>
              <input
                type="time"
                value={h.close}
                disabled={h.closed}
                onChange={(e) => updateHour(h.day, "close", e.target.value)}
                className="glass-input text-xs px-2 py-1.5 flex-1 disabled:opacity-30"
              />
              <label className="flex items-center gap-1 text-[11px] text-white/50 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={h.closed ?? false}
                  onChange={(e) => updateHour(h.day, "closed", e.target.checked)}
                />
                Closed
              </label>
            </div>
          ))}
        </div>

        {error && <div className="glass-card p-3 text-xs text-red-300 border-red-400/30 bg-red-500/5">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-violet-500 hover:bg-violet-400 disabled:opacity-50 text-white text-sm font-bold shadow-lg shadow-violet-500/25"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
