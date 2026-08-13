"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Check, PhoneCall, Bell, LogOut, Loader2, CalendarCheck2, CalendarPlus, X } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/lib/useAuth";

interface BookingDoc {
  id: string;
  time: string;
  date: string;
  dogName: string;
  breedName: string;
  serviceName: string;
  ownerName: string;
  ownerPhone: string;
  notes?: string;
  status: string;
}

interface EnquiryDoc {
  id: string;
  dogName: string;
  breedName: string;
  ownerName: string;
  ownerPhone: string;
  createdAt: Timestamp | null;
}

interface WaitlistDoc {
  id: string;
  dogName: string;
  ownerName: string;
  ownerPhone: string;
  wantsDate: string;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      }
    >
      <AdminPageInner />
    </Suspense>
  );
}

function AdminPageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [appointments, setAppointments] = useState<BookingDoc[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryDoc[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);
  const [calendarBanner, setCalendarBanner] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("calendar");
    const err = searchParams.get("calendar_error");
    if (status === "connected") {
      setCalendarConnected(true);
      setCalendarBanner("Google Calendar connected — new bookings will sync automatically.");
    } else if (err) {
      setCalendarBanner(
        err === "access_denied"
          ? "Calendar connection cancelled."
          : "Couldn't connect Google Calendar — try again."
      );
    }
    if (status || err) router.replace("/admin");
  }, [searchParams, router]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/auth/google/status?uid=${user.uid}`)
      .then((r) => r.json())
      .then((d) => setCalendarConnected((prev) => (prev === true ? true : d.connected)))
      .catch(() => setCalendarConnected(false));
  }, [user]);

  async function handleDisconnectCalendar() {
    if (!user) return;
    await fetch("/api/auth/google/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid }),
    });
    setCalendarConnected(false);
    setCalendarBanner("Google Calendar disconnected.");
  }

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    const today = todayISO();
    const bookingsQ = query(
      collection(db, "bookings"),
      where("date", "==", today),
      orderBy("time", "asc")
    );
    const enquiriesQ = query(collection(db, "enquiries"), orderBy("createdAt", "desc"));
    const waitlistQ = query(collection(db, "waitlist"));

    const unsub1 = onSnapshot(bookingsQ, (snap) => {
      setAppointments(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            time: data.time,
            date: data.date,
            dogName: data.dog?.name ?? "—",
            breedName: data.breedName ?? "—",
            serviceName: data.serviceName ?? "—",
            ownerName: data.owner?.name ?? "—",
            ownerPhone: data.owner?.phone ?? "",
            notes: data.dog?.notes || undefined,
            status: data.status ?? "pending",
          };
        })
      );
      setDataLoading(false);
      setDataError(null);
    }, (err) => {
      console.error("Bookings listener failed:", err);
      setDataError("Couldn't load today's appointments — check the Firestore index has finished building.");
      setDataLoading(false);
    });

    const unsub2 = onSnapshot(enquiriesQ, (snap) => {
      setEnquiries(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            dogName: data.dog?.name ?? "—",
            breedName: data.breedName ?? "—",
            ownerName: data.owner?.name ?? "—",
            ownerPhone: data.owner?.phone ?? "",
            createdAt: data.createdAt ?? null,
          };
        })
      );
    }, (err) => console.error("Enquiries listener failed:", err));

    const unsub3 = onSnapshot(waitlistQ, (snap) => {
      setWaitlist(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            dogName: data.dogName ?? "—",
            ownerName: data.ownerName ?? "—",
            ownerPhone: data.ownerPhone ?? "",
            wantsDate: data.wantsDate ?? "",
          };
        })
      );
    }, (err) => console.error("Waitlist listener failed:", err));

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user]);

  async function toggleDone(id: string, currentStatus: string) {
    await updateDoc(doc(db, "bookings", id), {
      status: currentStatus === "done" ? "pending" : "done",
    });
  }

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{today}</h1>
          <p className="text-xs text-white/50">Today&apos;s brief — everything on before the door opens.</p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-medium flex-shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {calendarBanner && (
        <div className="glass-card p-3 flex items-center justify-between gap-3 text-xs text-white/80">
          <span>{calendarBanner}</span>
          <button onClick={() => setCalendarBanner(null)} className="text-white/40 hover:text-white flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="glass-card p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {calendarConnected ? (
            <CalendarCheck2 className="w-5 h-5 text-indigo-300 flex-shrink-0" />
          ) : (
            <CalendarPlus className="w-5 h-5 text-white/40 flex-shrink-0" />
          )}
          <div>
            <div className="text-sm font-semibold text-white">Google Calendar</div>
            <div className="text-[11px] text-white/50">
              {calendarConnected === null
                ? "Checking…"
                : calendarConnected
                ? "Connected — bookings sync automatically"
                : "Not connected — bookings only appear here"}
            </div>
          </div>
        </div>
        {calendarConnected === null ? null : calendarConnected ? (
          <button
            onClick={handleDisconnectCalendar}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs font-medium flex-shrink-0"
          >
            Disconnect
          </button>
        ) : (
          <a
            href={user ? `/api/auth/google/connect?uid=${user.uid}` : "#"}
            className="px-3 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold flex-shrink-0"
          >
            Connect
          </a>
        )}
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card px-4 py-4 text-center">
          <div className="text-xl font-bold text-white">{appointments.length}</div>
          <div className="text-[11px] text-white/50 mt-1">Today</div>
        </div>
        <div className="glass-card px-4 py-4 text-center">
          <div className="text-xl font-bold text-white">{waitlist.length}</div>
          <div className="text-[11px] text-white/50 mt-1">Waitlist</div>
        </div>
        <div className="glass-card px-4 py-4 text-center">
          <div className="text-xl font-bold text-amber-300">{enquiries.length}</div>
          <div className="text-[11px] text-white/50 mt-1">Enquiries</div>
        </div>
      </div>

      {dataError && (
        <div className="glass-card p-3 text-xs text-red-300 border-red-400/30 bg-red-500/5">{dataError}</div>
      )}

      {dataLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
        </div>
      ) : (
        <>
          <section className="space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">Today&apos;s Appointments</h2>
            {appointments.length === 0 && (
              <p className="text-xs text-white/40 glass-card p-4">Nothing booked for today yet.</p>
            )}
            {appointments.map((a) => (
              <div key={a.id} className={`glass-card p-4 flex items-center gap-3 ${a.status === "done" ? "opacity-50" : ""}`}>
                <button
                  type="button"
                  onClick={() => toggleDone(a.id, a.status)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                    a.status === "done" ? "bg-indigo-500 border-indigo-400" : "bg-white/5 border-white/15"
                  }`}
                >
                  {a.status === "done" && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{a.time}</span>
                    <span className="text-sm font-semibold text-white">{a.dogName}</span>
                  </div>
                  <p className="text-[11px] text-white/50">
                    {a.breedName} · {a.serviceName} · {a.ownerName}
                  </p>
                  {a.notes && <p className="text-[11px] text-amber-300/80 mt-0.5">{a.notes}</p>}
                </div>
                {a.ownerPhone && (
                  <a href={`tel:${a.ownerPhone.replace(/\s/g, "")}`} className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex-shrink-0">
                    <PhoneCall className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </section>

          {enquiries.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-amber-300/80">Pending Enquiries</h2>
              {enquiries.map((e) => (
                <div key={e.id} className="glass-card p-4 flex items-center gap-3 border-amber-400/20">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {e.dogName} — <span className="text-white/60">{e.breedName}</span>
                    </div>
                    <p className="text-[11px] text-white/50">{e.ownerName}</p>
                  </div>
                  {e.ownerPhone && (
                    <a
                      href={`tel:${e.ownerPhone.replace(/\s/g, "")}`}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold flex-shrink-0"
                    >
                      <PhoneCall className="w-3.5 h-3.5" /> Call
                    </a>
                  )}
                </div>
              ))}
            </section>
          )}

          {waitlist.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/50">Waitlist</h2>
              {waitlist.map((w) => (
                <div key={w.id} className="glass-card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{w.dogName}</div>
                    <p className="text-[11px] text-white/50">{w.ownerName} · wants: {w.wantsDate}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-white text-xs font-semibold flex-shrink-0">
                    <Bell className="w-3.5 h-3.5" /> Notify
                  </button>
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
