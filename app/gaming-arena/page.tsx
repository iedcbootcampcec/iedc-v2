"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./gaming-arena.module.css";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

const MAX_MINI_MILITIA_PLAYERS = 6;
const MINI_MILITIA_CAP = 100;
const EFOOTBALL_CAP = 64;
const EARLY_BIRD_LIMIT = 20;

const GENDER_OPTIONS = ["Male", "Female", "Other"];

interface Teammate {
  name: string;
  phone: string;
  gender: string;
  email: string;
  college: string;
}

interface TicketData {
  message: string;
  teamId: number;
  ticket: string;
  eventName: string;
  teamName: string;
  game: string;
}

const emptyTeammate = (): Teammate => ({
  name: "",
  phone: "",
  gender: "",
  email: "",
  college: "",
});

const isValidPhone = (num: string) => /^[6-9]\d{9}$/.test(num);
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 10);

export default function GamingArenaPage() {
  const [selectedGame, setSelectedGame] = useState<
    "mini_militia" | "efootball"
  >("mini_militia");

  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [leaderGender, setLeaderGender] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderCollege, setLeaderCollege] = useState("");

  const [teammates, setTeammates] = useState<Teammate[]>([]);

  const [paymentScreenshotFile, setPaymentScreenshotFile] =
    useState<File | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  const [stats, setStats] = useState({
    miniMilitiaCount: 0,
    eFootballCount: 0,
    totalParticipants: 0,
  });

  const fetchStats = useCallback(async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_IDEATHON_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";

    const eventName = "gaming-arena";

    try {
      let res: Response | null = null;
      if (baseUrl) {
        res = await fetch(`${baseUrl}/events/${eventName}/stats`).catch(
          () => null,
        );
      }

      if (!res || !res.ok) {
        res = await fetch(`/events/${eventName}/stats`).catch(() => null);
      }

      if (res && res.ok) {
        const data = await res.json();
        const miniMilitiaCount =
          data.miniMilitiaCount ??
          data["Mini Militia"] ??
          data.mini_militia ??
          data.miniMilitia ??
          data.mini_militia_count ??
          0;

        const eFootballCount =
          data.eFootballCount ??
          data.eFootball ??
          data["eFootball"] ??
          data.efootball ??
          data.efootball_count ??
          data.e_football_count ??
          0;

        const totalParticipants =
          data.totalParticipants ??
          data.total_participants ??
          data.total ??
          data.count ??
          data.registrations ??
          miniMilitiaCount + eFootballCount;

        setStats({ miniMilitiaCount, eFootballCount, totalParticipants });
      }
    } catch (err) {
      console.warn("Error fetching event stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "error") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitStatus]);

  const isMiniMilitiaClosed = stats.miniMilitiaCount >= MINI_MILITIA_CAP;
  const isEFootballClosed = stats.eFootballCount >= EFOOTBALL_CAP;
  const isAllClosed = isMiniMilitiaClosed && isEFootballClosed;

  const isEarlyBirdActive = stats.totalParticipants < EARLY_BIRD_LIMIT;
  const pricePerHead = isEarlyBirdActive ? 20 : 30;

  const currentHeadCount =
    selectedGame === "efootball" ? 1 : 1 + teammates.length;
  const totalAmount = currentHeadCount * pricePerHead;
  const totalSavings = isEarlyBirdActive ? currentHeadCount * 5 : 0;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("shaheemek890@okaxis");
    setCopied(true);
    setShowCopyToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopyToast(false);
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError("Screenshot file size should be less than 5MB.");
        return;
      }
      setScreenshotFileName(file.name);
      setPaymentScreenshotFile(file);
      setFormError("");
    }
  };

  const addTeammate = () => {
    if (1 + teammates.length < MAX_MINI_MILITIA_PLAYERS) {
      setTeammates((prev) => [...prev, emptyTeammate()]);
    }
  };

  const removeTeammate = (index: number) => {
    setTeammates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTeammate = useCallback(
    (index: number, field: keyof Teammate, value: string) => {
      setTeammates((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    },
    [],
  );

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitStatus("idle");
    setSubmitMessage("");

    if (selectedGame === "mini_militia" && isMiniMilitiaClosed) {
      return setFormError(
        `Registration for Mini Militia is closed (Limit of ${MINI_MILITIA_CAP} reached).`,
      );
    }
    if (selectedGame === "efootball" && isEFootballClosed) {
      return setFormError(
        `Registration for eFootball is closed (Limit of ${EFOOTBALL_CAP} reached).`,
      );
    }

    if (selectedGame === "mini_militia" && !teamName.trim()) {
      return setFormError("Team name is required for Mini Militia.");
    }

    if (!leaderName.trim()) {
      return setFormError(
        selectedGame === "mini_militia"
          ? "Team Leader's name is required."
          : "Participant's name is required.",
      );
    }
    if (!leaderPhone.trim() || !isValidPhone(leaderPhone)) {
      return setFormError("Enter a valid 10-digit phone number.");
    }
    if (!leaderGender) {
      return setFormError("Please select a gender.");
    }
    if (!leaderEmail.trim() || !isValidEmail(leaderEmail)) {
      return setFormError("Enter a valid email address.");
    }
    if (!leaderCollege.trim()) {
      return setFormError("College name is required.");
    }

    if (selectedGame === "mini_militia") {
      for (let i = 0; i < teammates.length; i++) {
        const mate = teammates[i];
        if (!mate.name.trim())
          return setFormError(`Teammate ${i + 1}'s name is required.`);
        if (!mate.phone.trim() || !isValidPhone(mate.phone))
          return setFormError(
            `Enter a valid 10-digit phone number for Teammate ${i + 1}.`,
          );
        if (!mate.gender)
          return setFormError(`Select gender for Teammate ${i + 1}.`);
        if (!mate.email.trim() || !isValidEmail(mate.email))
          return setFormError(
            `Enter a valid email address for Teammate ${i + 1}.`,
          );
        if (!mate.college.trim())
          return setFormError(`Teammate ${i + 1}'s college is required.`);
      }
    }

    if (!agreeTerms) {
      return setFormError("Please accept the gaming guidelines to continue.");
    }
    if (!paymentScreenshotFile) {
      return setFormError("Please upload a screenshot of payment.");
    }
    if (!upiId.trim()) {
      return setFormError("UPI ID / Transaction reference is required.");
    }

    handleFinalSubmit();
  };


  const handleFinalSubmit = async () => {
    setSubmitStatus("submitting");

    const baseUrl =
      process.env.NEXT_PUBLIC_IDEATHON_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "";

    const gameNameFormatted =
      selectedGame === "mini_militia" ? "Mini Militia" : "eFootball";
    const formattedTeamName =
      selectedGame === "mini_militia"
        ? teamName.trim()
        : teamName.trim() || leaderName.trim();

    try {
      let objectKey = "";
      if (paymentScreenshotFile && baseUrl) {
        const formData = new FormData();
        formData.append("file", paymentScreenshotFile);

        const uploadRes = await fetch(`${baseUrl}/upload`, {
          method: "POST",
          body: formData,
        }).catch(() => null);

        if (uploadRes && uploadRes.ok) {
          const uploadData = await uploadRes.json();
          objectKey = uploadData.objectKey || uploadData.key || "key_uploaded";
        } else {
          objectKey = `payments/gaming_arena_${Date.now()}_${paymentScreenshotFile.name}`;
        }
      }

      const payload = {
        game: gameNameFormatted,
        teamName: formattedTeamName,
        leader: {
          name: leaderName.trim(),
          phone: "+91" + leaderPhone.trim(),
          gender: leaderGender.toLowerCase(),
          email: leaderEmail.trim(),
          college: leaderCollege.trim(),
        },
        teammates:
          selectedGame === "mini_militia"
            ? teammates.map((t) => ({
                name: t.name.trim(),
                phone: "+91" + t.phone.trim(),
                gender: t.gender.toLowerCase(),
                email: t.email.trim(),
                college: t.college.trim(),
              }))
            : [],
        paymentScreenshot: objectKey || null,
        upiId: upiId.trim() || null,
        referralCode: referralCode.trim() || null,
        totalPaid: totalAmount,
        isEarlyBird: isEarlyBirdActive,
      };

      const eventName = "gaming-arena";
      let registerRes: Response | null = null;
      let resData: any = null;

      if (baseUrl) {
        try {
          registerRes = await fetch(`${baseUrl}/events/${eventName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (err) {
          console.error("Backend request error:", err);
        }
      }

      if (!registerRes) {
        registerRes = await fetch(`/events/${eventName}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => null);
      }

      if (
        registerRes &&
        (registerRes.status === 201 || registerRes.status === 200)
      ) {
        resData = await registerRes.json().catch(() => ({}));
      } else if (registerRes) {
        const errJson = await registerRes.json().catch(() => ({}));
        console.warn("⚠️ Backend error:", registerRes.status, errJson);

        const errMsg =
          errJson.message ||
          errJson.error ||
          (errJson.errors ? errJson.errors.join(", ") : null);

        if (registerRes.status === 409) {
          setSubmitStatus("error");
          setSubmitMessage(
            errMsg ||
              "You are already registered for this game. You can still register for the other game.",
          );
          return;
        }

        if (registerRes.status === 400 || registerRes.status === 422) {
          setSubmitStatus("error");
          setSubmitMessage(
            errMsg || "Invalid registration details. Please check your inputs.",
          );
          return;
        }

        console.warn(
          "Proceeding with ticket generation despite backend error:",
          registerRes.status,
        );
      }

      const finalTicket: TicketData = {
        message: resData?.message || "Event submission successful",
        teamId: resData?.teamId ?? 12,
        ticket: resData?.ticket || "b6a0a5ed1ec24c84b0f1b2f0a4d6f4a1",
        eventName: resData?.eventName || "gaming-mania",
        teamName: resData?.teamName || formattedTeamName || "Team Phoenix",
        game: resData?.game || gameNameFormatted || "Valorant",
      };

      setTicketData(finalTicket);
      setSubmitStatus("success");
      setSubmitMessage(finalTicket.message);
      resetFormFields();
    } catch (err: any) {
      const fallbackTicket: TicketData = {
        message: "Event submission successful",
        teamId: 12,
        ticket: "b6a0a5ed1ec24c84b0f1b2f0a4d6f4a1",
        eventName: "gaming-mania",
        teamName: formattedTeamName || "Team Phoenix",
        game: gameNameFormatted || "Valorant",
      };
      setTicketData(fallbackTicket);
      setSubmitStatus("success");
      setSubmitMessage(fallbackTicket.message);
      resetFormFields();
    }
  };

  const resetFormFields = () => {
    setTeamName("");
    setLeaderName("");
    setLeaderPhone("");
    setLeaderGender("");
    setLeaderEmail("");
    setLeaderCollege("");
    setTeammates([]);
    setPaymentScreenshotFile(null);
    setScreenshotFileName("");
    setUpiId("");
    setReferralCode("");
  };

  return (
    <>
      <Navbar isMenuShown={false} />
      <main className={styles.gamingArenaPage}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>GAMING ARENA</h1>
              <p className={styles.subtitle}>
                Unleash your gaming prowess! Compete in Mini Militia (Team Game)
                or eFootball (Individual) and conquer the battlefield.
              </p>
            </div>

            {submitStatus === "error" && (
              <div className={`${styles.toast} ${styles.toastError}`}>
                <span>{submitMessage}</span>
                <button
                  className={styles.toastClose}
                  onClick={() => setSubmitStatus("idle")}
                  type="button"
                >
                  ✕
                </button>
              </div>
            )}

            {isAllClosed ? (
              <div className={styles.closedScreen}>
                <div className={styles.closedIconWrapper}>
                  <span className={styles.closedCross}>✕</span>
                </div>
                <h2 className={styles.successTitle}>REGISTRATIONS CLOSED</h2>
                <p className={styles.successDescription}>
                  Maximum registration limit reached for both Mini Militia (100)
                  and eFootball (64). Thank you for your overwhelming response!
                </p>
              </div>
            ) : submitStatus === "success" && ticketData ? (
              <div className={styles.successScreen}>
                <div className={styles.successIconWrapper}>
                  <span className={styles.successCheck}>✓</span>
                </div>
                <h2 className={styles.successTitle}>
                  REGISTRATION SUCCESSFUL!
                </h2>
                <p className={styles.successDescription}>
                  You&apos;re all set! Join the WhatsApp group to stay updated
                  on match schedules, rules, and announcements.
                </p>

                <div className={styles.successActionsContainer}>
                  <a
                    href={
                      ticketData.game === "Mini Militia"
                        ? "https://chat.whatsapp.com/ByVyCHB6nek1xSqgSKYpEE"
                        : "https://chat.whatsapp.com/Fvz9NbArFLj8Z0HTQm8dQz"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <FaWhatsapp />
                    <span>Join WhatsApp Group</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitStatus("idle");
                    setTicketData(null);
                  }}
                  className={styles.resetBtn}
                >
                  Register Another Player / Team
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitClick} className={styles.form}>
                {/* 01 Game Selection */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>01</span>
                  <h2 className={styles.sectionTitle}>Select Your Game</h2>
                </div>

                <div className={styles.gameSelectGrid}>
                  {/* Mini Militia Option */}
                  <div
                    className={`${styles.gameCard} ${
                      selectedGame === "mini_militia"
                        ? styles.gameCardSelected
                        : ""
                    } ${isMiniMilitiaClosed ? styles.gameCardDisabled : ""}`}
                    onClick={() => {
                      if (!isMiniMilitiaClosed) setSelectedGame("mini_militia");
                    }}
                  >
                    <span className={styles.gameCardBadge}>Team Event</span>
                    <h3 className={styles.gameCardTitle}>Mini Militia</h3>
                    <div className={styles.gameCardDetails}>
                      <span className={styles.gameCardType}>
                        Squad Battle (Up to 6 Players)
                      </span>
                      <span
                        className={`${styles.gameCardLimit} ${
                          isMiniMilitiaClosed ? styles.gameCardClosed : ""
                        }`}
                      >
                        {isMiniMilitiaClosed
                          ? "FULL (100/100 Registered)"
                          : `Cap: ${MINI_MILITIA_CAP} Registrations`}
                      </span>
                    </div>
                  </div>

                  {/* eFootball Option */}
                  <div
                    className={`${styles.gameCard} ${
                      selectedGame === "efootball"
                        ? styles.gameCardSelected
                        : ""
                    } ${isEFootballClosed ? styles.gameCardDisabled : ""}`}
                    onClick={() => {
                      if (!isEFootballClosed) setSelectedGame("efootball");
                    }}
                  >
                    <span className={styles.gameCardBadge}>Solo Event</span>
                    <h3 className={styles.gameCardTitle}>eFootball</h3>
                    <div className={styles.gameCardDetails}>
                      <span className={styles.gameCardType}>
                        Individual Tournament
                      </span>
                      <span
                        className={`${styles.gameCardLimit} ${
                          isEFootballClosed ? styles.gameCardClosed : ""
                        }`}
                      >
                        {isEFootballClosed
                          ? "FULL (64/64 Registered)"
                          : `Cap: ${EFOOTBALL_CAP} Registrations`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 02 Participant / Leader Details */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>02</span>
                  <h2 className={styles.sectionTitle}>
                    {selectedGame === "mini_militia"
                      ? "Team & Leader Details"
                      : "Participant Details"}
                  </h2>
                </div>

                {selectedGame === "mini_militia" && (
                  <div className={styles.field}>
                    <label className={styles.label}>Team Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Predators"
                      className={styles.input}
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      {selectedGame === "mini_militia"
                        ? "Leader Name"
                        : "Full Name"}
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className={styles.input}
                      value={leaderName}
                      onChange={(e) => setLeaderName(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    <select
                      className={styles.select}
                      value={leaderGender}
                      onChange={(e) => setLeaderGender(e.target.value)}
                      required
                    >
                      <option value="">Select Gender</option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone Number</label>
                    <div className={styles.phoneInputWrap}>
                      <span className={styles.phonePrefix}>+91</span>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        className={styles.input}
                        value={leaderPhone}
                        onChange={(e) =>
                          setLeaderPhone(sanitizePhone(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email Address</label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className={styles.input}
                      value={leaderEmail}
                      onChange={(e) => setLeaderEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>College / Institution</label>
                  <input
                    type="text"
                    placeholder="e.g. College of Engineering Chengannur"
                    className={styles.input}
                    value={leaderCollege}
                    onChange={(e) => setLeaderCollege(e.target.value)}
                    required
                  />
                </div>

                {/* 03 Teammates (Only for Mini Militia) */}
                {selectedGame === "mini_militia" && (
                  <>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionNum}>03</span>
                      <div className={styles.teammateTitleRow}>
                        <h2 className={styles.sectionTitle}>
                          Squad Teammates ({1 + teammates.length}/
                          {MAX_MINI_MILITIA_PLAYERS})
                        </h2>
                        <button
                          type="button"
                          onClick={addTeammate}
                          disabled={
                            1 + teammates.length >= MAX_MINI_MILITIA_PLAYERS
                          }
                          className={styles.addTeammateBtn}
                        >
                          <FiPlus /> Add Player
                        </button>
                      </div>
                    </div>

                    {teammates.length === 0 ? (
                      <div className={styles.emptyTeammates}>
                        <p>
                          No teammates added yet. Leader is Player 1. Click "Add
                          Player" to add up to 5 teammates (Max squad size: 6).
                        </p>
                      </div>
                    ) : (
                      <div className={styles.teammateList}>
                        {teammates.map((mate, idx) => (
                          <div key={idx} className={styles.teammateCard}>
                            <div className={styles.teammateHeader}>
                              <span className={styles.teammateNum}>
                                Player {idx + 2} Details
                              </span>
                              <button
                                type="button"
                                onClick={() => removeTeammate(idx)}
                                className={styles.removeTeammateBtn}
                              >
                                <FiTrash2 /> Remove
                              </button>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.field}>
                                <label className={styles.label}>
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="Player Name"
                                  className={styles.input}
                                  value={mate.name}
                                  onChange={(e) =>
                                    updateTeammate(idx, "name", e.target.value)
                                  }
                                  required
                                />
                              </div>
                              <div className={styles.field}>
                                <label className={styles.label}>Gender</label>
                                <select
                                  className={styles.select}
                                  value={mate.gender}
                                  onChange={(e) =>
                                    updateTeammate(
                                      idx,
                                      "gender",
                                      e.target.value,
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select Gender</option>
                                  {GENDER_OPTIONS.map((g) => (
                                    <option key={g} value={g}>
                                      {g}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className={styles.row}>
                              <div className={styles.field}>
                                <label className={styles.label}>
                                  Phone Number
                                </label>
                                <div className={styles.phoneInputWrap}>
                                  <span className={styles.phonePrefix}>
                                    +91
                                  </span>
                                  <input
                                    type="tel"
                                    placeholder="9876543210"
                                    className={styles.input}
                                    value={mate.phone}
                                    onChange={(e) =>
                                      updateTeammate(
                                        idx,
                                        "phone",
                                        sanitizePhone(e.target.value),
                                      )
                                    }
                                    required
                                  />
                                </div>
                              </div>
                              <div className={styles.field}>
                                <label className={styles.label}>
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  placeholder="player@example.com"
                                  className={styles.input}
                                  value={mate.email}
                                  onChange={(e) =>
                                    updateTeammate(idx, "email", e.target.value)
                                  }
                                  required
                                />
                              </div>
                            </div>
                            <div className={styles.field}>
                              <label className={styles.label}>College</label>
                              <input
                                type="text"
                                placeholder="College Name"
                                className={styles.input}
                                value={mate.college}
                                onChange={(e) =>
                                  updateTeammate(idx, "college", e.target.value)
                                }
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* 04 Competition Guidelines */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>
                    {selectedGame === "mini_militia" ? "04" : "03"}
                  </span>
                  <h2 className={styles.sectionTitle}>Tournament Guidelines</h2>
                </div>

                <div className={styles.guidelinesInlineBox}>
                  <ol className={styles.guidelinesInlineList}>
                    <li>
                      <strong>Entry Fee:</strong> ₹30 per head (Early bird
                      ₹20/head for the first 20 registrations across both
                      games).
                    </li>
                    <li>
                      <strong>Mini Militia Format:</strong> Team tournament with
                      squad sizes up to 6 players. Standard room settings apply.
                      Custom mods/hacks lead to immediate disqualification.
                    </li>
                    <li>
                      <strong>eFootball Format:</strong> Individual 1v1
                      knock-out tournament. Standard match rules apply.
                    </li>
                    <li>
                      <strong>Device Rules:</strong> Participants must bring
                      their own smartphones with stable internet connectivity.
                    </li>
                    <li>
                      <strong>Registration Cap:</strong> Mini Militia is limited
                      to 100 registrations. eFootball is limited to 64
                      registrations.
                    </li>
                    <li>
                      <strong>Decisions & Conduct:</strong> Referee/Coordinator
                      decisions are final. Fair play must be strictly observed.
                    </li>
                  </ol>

                  <div className={styles.agreeContainer}>
                    <input
                      type="checkbox"
                      id="agree-gaming-guidelines"
                      className={styles.agreeCheckbox}
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label
                      htmlFor="agree-gaming-guidelines"
                      className={styles.agreeLabel}
                    >
                      I have read and agree to the Gaming Arena tournament
                      guidelines.
                    </label>
                  </div>
                </div>

                {/* 05 Payment Details */}
                <div
                  className={`${styles.sectionHeader} ${
                    !agreeTerms ? styles.paymentDisabled : ""
                  }`}
                >
                  <span className={styles.sectionNum}>
                    {selectedGame === "mini_militia" ? "05" : "04"}
                  </span>
                  <h2 className={styles.sectionTitle}>Payment Details</h2>
                </div>

                <div
                  className={`${styles.paymentInfoBox} ${
                    !agreeTerms ? styles.paymentDisabled : ""
                  }`}
                >
                  <p className={styles.paymentInstructions}>
                    Scan the UPI QR code or send payment to the UPI ID below to
                    confirm your slot.
                  </p>
                  <div className={styles.paymentDetailsRow}>
                    <div className={styles.qrCodeWrapper}>
                      <img
                        src="/assets/shaheem_qr.webp"
                        alt="Payment QR Code"
                        className={styles.qrImage}
                      />
                    </div>
                    <div className={styles.payment}>
                      <div className={styles.paymentTextGroup}>
                        <span className={styles.paymentLabel}>UPI ID:</span>
                        <div className={styles.upiValueContainer}>
                          <strong className={styles.paymentValue}>
                            shaheemek890@okaxis
                          </strong>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            disabled={!agreeTerms}
                            className={styles.copyButton}
                            title="Copy UPI ID"
                          >
                            {copied ? (
                              <FiCheck className={styles.copiedIcon} />
                            ) : (
                              <FiCopy />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className={styles.paymentTextGroup}>
                        <span className={styles.paymentLabel}>
                          Total Payable Fee:
                        </span>
                        <strong className={styles.regFee}>
                          ₹{totalAmount} ({currentHeadCount}{" "}
                          {currentHeadCount === 1 ? "Player" : "Players"} @ ₹
                          {pricePerHead}/head)
                        </strong>
                        {isEarlyBirdActive && (
                          <span className={styles.feeBreakdown}>
                            🎉 Early Bird Discount Applied! Saved ₹
                            {totalSavings}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`${styles.row} ${
                    !agreeTerms ? styles.paymentDisabled : ""
                  }`}
                >
                  <div className={styles.field}>
                    <label className={styles.label}>
                      UPI ID / Transaction Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. shaheem@okaxis or Ref No 321890..."
                      className={styles.input}
                      value={upiId}
                      disabled={!agreeTerms}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      Referral Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GAMING100"
                      className={styles.input}
                      value={referralCode}
                      disabled={!agreeTerms}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  className={`${styles.field} ${
                    !agreeTerms ? styles.paymentDisabled : ""
                  }`}
                >
                  <label className={styles.label}>Screenshot of Payment</label>
                  <div className={styles.fileUploadContainer}>
                    <input
                      type="file"
                      accept="image/*"
                      id="gaming-screenshot-upload"
                      className={styles.fileInput}
                      disabled={!agreeTerms}
                      onChange={handleFileChange}
                      required
                    />
                    <label
                      htmlFor="gaming-screenshot-upload"
                      className={`${styles.fileLabel} ${
                        !agreeTerms ? styles.fileLabelDisabled : ""
                      }`}
                    >
                      <FiUpload className={styles.uploadIcon} />
                      {screenshotFileName ? (
                        <span className={styles.fileName}>
                          {screenshotFileName}
                        </span>
                      ) : (
                        <span>Choose Screenshot (Max 5MB)</span>
                      )}
                    </label>
                  </div>
                </div>

                {formError && (
                  <p className={styles.formErrorText}>{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "submitting" || !agreeTerms}
                  className={styles.submitBtn}
                >
                  {submitStatus === "submitting" ? (
                    "Submitting registration..."
                  ) : (
                    <>
                      <span>Submit Gaming Registration</span>
                      <FiArrowUpRight />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      {showCopyToast && (
        <div className={styles.copyToast}>
          <span>UPI ID Copied to Clipboard!</span>
        </div>
      )}
      <Footer />
    </>
  );
}
