"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  Tv,
  Key,
  Copy,
  Sliders,
  Settings,
  Sparkles,
  Lock,
  Loader2,
  AlertTriangle,
  Tablet,
  Monitor,
  Scissors,
  Play,
  Heart,
  Eye,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function HostStreamDashboard() {
  const router = useRouter();
  const { data: session } = useSession();
  const t = useLanguageStore((state) => state.t);
  const { activeSubscription, deductQuota } = useSubscriptionStore();

  // STREAM METADATA STATE
  const [title, setTitle] = useState("Show Seru Malam Minggu Sayang 💋");
  const [description, setDescription] = useState(
    "Gabung obrolan seru dan dukung aku malam ini!",
  );
  const [category, setCategory] = useState("gaming");
  const [updatingMeta, setUpdatingMeta] = useState(false);

  // STREAM STATUS
  const [isStreaming, setIsStreaming] = useState(true);

  // AI CLIP GENERATOR STATES
  const [generatingClip, setGeneratingClip] = useState(false);
  const [generatedClips, setGeneratedClips] = useState<any[]>([]);

  // DUAL STREAM KEYS STATE
  const serverUrl = "rtmp://stream.nvide.live/live";
  const landscapeKey =
    "live_landscape_nvide_host_" +
    (session?.user?.id?.substring(0, 8) || "key");
  const portraitKey =
    "live_portrait_nvide_host_" + (session?.user?.id?.substring(0, 8) || "key");

  // TOY SETUP STATE
  const [toyId, setToyId] = useState("lovense-lush-3-xyz");
  const [toyStatus, setToyStatus] = useState("connected");
  const [savingToy, setSavingToy] = useState(false);

  // PRIVATE ROOM SETUP STATE
  const [privatePrice, setPrivatePrice] = useState("15000");
  const [privateRoomActive, setPrivateRoomActive] = useState(false);
  const [launchingPrivate, setLaunchingPrivate] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingMeta(true);
    setTimeout(() => {
      toast.success("Broadcast metadata updated!");
      setUpdatingMeta(false);
    }, 800);
  };

  const handleSaveToyMapping = async () => {
    setSavingToy(true);
    setTimeout(() => {
      toast.success("Lovense interactive toy mapped successfully!");
      setSavingToy(false);
    }, 800);
  };

  const handleLaunchPrivateRoom = async () => {
    setLaunchingPrivate(true);
    setTimeout(() => {
      setPrivateRoomActive(true);
      setLaunchingPrivate(false);
      toast.success("Paid Private Room launched to audience! 🔒💋");
    }, 800);
  };

  const handleStopPrivateRoom = async () => {
    setLaunchingPrivate(true);
    setTimeout(() => {
      setPrivateRoomActive(false);
      setLaunchingPrivate(false);
      toast.success("Broadcast returned back to public! 🔓");
    }, 800);
  };

  const handleEndStream = () => {
    setIsStreaming(false);
    toast.success(
      "Livestream ended successfully. Let's process the highlights!",
    );
  };

  const handleGenerateAIClips = () => {
    // 1. Quota check
    if (!activeSubscription || activeSubscription.quotaRemaining <= 0) {
      toast.error(
        t(
          "ai_clip.upgrade_prompt",
          "Your AI Clip VIP quota is empty. Please upgrade your package!",
        ),
      );
      return;
    }

    // 2. Start generation simulation
    setGeneratingClip(true);

    // Deduct quota
    deductQuota(1);

    setTimeout(() => {
      setGeneratingClip(false);
      setGeneratedClips([
        {
          id: "c1",
          title: `${title} - Epic Reaction 🌸`,
          duration: "00:45",
          views: 2400,
        },
        {
          id: "c2",
          title: `${title} - Cute Dance Highlight ✨`,
          duration: "00:30",
          views: 4200,
        },
        {
          id: "c3",
          title: `${title} - Intimate ASMR Spark 🎙️`,
          duration: "01:00",
          views: 1800,
        },
      ]);
      toast.success(
        "AI Highlights Generated successfully! Saved to your studio library.",
      );
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-primary/20 px-6 py-4 flex items-center justify-between shadow-[0_2px_12px_rgba(244,143,177,0.1)]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/host">
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-primary/20 text-primary text-xs font-black uppercase px-3 py-1 rounded-md border border-primary/30 flex items-center gap-1.5 shadow animate-pulse">
              <Tv className="h-3.5 w-3.5" />
              Creator Studio
            </span>
            <span className="text-sm font-bold text-muted-foreground hidden sm:inline">
              Broadcast Control HQ
            </span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3">
          {isStreaming ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-500 font-bold text-xs">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              LIVE STREAMING
            </div>
          ) : (
            <div className="px-3 py-1 bg-muted border border-primary/10 rounded-full text-muted-foreground font-bold text-xs">
              STREAM ENDED
            </div>
          )}
        </div>
      </header>

      {/* CONTENT GRID */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* STREAM INGESTION & CONTROLS */}
          <div className="bg-card border border-primary/15 p-6 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-black flex items-center gap-2 text-primary">
                  <Key className="h-4.5 w-4.5" />
                  Broadcasting Ingestion Panel
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter Server URL and Stream Key inside your OBS encoder tool.
                </p>
              </div>

              {isStreaming && (
                <Button
                  onClick={handleEndStream}
                  className="bg-destructive hover:bg-destructive/95 text-destructive-foreground font-bold text-xs rounded-full px-5 py-2 h-9 shadow-md"
                >
                  End Stream
                </Button>
              )}
            </div>

            {/* Ingestion keys */}
            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label className="text-muted-foreground">RTMP Stream URL</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={serverUrl}
                    className="bg-background border-primary/20 font-mono text-[11px] h-10 flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(serverUrl, "Server URL")}
                    className="border border-primary/20 bg-background hover:bg-primary/5 rounded-xl h-10 w-10 shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Monitor className="h-3.5 w-3.5 text-primary" />
                    Landscape Key (Horizontal 16:9)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      readOnly
                      value={landscapeKey}
                      className="bg-background border-primary/20 font-mono text-[11px] h-10 flex-1"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(landscapeKey, "Landscape Key")
                      }
                      className="border border-primary/20 bg-background hover:bg-primary/5 rounded-xl h-10 w-10 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-1">
                    <Tablet className="h-3.5 w-3.5 text-accent" />
                    Portrait Key (Vertical 9:16)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      readOnly
                      value={portraitKey}
                      className="bg-background border-primary/20 font-mono text-[11px] h-10 flex-1"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(portraitKey, "Portrait Key")
                      }
                      className="border border-primary/20 bg-background hover:bg-primary/5 rounded-xl h-10 w-10 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI CLIP GENERATION INTEGRATION */}
          {!isStreaming && (
            <div className="bg-card border border-primary/20 p-6 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 text-[10px] bg-primary/10 text-primary font-black rounded-bl-2xl flex items-center gap-1">
                <Crown className="h-3 w-3 text-accent" /> VIP MODULE
              </div>

              <div className="space-y-2">
                <h3 className="font-heading font-black text-lg text-primary flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-primary anime-sparkle" />
                  Generate AI Stream Clips & Highlights
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                  Stream has ended. Let our AI analyze the broadcast, clip the
                  best gaming triggers, cosplay highlights, and ASMR response
                  sparks automatically.
                </p>

                {activeSubscription ? (
                  <p className="text-[11px] font-bold text-accent">
                    Remaining Quota: {activeSubscription.quotaRemaining} /{" "}
                    {activeSubscription.quotaTotal} clips available.
                  </p>
                ) : (
                  <p className="text-[11px] font-bold text-rose-500">
                    No Active AI VIP subscription plan. Free limit reached.
                  </p>
                )}
              </div>

              {generatedClips.length === 0 && !generatingClip && (
                <div className="pt-2">
                  <Button
                    onClick={handleGenerateAIClips}
                    disabled={
                      !activeSubscription ||
                      activeSubscription.quotaRemaining <= 0
                    }
                    className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs rounded-2xl px-6 py-2.5 h-10 shadow-md animate-pulse-hover"
                  >
                    Generate AI Clip
                  </Button>
                </div>
              )}

              {(!activeSubscription ||
                activeSubscription.quotaRemaining <= 0) &&
                generatedClips.length === 0 &&
                !generatingClip && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] rounded-3xl flex items-center justify-center z-20 p-6">
                    <div className="max-w-sm text-center space-y-3">
                      <p className="text-sm font-black text-rose-400">
                        Kuota habis, upgrade ke VIP lebih tinggi
                      </p>
                      <Button
                        onClick={() => router.push("/clip-subscription")}
                        className="h-9 text-xs font-bold"
                      >
                        Upgrade VIP
                      </Button>
                    </div>
                  </div>
                )}
              {generatingClip && (
                <div className="py-6 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-xs text-primary font-black anime-pulse-hover">
                    {t(
                      "ai_clip.generating",
                      "AI engine is cutting your stream highlights...",
                    )}
                  </p>
                </div>
              )}

              {/* Generated Clips Grid */}
              {generatedClips.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-primary/10">
                  <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                    Short Video Highlight Clips Grid
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {generatedClips.map((clip) => (
                      <div
                        key={clip.id}
                        className="p-4 bg-background border border-primary/10 rounded-2xl hover:border-primary/30 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="h-20 bg-muted rounded-xl flex items-center justify-center relative overflow-hidden group">
                            <Play className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                            <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono font-bold">
                              {clip.duration}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-foreground mt-2 line-clamp-1">
                            {clip.title}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-bold pt-2 border-t border-primary/5">
                          <span className="flex items-center gap-0.5">
                            <Eye className="h-3 w-3" /> {clip.views} views
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2"
                              onClick={() =>
                                toast.success("Tautan klip disalin.")
                              }
                            >
                              Share
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-[10px] px-2"
                              onClick={() =>
                                toast.success("Unduhan klip dimulai.")
                              }
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* METADATA FORM */}
          <div className="bg-card border border-primary/15 p-6 rounded-3xl space-y-6 shadow-sm">
            <h3 className="text-sm font-black flex items-center gap-1.5 text-primary">
              <Sparkles className="h-4 w-4 text-primary" />
              Stream Studio Metadata
            </h3>

            <form
              onSubmit={handleUpdateMetadata}
              className="space-y-4 text-xs font-semibold"
            >
              <div className="space-y-2">
                <Label>Broadcast Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-primary/20 focus:border-primary rounded-xl h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-primary/20 p-3 rounded-xl focus:border-primary font-medium text-foreground resize-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Content Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 bg-background border border-primary/20 text-foreground p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="gaming">Gaming</option>
                  <option value="talkshow">ASMR Talk</option>
                  <option value="music">Music Covers</option>
                  <option value="cosplay">Cosplay show</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={updatingMeta}
                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold py-2 h-10 text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                {updatingMeta ? (
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                ) : null}
                Update Stream Metadata
              </Button>
            </form>
          </div>

          {/* PRIVATE ROOM CONTROL */}
          <div className="bg-card border border-primary/15 p-6 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-primary">
                <Lock className="h-4.5 w-4.5 text-accent" />
                Paid Private 1-on-1 Room
              </h3>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  privateRoomActive
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {privateRoomActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label>Entry Flat Rate (per min/koin)</Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={privatePrice}
                    onChange={(e) => setPrivatePrice(e.target.value)}
                    className="bg-background border-primary/20 pl-10 focus:border-primary font-bold rounded-xl h-10"
                  />
                </div>
              </div>

              {privateRoomActive ? (
                <Button
                  onClick={handleStopPrivateRoom}
                  disabled={launchingPrivate}
                  className="w-full bg-background border border-primary/20 hover:bg-primary/5 text-destructive rounded-xl font-bold py-2 h-10 text-xs transition flex items-center justify-center gap-1.5"
                >
                  {launchingPrivate ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : null}
                  End Private Room (Back to Public)
                </Button>
              ) : (
                <Button
                  onClick={handleLaunchPrivateRoom}
                  disabled={launchingPrivate || !isStreaming}
                  className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold py-2 h-10 text-xs transition flex items-center justify-center gap-1.5 shadow"
                >
                  {launchingPrivate ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : null}
                  Launch Paid Private Room
                </Button>
              )}
            </div>
          </div>

          {/* INTERACTIVE TOY WIDGET */}
          <div className="bg-card border border-primary/15 p-6 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-primary">
                <Sliders className="h-4.5 w-4.5 text-primary animate-spin" />
                Lovense Interactive Toy
              </h3>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                  toyStatus === "connected"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {toyStatus}
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <Label>Lovense Device Link ID</Label>
                <Input
                  value={toyId}
                  onChange={(e) => setToyId(e.target.value)}
                  placeholder="lush-3-device-id"
                  className="bg-background border-primary/20 h-10 font-mono"
                />
              </div>

              <Button
                onClick={handleSaveToyMapping}
                disabled={savingToy}
                className="w-full bg-background border border-primary/20 hover:bg-primary/5 text-primary rounded-xl font-bold py-2 h-10 text-xs transition flex items-center justify-center gap-1.5"
              >
                {savingToy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : null}
                Connect Device ID
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
