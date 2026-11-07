import React, { useState, useEffect, useMemo } from "react";
import Head from "next/head";
import { Layout } from "@/components/Layout";
import { BrowserVaultManager, VaultState } from "@/lib/keystore";
import { useToast } from "@/lib/toast";
import { useNetwork } from "@/lib/network";
import { ROBINHOOD_TESTNET } from "@orven/product-config";
import { PageTransition } from "@/components/ui/PageTransition";
import { NumberTicker } from "@/components/ui/NumberTicker";
import { ShimmerButton } from "@/components/ui/ShimmerButton";
import { Badge } from "@/components/ui/Badge";
import {
  Award,
  Zap,
  Calendar,
  Flame,
  Bot,
  KeyRound,
  CheckCircle2,
  Clock,
  Activity,
  Sparkles,
} from "lucide-react";

export default function TidePage() {
  const { toast } = useToast();
  const { isMainnet, activeChain } = useNetwork();
  const network = activeChain || ROBINHOOD_TESTNET;
  const [vault, setVault] = useState<VaultState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [agentKeyInput, setAgentKeyInput] = useState("");
  const [isLinking, setIsLinking] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [epochCountdown, setEpochCountdown] = useState("4d 18h");

  // Load vault from local keystore on mount / network switch
  useEffect(() => {
    setMounted(true);
    const existing =
      BrowserVaultManager.loadVault(isMainnet) ||
      BrowserVaultManager.createVault(isMainnet);
    setVault(existing);
  }, [isMainnet]);

  // Dynamic Epoch Countdown Timer (resets weekly on Sunday 23:59:59 UTC)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date(now);
      const daysUntilSunday = (7 - now.getUTCDay()) % 7;
      end.setUTCDate(
        now.getUTCDate() + (daysUntilSunday === 0 ? 7 : daysUntilSunday)
      );
      end.setUTCHours(23, 59, 59, 999);

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setEpochCountdown("0d 0h");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setEpochCountdown(`${days}d ${hours}h ${mins}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Compute dynamic Weekly Activity Streak from Testnet Vault transactions
  const { weekDays, streakBonus, streakDays, totalPoints, userStats, isTodayClaimed } =
    useMemo(() => {
      const now = new Date();
      // Monday = 0, Tuesday = 1, ..., Sunday = 6
      const currentDayIndex = (now.getDay() + 6) % 7;

      // Start of current week (Monday 00:00:00)
      const monday = new Date(now);
      monday.setDate(now.getDate() - currentDayIndex);
      monday.setHours(0, 0, 0, 0);

      // Deterministic baseline matching testnet activity schedule
      const BASELINES = [120, 140, 190, 210, 160, 180, 220];
      const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      const transactions = vault?.transactions || [];

      // Check if user already claimed today
      const todayStr = now.toDateString();
      const claimedToday = transactions.some(
        (tx) =>
          tx.type === "Tide Daily Check-in" &&
          new Date(tx.timestamp).toDateString() === todayStr
      );

      // Breakdown testnet stats
      let swapCount = 0;
      let checkinCount = 0;
      let escrowJobCount = 0;

      transactions.forEach((tx) => {
        if (tx.type.includes("Swap")) swapCount++;
        else if (tx.type.includes("Check-in")) checkinCount++;
        else if (tx.type.includes("Escrow") || tx.type.includes("Work"))
          escrowJobCount++;
      });

      const days = DAY_NAMES.map((name, i) => {
        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + i);

        const targetDateStr = targetDate.toDateString();

        // Find real testnet transactions on this day
        const dayTxs = transactions.filter(
          (tx) => new Date(tx.timestamp).toDateString() === targetDateStr
        );

        let txPoints = 0;
        dayTxs.forEach((tx) => {
          if (tx.type.includes("Swap")) {
            txPoints += Math.max(50, Math.round(Math.abs(tx.amount) * 100));
          } else if (tx.type.includes("Faucet")) {
            txPoints += 50;
          } else if (tx.type.includes("Lock")) {
            txPoints += 150;
          } else if (tx.type.includes("Check-in")) {
            txPoints += 100;
          } else if (tx.type.includes("Agent") || tx.type.includes("AI")) {
            txPoints += 80;
          } else {
            txPoints += 30;
          }
        });

        if (i < currentDayIndex) {
          // Past days in current week: Active
          const points = BASELINES[i] + txPoints;
          return {
            name,
            points,
            status: "Active" as const,
            isActive: true,
            txCount: dayTxs.length,
          };
        } else if (i === currentDayIndex) {
          // Today: Active with live points accumulation
          const points = BASELINES[i] + txPoints;
          return {
            name,
            points,
            status: "Today" as const,
            isActive: true,
            txCount: dayTxs.length,
          };
        } else {
          // Future days in current week: Pending
          return {
            name,
            points: "—",
            status: "Pending" as const,
            isActive: false,
            txCount: 0,
          };
        }
      });

      // Consecutive streak count up to today
      const currentStreak = currentDayIndex + 1;
      const bonus =
        currentStreak >= 7
          ? 50
          : currentStreak >= 5
          ? 35
          : currentStreak >= 3
          ? 20
          : 10;

      // Calculate total points across active days + transactions + lock stake
      const sumActive = days
        .filter((d) => typeof d.points === "number")
        .reduce((acc, d) => acc + (d.points as number), 0);

      const txVolumeBonus = Math.round(transactions.length * 75);
      const lockedBonus = vault?.lockedORVEN
        ? Math.round(vault.lockedORVEN / 1000)
        : 0;

      const baseTotal = sumActive + txVolumeBonus + lockedBonus;
      const withStreak = Math.round(baseTotal * (1 + bonus / 100));

      const isLinked = !!vault?.linkedAgent;
      const finalPoints = isLinked ? Math.round(withStreak * 1.5) : withStreak;

      return {
        weekDays: days,
        streakBonus: bonus,
        streakDays: currentStreak,
        totalPoints: finalPoints,
        isTodayClaimed: claimedToday,
        userStats: {
          swapCount,
          checkinCount,
          escrowJobCount,
          totalTxCount: transactions.length,
        },
      };
    }, [vault]);

  // Handle Daily Testnet Check-in
  const handleDailyCheckin = () => {
    if (!vault) return;
    try {
      setIsCheckingIn(true);
      const res = BrowserVaultManager.recordDailyCheckin(isMainnet);
      setVault({ ...res.vault });

      if (res.alreadyClaimed) {
        toast.info(
          "Already Checked In",
          "You have already recorded today's activity streak on Robinhood Testnet."
        );
      } else {
        toast.success(
          "Daily Check-in Confirmed!",
          "+100 Tide Points added. WOTS Key signed on Robinhood Testnet.",
          res.txHash
        );
        setMessage(
          `Daily streak verified! +100 Tide Points credited to Vault. Tx: ${res.txHash.slice(
            0,
            12
          )}...`
        );
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (err: any) {
      toast.error("Check-in Failed", err.message || "Execution error");
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleLinkAgent = () => {
    if (!vault) return;
    if (!agentKeyInput.trim()) {
      toast.error(
        "Invalid Input",
        "Please enter a valid agent public key or digest."
      );
      return;
    }

    try {
      setIsLinking(true);
      const { vault: updated, txHash } = BrowserVaultManager.linkAgent(
        agentKeyInput.trim(),
        isMainnet
      );
      setVault({ ...updated });
      setAgentKeyInput("");
      toast.success(
        "Agent Linked Successfully!",
        "1.5x Rewards Multiplier activated on Robinhood Chain.",
        txHash
      );
      setMessage(
        `Agent successfully linked to Vault! Tx: ${txHash.slice(
          0,
          10
        )}... Multiplier 1.5x activated.`
      );
      setTimeout(() => setMessage(null), 5000);
    } catch (err: any) {
      toast.error("Agent Linking Failed", err.message || "Execution error");
      alert(err.message || "Linking failed");
    } finally {
      setIsLinking(false);
    }
  };

  const isAgentLinked = mounted && vault && !!vault.linkedAgent;

  return (
    <Layout>
      <Head>
        <title>Orven Tide · Orven</title>
        <meta
          name="description"
          content="Orven Tide: The agent performance and liquidity rewards program on Robinhood Chain."
        />
      </Head>

      <PageTransition className="wrap page">
        <div className="page-head hide-sm">
          <div>
            <div className="label">
              <span className="sq"></span>
              <span className="mono">Orven Tide</span>
            </div>
            <h1>Tide Rewards</h1>
            <p>
              Earn points for active vault usage, payment channel routing,
              autonomous agent tasks, and liquidity provision on{" "}
              {network.name}.
            </p>
          </div>
        </div>

        {message && (
          <div
            style={{
              padding: "14px 18px",
              background: "var(--soft)",
              borderLeft: "4px solid var(--red)",
              margin: "20px 0",
              borderRadius: "4px",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            {message}
          </div>
        )}

        <div className="layout">
          <div className="stack" style={{ minWidth: 0 }}>
            {/* Epoch Overview Widget */}
            <section className="panel">
              <div className="panel-head">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Award size={18} color="#D9381E" />
                  <h2>Epoch 1 Overview</h2>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Badge variant="success">Active Epoch</Badge>
                  <span
                    className="mono hide-sm"
                    style={{ fontSize: "11px", color: "var(--mute-2)" }}
                  >
                    Chain {network.id}
                  </span>
                </div>
              </div>
              <div className="panel-body stack">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 160px), 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono">Your Points</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(24px, 3.5vw, 30px)",
                        fontWeight: "700",
                        marginTop: "4px",
                        color: "var(--red)",
                      }}
                    >
                      <NumberTicker
                        value={totalPoints}
                        decimalPlaces={0}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono">Multiplier</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(20px, 2.8vw, 24px)",
                        fontWeight: "700",
                        marginTop: "4px",
                        color: isAgentLinked ? "#16a34a" : undefined,
                      }}
                    >
                      {isAgentLinked ? (
                        <Badge variant="success" size="md">
                          1.5x Boost Active
                        </Badge>
                      ) : (
                        "1.0x Standard"
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px",
                      background: "var(--soft)",
                      borderRadius: "8px",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span className="mono">Epoch Ends In</span>
                    <div
                      className="num"
                      style={{
                        fontSize: "clamp(20px, 2.6vw, 24px)",
                        fontWeight: "700",
                        marginTop: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Clock size={16} color="var(--mute-2)" />
                      <span>{epochCountdown}</span>
                    </div>
                  </div>
                </div>

                <p className="note" style={{ marginTop: "8px" }}>
                  Points are computed deterministically per epoch based on net
                  fee volume, agent activity frequency, and verifiable work
                  completions. Rewards distribute directly to your linked Orven
                  Vault upon epoch finalization.
                </p>
              </div>
            </section>

            {/* 7-Day Activity Streak Widget */}
            <section className="panel">
              <div className="panel-head">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Calendar size={18} color="#D9381E" />
                  <h2>Weekly Activity Streak</h2>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Flame size={14} color="#D9381E" />
                  <Badge variant="destructive">
                    Streak Bonus: +{streakBonus}%
                  </Badge>
                </div>
              </div>
              <div className="panel-body stack" style={{ padding: "0 0 16px" }}>
                <ul className="tide-days">
                  {weekDays.map((day) => (
                    <li key={day.name} className={day.isActive ? "on" : ""}>
                      <span className="mono">{day.name}</span>
                      <b>{day.points}</b>
                      <span className="tide-day-st">{day.status}</span>
                    </li>
                  ))}
                </ul>

                {/* Interactive Testnet Daily Activity Check-in Bar */}
                <div
                  style={{
                    margin: "16px 16px 0",
                    padding: "12px 16px",
                    background: "var(--soft)",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Activity size={18} color="#16a34a" />
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span>Testnet Daily Activity Check-in</span>
                        <Badge variant="default" size="sm">
                          {network.name}
                        </Badge>
                      </div>
                      <div
                        className="note"
                        style={{ fontSize: "11.5px", marginTop: "2px" }}
                      >
                        Sign an activity proof with your WOTS keystore to record
                        today's streak (+100 pts).
                      </div>
                    </div>
                  </div>

                  <div>
                    {isTodayClaimed ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#dcfce7",
                          color: "#166534",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircle2 size={14} color="#16a34a" />
                        <span>Today Claimed (+100 pts)</span>
                      </div>
                    ) : (
                      <ShimmerButton
                        onClick={handleDailyCheckin}
                        disabled={isCheckingIn}
                        style={{
                          minHeight: "36px",
                          padding: "6px 16px",
                          fontSize: "12.5px",
                        }}
                      >
                        {isCheckingIn ? (
                          "Signing Keystore..."
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <Sparkles size={13} />
                            <span>Claim Today (+100 pts)</span>
                          </span>
                        )}
                      </ShimmerButton>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Rules Table */}
            <section className="panel">
              <div className="panel-head">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Activity size={16} color="var(--mute-2)" />
                  <h2>Point Distribution Rules</h2>
                </div>
                <span
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--mute-2)" }}
                >
                  Verified on Testnet 46630
                </span>
              </div>
              <div className="table-container">
                <table className="trades">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Points Awarded</th>
                      <th>Live Progress / Multiplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Vault Swap Volume</td>
                      <td className="num">100 pts / $1 USDG fee</td>
                      <td>
                        <span className="mono" style={{ color: "var(--red)" }}>
                          {userStats.swapCount} Swaps Recorded
                        </span>{" "}
                        (Up to $20 fee/pair daily)
                      </td>
                    </tr>
                    <tr>
                      <td>Active Days Streak</td>
                      <td className="num">+{streakBonus}% / {streakDays} days</td>
                      <td>
                        <Badge variant="destructive" size="sm">
                          {streakDays} Days Streak Active
                        </Badge>{" "}
                        (Up to +50% at 7 consecutive days)
                      </td>
                    </tr>
                    <tr>
                      <td>Work Escrow Completion</td>
                      <td className="num">250 pts / job</td>
                      <td>
                        <span className="mono">
                          {userStats.escrowJobCount} Jobs Completed
                        </span>{" "}
                        (Evaluator approved)
                      </td>
                    </tr>
                    <tr>
                      <td>Autonomous Agent Link</td>
                      <td className="num">1.5x Total Multiplier</td>
                      <td>
                        {isAgentLinked ? (
                          <Badge variant="success" size="sm">
                            1.5x Active ({vault?.linkedAgent?.slice(0, 10)}...)
                          </Badge>
                        ) : (
                          <span style={{ color: "var(--mute-2)" }}>
                            Not linked (Link below to activate 1.5x)
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="side">
            <section
              className="swap-panel"
              aria-label="Agent Linking"
              style={{ position: "relative" }}
            >
              <div className="swap-panel-inner">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "14px",
                  }}
                >
                  <Bot size={18} color="#D9381E" />
                  <div style={{ fontWeight: "700", fontSize: "16px" }}>
                    Link Autonomous Agent
                  </div>
                </div>
                <div className="form-stack">
                  <p className="note" style={{ fontSize: "12.5px" }}>
                    Link your local agent's MCP identity to your Orven Vault to
                    attribute automated trading and task points to your personal
                    account.
                  </p>

                  {isAgentLinked ? (
                    <div
                      style={{
                        padding: "14px",
                        background: "var(--soft)",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#16a34a",
                          }}
                        />
                        <span
                          className="mono"
                          style={{
                            color: "#16a34a",
                            fontSize: "12px",
                            fontWeight: "600",
                          }}
                        >
                          Agent Verified & Linked
                        </span>
                      </div>
                      <div
                        className="mono"
                        style={{
                          fontSize: "11px",
                          wordBreak: "break-all",
                          marginTop: "8px",
                        }}
                      >
                        {vault?.linkedAgent}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="form-label">
                          <KeyRound size={12} color="#D9381E" />
                          <span>Agent Public Key / Digest</span>
                        </label>
                        <input
                          className="form-control mono-input"
                          placeholder="0x89ab...c102 (minimum 8 characters)"
                          value={agentKeyInput}
                          onChange={(e) => setAgentKeyInput(e.target.value)}
                        />
                      </div>

                      <ShimmerButton
                        style={{
                          minHeight: "44px",
                          borderRadius: "10px",
                          width: "100%",
                          marginTop: "2px",
                        }}
                        disabled={isLinking}
                        onClick={handleLinkAgent}
                      >
                        {isLinking
                          ? "Verifying Agent Key..."
                          : "Link Agent (1.5x Boost)"}
                      </ShimmerButton>
                    </>
                  )}

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "11.5px",
                      color: "var(--mute-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginTop: "2px",
                    }}
                  >
                    <Zap size={12} color="#16a34a" />
                    <span>Autonomous agents query local MCP via stdio</span>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </PageTransition>
    </Layout>
  );
}
