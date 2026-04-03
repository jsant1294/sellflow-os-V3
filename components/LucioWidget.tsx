"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  GeneratedListing,
  LucioGoal,
  LucioListingState,
  LucioMode,
  LucioPlatform,
  LucioRequestPayload,
  LucioResponsePayload,
} from "@/lib/types";

type LucioVisualState = "idle" | "listening" | "thinking" | "responding";
type LucioQuickAction = {
  label: string;
  detail: string;
  mode?: LucioMode;
  goal?: LucioGoal;
  platform?: LucioPlatform;
  input?: string;
  triggerVoice?: boolean;
};

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResult>;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

function buildReply(item?: GeneratedListing, incoming?: string) {
  const target = item?.targetPrice ?? 0;
  const floor = item?.floorPrice ?? 0;
  const cleanIncoming = (incoming || "").trim().toLowerCase();

  if (!item) {
    return "Paste the buyer message here and I’ll help you answer with a calm, quick-close reply.";
  }

  if (!cleanIncoming) {
    return item.replies.first;
  }

  const match = cleanIncoming.match(/\$?(\d{2,5})/);
  const offer = match ? Number(match[1]) : null;

  if (offer !== null) {
    if (offer >= target) return `That works for me. If you can pick up today, it’s yours. Want the pickup details?`;
    if (offer >= floor) return `I can meet you in the middle at $${target}. If you can pick up today, I can hold it for you.`;
    return `I can’t do $${offer}, but I can let it go for $${floor} today if you can pick up now.`;
  }

  if (cleanIncoming.includes("still available") || cleanIncoming.includes("available")) {
    return item.replies.first;
  }

  if (cleanIncoming.includes("hold")) {
    return item.replies.hold;
  }

  return item.replies.negotiate;
}

function buildImprovedListing(item?: GeneratedListing, draft?: string) {
  if (draft && draft.trim()) {
    return `🚨 ${item?.itemName || "Item"} – PRICED TO MOVE 🚨\n\n${draft.trim()}\n\n✅ Pickup available today\n💬 Message me if interested\n⏱ First serious buyer takes it`;
  }
  if (!item) return "Paste your rough listing here and I’ll tighten it into a faster-selling version.";
  return item.facebook;
}

function buildFasterTips(item?: GeneratedListing) {
  if (!item) {
    return [
      "Use the same 6-8 clear photos on all three platforms.",
      "Post Facebook first, then OfferUp, then Nextdoor.",
      "Answer every message in under 5 minutes when possible.",
    ].join("\n");
  }

  return [
    `Lead with this title: ${item.titles[0]}`,
    `List at $${item.listPrice}, expect to close near $${item.targetPrice}, and do not go below $${item.floorPrice} unless same-day pickup matters more than margin.`,
    item.checklist[0],
    item.relistPlan[0],
  ].join("\n");
}

function platformText(item: GeneratedListing | undefined, platform: LucioPlatform) {
  if (!item) return "";

  switch (platform) {
    case "facebook":
      return item.facebook;
    case "offerup":
      return item.offerup;
    case "nextdoor":
      return item.nextdoor;
    default:
      return item.facebook;
  }
}

function buildFallbackResponse(
  mode: LucioMode,
  item: GeneratedListing | undefined,
  input: string,
  platform: LucioPlatform
): LucioResponsePayload {
  if (mode === "price") {
    if (!item) {
      return {
        headline: "Open an item to get a price lane from Lucio.",
        cards: [
          {
            title: "What Lucio Needs",
            body: "Open a saved item so Lucio can use the current category, condition, and pricing data.",
            copyText: "Open a saved item so Lucio can use the current category, condition, and pricing data.",
          },
        ],
      };
    }

    return {
      headline: "Lucio mapped a realistic pricing lane for this item.",
      cards: [
        {
          title: "Fast Move",
          body: `Use $${item.floorPrice} if same-day pickup matters most.`,
          copyText: `Fast move price: $${item.floorPrice}`,
        },
        {
          title: "Best Target",
          body: `Aim to close around $${item.targetPrice} for a balanced sale.`,
          copyText: `Best target price: $${item.targetPrice}`,
        },
        {
          title: "Anchor Listing",
          body: `List near $${item.listPrice} to leave room for negotiation without killing interest.`,
          copyText: `Anchor listing price: $${item.listPrice}`,
        },
        {
          title: "Hard Floor",
          body: `Avoid dropping below $${item.lowestAcceptable} unless speed matters more than margin.`,
          copyText: `Lowest acceptable price: $${item.lowestAcceptable}`,
        },
      ],
    };
  }

  if (mode === "improve") {
    const improved = buildImprovedListing(item, input || platformText(item, platform));
    return {
      headline: "Lucio tightened the listing for faster local response.",
      cards: [
        {
          title: "Improved Listing",
          body: improved,
          copyText: improved,
        },
        {
          title: "Angle",
          body: "Lead with urgency, one strong benefit, and pickup readiness. Cut filler.",
          copyText: "Lead with urgency, one strong benefit, and pickup readiness. Cut filler.",
        },
      ],
    };
  }

  if (mode === "reply") {
    const bestReply = buildReply(item, input);
    const floor = item?.floorPrice ?? 0;
    const target = item?.targetPrice ?? 0;

    return {
      headline: "Lucio drafted buyer replies using the current pricing lane.",
      cards: [
        {
          title: "Best Reply",
          body: bestReply,
          copyText: bestReply,
        },
        {
          title: "Firm Reply",
          body: floor ? `I can't go lower than $${floor} today, but if you can pick up now it's yours.` : bestReply,
          copyText: floor ? `I can't go lower than $${floor} today, but if you can pick up now it's yours.` : bestReply,
        },
        {
          title: "Flexible Close",
          body: target ? `I can do $${target} if you can meet today. Want pickup details?` : bestReply,
          copyText: target ? `I can do $${target} if you can meet today. Want pickup details?` : bestReply,
        },
      ],
    };
  }

  const fasterTips = buildFasterTips(item).split("\n");

  return {
    headline: "Lucio picked the fastest next actions for this listing.",
    cards: fasterTips.map((tip, index) => ({
      title: index === 0 ? "Priority Move" : `Next Move ${index + 1}`,
      body: tip,
      copyText: tip,
    })),
  };
}

export function LucioWidget({ item }: { item?: GeneratedListing }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<LucioMode>("price");
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<LucioPlatform>("facebook");
  const [goal, setGoal] = useState<LucioGoal>("fast_cash");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState<LucioResponsePayload | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const fallback = useMemo(
    () => buildFallbackResponse(mode, item, input, platform),
    [mode, item, input, platform]
  );

  const listingState = useMemo<LucioListingState | null>(() => {
    if (!item) {
      return null;
    }

    const createdAt = new Date(item.createdAt).getTime();
    const ageMs = Number.isFinite(createdAt) ? Date.now() - createdAt : 0;
    const ageHours = Math.max(0, Math.round(ageMs / (1000 * 60 * 60)));
    const isStale = item.status === "posted" && ageHours >= 24;

    let summary = "Fresh listing context available.";

    if (item.status === "draft") {
      summary = "Still in draft. Lucio can push this toward a same-day post.";
    } else if (isStale) {
      summary = `Posted ${ageHours}h ago. This listing is stale enough to justify a title or price move.`;
    } else if (item.status === "posted") {
      summary = `Posted ${Math.max(ageHours, 1)}h ago. Lucio can help improve response quality before repricing.`;
    } else if (item.status === "sold") {
      summary = "Sold item. Lucio can mine this result for better future pricing and copy.";
    }

    return { status: item.status, ageHours, isStale, summary };
  }, [item]);

  const visualState = useMemo<LucioVisualState>(() => {
    if (isLoading) {
      return "thinking";
    }

    if (isRecording || isVoiceActive || (open && (mode === "reply" || mode === "improve") && !response)) {
      return "listening";
    }

    if (response || error) {
      return "responding";
    }

    return "idle";
  }, [error, isLoading, isRecording, isVoiceActive, mode, open, response]);

  const status = useMemo(() => {
    switch (visualState) {
      case "listening":
        return {
          label: isRecording
            ? "Listening to your voice"
            : isVoiceActive
              ? "Voice pulse active"
            : mode === "reply"
              ? "Listening for buyer context"
              : "Listening for listing context",
          dotClass: "lucio-dot-listening",
          glow: "rgba(48, 214, 255, 0.56)",
        };
      case "thinking":
        return {
          label: "Thinking through the best move",
          dotClass: "lucio-dot-thinking",
          glow: "rgba(151, 119, 255, 0.58)",
        };
      case "responding":
        return {
          label: "Ready with a practical answer",
          dotClass: "lucio-dot-responding",
          glow: "rgba(68, 226, 170, 0.5)",
        };
      default:
        return {
          label: "Ask Lucio",
          dotClass: "lucio-dot-idle",
          glow: "rgba(76, 159, 255, 0.52)",
        };
    }
  }, [isRecording, isVoiceActive, mode, visualState]);

  const contextualActions = useMemo<LucioQuickAction[]>(() => {
    const platformDraft = platformText(item, platform);
    const lowOffer = item?.floorPrice ? Math.max(5, item.floorPrice - 20) : 80;
    const allUnitsAsk = item?.quantity && item.quantity > 1
      ? `Would you do a better deal if I take all ${item.quantity} today?`
      : undefined;

    const stateDrivenActions: LucioQuickAction[] = [];

    if (item?.status === "draft") {
      stateDrivenActions.push({
        label: "Draft to live post",
        detail: "Bias Lucio toward getting this draft posted today.",
        mode: "faster",
        goal: "fast_cash",
        platform: "facebook",
      });
    }

    if (listingState?.isStale && item) {
      stateDrivenActions.push(
        {
          label: "Stale listing reset",
          detail: `Posted ${listingState.ageHours}h ago. Push Lucio toward a fresh move now.`,
          mode: "faster",
          goal: "fast_cash",
        },
        {
          label: "Lower to target",
          detail: `Refocus on a faster close near $${item.targetPrice}.`,
          mode: "price",
          goal: "fast_cash",
        }
      );
    }

    if (item?.status === "sold") {
      stateDrivenActions.push({
        label: "Reuse sold proof",
        detail: "Ask Lucio to turn this win into better future pricing instincts.",
        mode: "faster",
        goal: "max_profit",
      });
    }

    switch (mode) {
      case "price":
        return [
          ...stateDrivenActions,
          {
            label: "Fast-cash lane",
            detail: "Bias Lucio toward speed and same-day pickup.",
            goal: "fast_cash",
          },
          {
            label: "Max-profit lane",
            detail: "Bias Lucio toward stronger margin and patience.",
            goal: "max_profit",
          },
          {
            label: "Facebook price angle",
            detail: "Tune the advice for Facebook Marketplace first.",
            platform: "facebook",
          },
          {
            label: "OfferUp price angle",
            detail: "Tune the advice for OfferUp buyers.",
            platform: "offerup",
          },
        ];
      case "improve":
        return [
          ...stateDrivenActions,
          {
            label: "Use current draft",
            detail: "Load the current platform listing into the editor.",
            input: platformDraft,
          },
          {
            label: "Make it tighter",
            detail: "Push for a shorter mobile-friendly listing.",
            input: `Rewrite this tighter for mobile buyers and keep the strongest selling point first:\n\n${platformDraft || input}`.trim(),
          },
          {
            label: "Push same-day pickup",
            detail: "Emphasize urgency and fast local close.",
            input: `Rewrite this listing and stress same-day pickup plus quick response:\n\n${platformDraft || input}`.trim(),
          },
          {
            label: "Voice refine",
            detail: "Simulate voice-active listing refinement.",
            triggerVoice: true,
            input: platformDraft || input,
          },
        ];
      case "reply":
        return [
          ...stateDrivenActions,
          {
            label: "Still available?",
            detail: "Prime a standard availability reply.",
            input: "Is this still available?",
          },
          {
            label: "Low offer today",
            detail: "Prime a realistic negotiation scenario.",
            input: `Will you take $${lowOffer} today?`,
          },
          {
            label: "Pickup tonight",
            detail: "Prime a fast-close timing question.",
            input: "Can you meet tonight if I head over now?",
          },
          {
            label: allUnitsAsk ? "Take all units" : "Voice buyer mode",
            detail: allUnitsAsk ? "Prime a bundle-close message for all available units." : "Simulate a live buyer-message intake state.",
            input: allUnitsAsk || "I can come today if the price works.",
            triggerVoice: true,
          },
        ];
      case "faster":
      default:
        return [
          ...stateDrivenActions,
          {
            label: "Move to fast cash",
            detail: "Switch Lucio to speed-first recommendations.",
            goal: "fast_cash",
          },
          {
            label: "Hold for margin",
            detail: "Switch Lucio to better-margin recommendations.",
            goal: "max_profit",
          },
          {
            label: "Push Facebook first",
            detail: "Recenter recommendations around Facebook Marketplace.",
            platform: "facebook",
          },
          {
            label: "Try Nextdoor angle",
            detail: "Recenter recommendations around neighbor-style messaging.",
            platform: "nextdoor",
          },
        ];
    }
  }, [input, item, listingState, mode, platform]);

  useEffect(() => {
    const speechApi = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };

    const SpeechRecognition = speechApi.SpeechRecognition || speechApi.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    setSpeechSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }

      const cleanTranscript = transcript.trim();
      if (!cleanTranscript) {
        return;
      }

      setInput(cleanTranscript);
      setError("");
    };

    recognition.onerror = (event) => {
      setIsRecording(false);
      setIsVoiceActive(false);

      if (event.error && event.error !== "no-speech") {
        setError(`Voice input error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsVoiceActive(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []);

  const requestPayload = useMemo<LucioRequestPayload>(() => ({
    mode,
    platform,
    goal,
    buyerMessage: mode === "reply" ? input.trim() : undefined,
    draftText: mode === "improve" ? input.trim() : undefined,
    generatedText: platformText(item, platform),
    item: item
      ? {
          name: item.itemName,
          category: item.category,
          condition: item.condition,
          notes: item.notes,
          urgency: item.urgency,
        }
      : undefined,
    listingState: listingState ?? undefined,
    pricing: item
      ? {
          list: item.listPrice,
          target: item.targetPrice,
          floor: item.floorPrice,
          lowestAcceptable: item.lowestAcceptable,
        }
      : undefined,
  }), [goal, input, item, listingState, mode, platform]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      setResponse(null);

      try {
        const apiResponse = await fetch("/api/lucio", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });

        const payload = await apiResponse.json();

        if (!apiResponse.ok) {
          throw new Error(typeof payload.error === "string" ? payload.error : "Lucio could not generate advice.");
        }

        setResponse(payload as LucioResponsePayload);
      } catch (fetchError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(fetchError instanceof Error ? fetchError.message : "Lucio could not generate advice.");
        setResponse(fallback);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [fallback, open, requestPayload]);

  useEffect(() => {
    if (!isVoiceActive || isRecording) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsVoiceActive(false);
    }, 3200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isRecording, isVoiceActive]);

  const activeResponse = response ?? fallback;

  async function copyCard(index: number, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    window.setTimeout(() => setCopiedIndex(null), 1400);
  }

  function triggerVoicePulse(nextMode: LucioMode = mode) {
    setMode(nextMode);
    setIsVoiceActive(true);

    if (nextMode === "reply" && !input.trim()) {
      setInput("Is this still available?");
    }

    if (nextMode === "improve" && !input.trim()) {
      setInput(platformText(item, platform));
    }
  }

  function toggleVoiceInput() {
    if (!speechSupported || !recognitionRef.current) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setIsVoiceActive(false);
      return;
    }

    const nextMode = mode === "price" || mode === "faster" ? "reply" : mode;
    setMode(nextMode);
    setIsRecording(true);
    setIsVoiceActive(true);
    setError("");

    try {
      recognitionRef.current.start();
    } catch {
      setIsRecording(false);
      setIsVoiceActive(false);
      setError("Voice input could not start. Try again.");
    }
  }

  function applyQuickAction(action: LucioQuickAction) {
    if (action.mode) {
      setMode(action.mode);
    }

    if (action.goal) {
      setGoal(action.goal);
    }

    if (action.platform) {
      setPlatform(action.platform);
    }

    if (typeof action.input === "string") {
      setInput(action.input);
    }

    if (action.triggerVoice) {
      triggerVoicePulse(action.mode || mode);
    }
  }

  return (
    <>
      <div className="lucio-dock">
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              className="lucio-whisper"
            >
              {status.label}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-label="Open Lucio"
          className={`lucio-orb lucio-orb-${visualState}`}
          onClick={() => setOpen((current) => !current)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.span
            className="lucio-orb-halo"
            animate={{
              boxShadow: [
                `0 0 26px ${status.glow}, 0 0 60px rgba(76, 159, 255, 0.18)`,
                `0 0 40px ${status.glow}, 0 0 92px rgba(126, 92, 255, 0.28)`,
                `0 0 26px ${status.glow}, 0 0 60px rgba(76, 159, 255, 0.18)`,
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.span
            className="lucio-orb-pulse"
            animate={
              visualState === "listening"
                ? { scale: [1, 1.14, 1.28], opacity: [0.34, 0.18, 0] }
                : { scale: [1, 1.08, 1.2], opacity: [0.26, 0.12, 0] }
            }
            transition={{ duration: 2.3, repeat: Infinity, ease: "easeOut" }}
          />

          <motion.span
            className="lucio-orb-think-ring"
            animate={visualState === "thinking" ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 10, repeat: visualState === "thinking" ? Infinity : 0, ease: "linear" }}
          >
            <span className="lucio-orb-think-node" />
          </motion.span>

          <span className="lucio-orb-shell" />
          <span className="lucio-orb-glass" />

          <motion.span
            className="lucio-orb-shine"
            animate={{ opacity: [0.84, 1, 0.84] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="lucio-orb-core">
            <Image
              src="/lucio-assistant.png"
              alt="Lucio assistant"
              width={72}
              height={72}
              className="lucio-orb-image"
              priority
            />
          </span>

          <span className="lucio-orb-wordmark">
            <span className="lucio-orb-title">LUCIO</span>
            <span className="lucio-orb-state-row">
              <span className={`lucio-state-dot ${status.dotClass}`} />
              <span className="lucio-orb-state">{visualState}</span>
            </span>
          </span>

          {(visualState === "listening" || isVoiceActive) && (
            <span className="lucio-voice-bars">
              {[0, 1, 2, 3].map((bar) => (
                <motion.span
                  key={bar}
                  className="lucio-voice-bar"
                  animate={{ scaleY: [0.45, 1, 0.55, 0.9, 0.45] }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: bar * 0.08 }}
                />
              ))}
            </span>
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22 }}
            className="lucio-panel premium"
          >
            <div className="lucio-panel-head premium">
              <div className="lucio-hero-lockup">
                <div className="lucio-hero-avatar">
                  <Image
                    src="/lucio-assistant.png"
                    alt="Lucio assistant"
                    width={52}
                    height={52}
                    className="lucio-hero-image"
                  />
                </div>

                <div className="stack" style={{ gap: 6 }}>
                  <div className="badge">Lucio resale copilot</div>
                  <strong>{item ? `Helping with ${item.itemName}` : "Your branded AI selling presence"}</strong>
                  <div className="lucio-status-row">
                    <span className={`lucio-state-dot ${status.dotClass}`} />
                    <span className="small muted">{status.label}</span>
                  </div>
                  {listingState && <div className="small muted">{listingState.summary}</div>}
                </div>
              </div>

              <button type="button" className="btn-ghost lucio-close" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="lucio-panel-body">
              <div className="lucio-hero-card">
                <div className="lucio-hero-copy">
                  <strong>Price smarter, write better, and close faster.</strong>
                  <div className="muted small">Lucio is live with item context, pricing context, and buyer-reply support built for local selling.</div>
                </div>

                <div className="lucio-hero-tools">
                  <div className="lucio-hero-tool-row">
                    <button type="button" className="btn-secondary lucio-voice-trigger" onClick={toggleVoiceInput}>
                      {isRecording ? "Stop voice input" : speechSupported ? "Start voice input" : "Voice not supported"}
                    </button>

                    <button type="button" className="btn-ghost lucio-voice-trigger" onClick={() => triggerVoicePulse(mode === "price" ? "reply" : mode)}>
                      {isVoiceActive && !isRecording ? "Voice pulse live" : "Simulate voice state"}
                    </button>
                  </div>

                  <div className="lucio-live-strip">
                    <span className={`lucio-state-dot ${status.dotClass}`} />
                    <span className="small muted">
                      {isRecording
                        ? "Browser speech recognition is listening now"
                        : isVoiceActive
                          ? "Voice ring active"
                          : "Live AI state synced to Lucio activity"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lucio-action-grid">
                <button type="button" className={`lucio-action-tile ${mode === "price" ? "active" : ""}`} onClick={() => setMode("price")}>Price this item</button>
                <button type="button" className={`lucio-action-tile ${mode === "improve" ? "active" : ""}`} onClick={() => setMode("improve")}>Improve listing</button>
                <button type="button" className={`lucio-action-tile ${mode === "reply" ? "active" : ""}`} onClick={() => setMode("reply")}>Reply to buyer</button>
                <button type="button" className={`lucio-action-tile ${mode === "faster" ? "active" : ""}`} onClick={() => setMode("faster")}>Sell faster</button>
              </div>

              <div className="lucio-controls">
                <div className="field">
                  <label htmlFor="lucio-platform">Platform</label>
                  <select id="lucio-platform" value={platform} onChange={(event) => setPlatform(event.target.value as LucioPlatform)}>
                    <option value="facebook">Facebook</option>
                    <option value="offerup">OfferUp</option>
                    <option value="nextdoor">Nextdoor</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="lucio-goal">Goal</label>
                  <select id="lucio-goal" value={goal} onChange={(event) => setGoal(event.target.value as LucioGoal)}>
                    <option value="fast_cash">Fast cash</option>
                    <option value="max_profit">Max profit</option>
                  </select>
                </div>
              </div>

              <div className="stack" style={{ gap: 8 }}>
                <div className="lucio-section-label">Quick actions</div>
                <div className="lucio-quick-actions">
                  {contextualActions.map((action) => (
                    <button type="button" key={action.label} className="lucio-quick-action" onClick={() => applyQuickAction(action)}>
                      <strong>{action.label}</strong>
                      <span>{action.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              {(mode === "improve" || mode === "reply") && (
                <div className="field">
                  <label htmlFor="lucio-input">{mode === "reply" ? "Paste the buyer message" : "Paste your rough listing"}</label>
                  <textarea
                    id="lucio-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={mode === "reply" ? "Will you take $80? Is it still available?" : "Used once, works great, pickup today..."}
                  />
                </div>
              )}

              {error && <div className="lucio-note small">{error} Showing local fallback guidance.</div>}
              {isLoading && (
                <div className="lucio-note small lucio-thinking-note">
                  <span>Lucio is analyzing the current item context</span>
                  <span className="lucio-typing-dots" aria-hidden="true">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0 }} />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0.15 }} />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }} />
                  </span>
                </div>
              )}

              <div className="stack" style={{ gap: 10 }}>
                <div className="lucio-headline">{activeResponse.headline}</div>

                {activeResponse.cards.map((card, index) => (
                  <div className="lucio-output" key={`${card.title}-${index}`}>
                    <div className="lucio-card-head">
                      <strong>{card.title}</strong>
                      <button type="button" className="btn-secondary" onClick={() => copyCard(index, card.copyText)}>
                        {copiedIndex === index ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <pre>{card.body}</pre>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
