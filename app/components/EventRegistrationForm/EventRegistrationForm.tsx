"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import styles from "./EventRegistrationForm.module.css";
import { FaWhatsapp } from "react-icons/fa";
import {
  FiArrowUpRight,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiCopy,
  FiCheck,
  FiDownload,
} from "react-icons/fi";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TicketData {
  message?: string;
  teamId?: number | string;
  ticket?: string;
  eventName?: string;
  teamName?: string;
  game?: string;
}

interface PaymentConfig {
  upiId: string;
  qrCodeSrc: string;
  feeLabel: string;
}

export interface EventRegistrationFormProps {
  /* Content */
  title: string;
  subtitle: string;

  /* Team config */
  leaderLabel?: string;
  maxTeammates: number;
  minTeammates?: number;
  showGender?: boolean;
  showTicket?: boolean;

  /* Payment */
  requiresPayment: boolean;
  paymentConfig?: PaymentConfig;

  /* Guidelines */
  guidelines: ReactNode;
  guidelinesCheckboxLabel?: string;

  /* Submission */
  gameName?: string;
  totalPaidAmount?: number;
  isEarlyBird?: boolean;
  apiBaseUrl?: string;
  registerEndpoint: string;
  uploadEndpoint: string;

  /* Post-success */
  successTitle?: string;
  successDescription?: string;
  whatsappGroupUrl?: string;
  resetButtonLabel?: string;

  /* Closed state */
  isClosed?: boolean;
  closedTitle?: string;
  closedMessage?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;
const emptyTeammate = () => ({
  name: "",
  email: "",
  phone: "",
  college: "",
  gender: "",
});
const isValidPhone = (num: string) => /^[6-9]\d{9}$/.test(num);
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 10);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventRegistrationForm({
  title,
  subtitle,
  leaderLabel = "Team Leader Details",
  maxTeammates,
  minTeammates = 0,
  showGender = false,
  showTicket = false,
  requiresPayment,
  paymentConfig,
  guidelines,
  guidelinesCheckboxLabel = "competition guidelines",
  gameName,
  totalPaidAmount,
  isEarlyBird = false,
  apiBaseUrl,
  registerEndpoint,
  uploadEndpoint,
  successTitle = "REGISTRATION SUCCESSFUL!",
  successDescription,
  whatsappGroupUrl,
  resetButtonLabel = "Register Another Team",
  isClosed = false,
  closedTitle = "REGISTRATION CLOSED",
  closedMessage,
}: EventRegistrationFormProps) {
  /* ---- Form state ---- */
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [leaderGender, setLeaderGender] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teammates, setTeammates] = useState<
    {
      name: string;
      email: string;
      phone: string;
      college: string;
      gender: string;
    }[]
  >([]);

  /* ---- Payment state ---- */
  const [paymentScreenshotFile, setPaymentScreenshotFile] =
    useState<File | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  /* ---- Submission state ---- */
  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (submitStatus === "success" || submitStatus === "error") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [submitStatus]);

  /* ---- Derived ---- */
  const baseUrl = apiBaseUrl || process.env.NEXT_PUBLIC_IDEATHON_API_URL || "";

  /* ---- Handlers ---- */
  const handleCopyUpi = () => {
    if (!paymentConfig) return;
    navigator.clipboard.writeText(paymentConfig.upiId);
    setCopied(true);
    setShowCopyToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopyToast(false);
    }, 2000);
  };

  const handleDownloadTicket = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = `${(ticketData?.eventName || title).replace(/\s+/g, "_")}_Ticket.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download ticket image:", err);
    }
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
    if (teammates.length < maxTeammates) {
      setTeammates((prev) => [...prev, emptyTeammate()]);
    }
  };

  const removeTeammate = (index: number) => {
    setTeammates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTeammate = useCallback(
    (
      index: number,
      field: "name" | "email" | "phone" | "college" | "gender",
      value: string,
    ) => {
      setTeammates((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], [field]: value };
        return copy;
      });
    },
    [],
  );

  /* ---- Validation ---- */
  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitStatus("idle");
    setSubmitMessage("");

    if (!teamName.trim()) return setFormError("Team name is required.");
    if (!leaderName.trim())
      return setFormError("Team leader's name is required.");
    if (showGender && !leaderGender)
      return setFormError("Please select a gender.");
    if (!college.trim()) return setFormError("College name is required.");
    if (!email.trim() || !isValidEmail(email))
      return setFormError("Enter a valid email address.");
    if (!phone.trim() || !isValidPhone(phone))
      return setFormError("Enter a valid 10-digit phone number.");

    if (teammates.length < minTeammates) {
      return setFormError(
        `Minimum ${minTeammates + 1} people have to register as a team. Solo registration is not allowed.`,
      );
    }

    for (let i = 0; i < teammates.length; i++) {
      const mate = teammates[i];
      if (!mate.name.trim())
        return setFormError(`Teammate ${i + 1}'s name is required.`);
      if (showGender && !mate.gender)
        return setFormError(`Select gender for Teammate ${i + 1}.`);
      if (!mate.college.trim())
        return setFormError(`Teammate ${i + 1}'s college is required.`);
      if (!mate.email.trim() || !isValidEmail(mate.email))
        return setFormError(`Enter a valid email for Teammate ${i + 1}.`);
      if (!mate.phone.trim() || !isValidPhone(mate.phone))
        return setFormError(
          `Enter a valid 10-digit phone number for Teammate ${i + 1}.`,
        );
    }

    if (!agreeTerms)
      return setFormError(
        `Please accept the ${guidelinesCheckboxLabel} to continue.`,
      );

    if (requiresPayment) {
      if (!paymentScreenshotFile)
        return setFormError("Please upload a screenshot of payment.");
      if (!upiId.trim()) return setFormError("UPI ID is required.");
    }

    handleFinalSubmit();
  };

  /* ---- Submission ---- */
  const handleFinalSubmit = async () => {
    if (!agreeTerms) return;
    setSubmitStatus("submitting");

    try {
      let objectKey = "";

      /* Upload screenshot (payment events only) */
      if (requiresPayment && paymentScreenshotFile) {
        const formData = new FormData();
        formData.append("file", paymentScreenshotFile);

        const uploadRes = await fetch(`${baseUrl}${uploadEndpoint}`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error(
            "Failed to upload payment screenshot. Please try again.",
          );
        }

        const uploadData = await uploadRes.json();
        objectKey = uploadData.objectKey;
      }

      if (requiresPayment && !objectKey) {
        throw new Error("File upload did not return a valid key.");
      }

      /* Build payload */
      const leaderData: Record<string, string> = {
        name: leaderName.trim(),
        email: email.trim(),
        phone: "+91" + phone.trim(),
        college: college.trim(),
      };
      if (showGender) leaderData.gender = leaderGender.toLowerCase();

      const calculatedTotalPaid =
        totalPaidAmount !== undefined
          ? totalPaidAmount
          : requiresPayment
            ? 20
            : 0;

      const payload: Record<string, unknown> = {
        game: gameName || title,
        teamName: teamName.trim(),
        leader: leaderData,
        teammates: teammates.map((t) => {
          const td: Record<string, string> = {
            name: t.name.trim(),
            email: t.email.trim(),
            phone: "+91" + t.phone.trim(),
            college: t.college.trim(),
          };
          if (showGender) td.gender = t.gender.toLowerCase();
          return td;
        }),
        totalPaid: calculatedTotalPaid,
        isEarlyBird: Boolean(isEarlyBird),
      };

      if (requiresPayment) {
        payload.paymentScreenshot = objectKey;
        payload.upiId = upiId.trim();
        payload.referralCode = referralCode.trim() || null;
      }

      /* Register */
      const registerRes = await fetch(`${baseUrl}${registerEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await registerRes.json();

      if (registerRes.status === 200 || registerRes.status === 201) {
        if (resData.ticket || resData.teamId) {
          setTicketData({
            message: resData.message,
            teamId: resData.teamId,
            ticket: resData.ticket,
            eventName: resData.eventName || title,
            teamName: resData.teamName || teamName.trim(),
            game: resData.game,
          });
        }
        setSubmitStatus("success");
        setSubmitMessage(
          resData.message || `${title} Registration Submitted Successfully!`,
        );
        setTeamName("");
        setLeaderName("");
        setLeaderGender("");
        setCollege("");
        setEmail("");
        setPhone("");
        setTeammates([]);
        setPaymentScreenshotFile(null);
        setScreenshotFileName("");
        setUpiId("");
        setReferralCode("");
      } else {
        setSubmitStatus("error");
        const errMsg =
          resData.error ||
          (resData.errors ? resData.errors.join(", ") : "Registration failed.");
        setSubmitMessage(errMsg);
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setSubmitMessage(
        err.message || "An unexpected error occurred during submission.",
      );
    }
  };

  /* ---- Section numbering (auto-adjusts when payment is hidden) ---- */
  const sectionTeamDetails = "01";
  const sectionLeader = "02";
  const sectionTeammates = "03";
  const sectionGuidelines = "04";
  const sectionPayment = "05";

  /* ---- Render ---- */
  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          {submitStatus === "error" && (
            <div className={`${styles.toast} ${styles.toastError}`}>
              <span>{submitMessage}</span>
              <button
                className={styles.toastClose}
                onClick={() => setSubmitStatus("idle")}
              >
                ✕
              </button>
            </div>
          )}

          {isClosed ? (
            <div className={styles.closedScreen}>
              <div className={styles.closedIconWrapper}>
                <span className={styles.closedCross}>✕</span>
              </div>
              <h2 className={styles.successTitle}>{closedTitle}</h2>
              <p className={styles.successDescription}>
                {closedMessage ||
                  "Registration is currently closed. We are no longer accepting submissions."}
              </p>
            </div>
          ) : submitStatus === "success" ? (
            <div className={styles.successScreen}>
              <div className={styles.successIconWrapper}>
                <span className={styles.successCheck}>✓</span>
              </div>
              <h2 className={styles.successTitle}>{successTitle}</h2>
              <p className={styles.successDescription}>
                {successDescription ||
                  "Your registration has been recorded successfully."}
              </p>

              {showTicket && ticketData?.ticket && (
                <div className={styles.ticketCardWrapper}>
                  <div ref={ticketRef} className={styles.ticketCard}>
                    <div className={styles.ticketHeader}>
                      <span className={styles.ticketEventBadge}>
                        {ticketData.eventName || title}
                      </span>
                      <span className={styles.ticketBadgeTag}>
                        OFFICIAL TICKET
                      </span>
                    </div>

                    <div className={styles.ticketBody}>
                      <div className={styles.ticketInfoGroup}>
                        <div className={styles.ticketMetaItem}>
                          <span className={styles.ticketMetaLabel}>
                            Team / Participant
                          </span>
                          <strong className={styles.ticketMetaValue}>
                            {ticketData.teamName || "Registered Participant"}
                          </strong>
                        </div>
                        {ticketData.game && (
                          <div className={styles.ticketMetaItem}>
                            <span className={styles.ticketMetaLabel}>Game</span>
                            <strong className={styles.ticketMetaValue}>
                              {ticketData.game}
                            </strong>
                          </div>
                        )}
                      </div>

                      <div className={styles.ticketQrContainer}>
                        <QRCodeSVG
                          value={ticketData.ticket}
                          size={130}
                          level="H"
                          includeMargin={true}
                          bgColor="#ffffff"
                          fgColor="#1a1a1a"
                        />
                      </div>
                    </div>

                    <div className={styles.ticketFooterNote}>
                      Present this QR code at the venue for check-in
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadTicket}
                    className={styles.downloadTicketBtn}
                  >
                    <FiDownload /> Download Ticket (PNG)
                  </button>
                </div>
              )}

              {whatsappGroupUrl && (
                <a
                  href={whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  <FaWhatsapp />
                  <span>Join WhatsApp Group</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  setSubmitStatus("idle");
                  setTicketData(null);
                }}
                className={styles.resetBtn}
              >
                {resetButtonLabel}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitClick} className={styles.form}>
              {/* ===== 01 — Team Details ===== */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>{sectionTeamDetails}</span>
                <h2 className={styles.sectionTitle}>Team Details</h2>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. Innovators Club"
                  className={styles.input}
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>

              {/* ===== 02 — Leader Details ===== */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>{sectionLeader}</span>
                <h2 className={styles.sectionTitle}>{leaderLabel}</h2>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Leader Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className={styles.input}
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    required
                  />
                </div>
                {showGender ? (
                  <div className={styles.field}>
                    <label className={styles.label}>Gender</label>
                    <select
                      className={styles.select}
                      value={leaderGender}
                      onChange={(e) => setLeaderGender(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Gender
                      </option>
                      {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className={styles.field}>
                    <label className={styles.label}>College</label>
                    <input
                      type="text"
                      placeholder="e.g. CEC Chengannur"
                      className={styles.input}
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {showGender && (
                <div className={styles.field}>
                  <label className={styles.label}>College</label>
                  <input
                    type="text"
                    placeholder="e.g. CEC Chengannur"
                    className={styles.input}
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Email Address</label>
                  <input
                    type="email"
                    placeholder="john@ceconline.edu"
                    className={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phone Number</label>
                  <div className={styles.phoneInputWrap}>
                    <span className={styles.phonePrefix}>+91</span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      className={styles.input}
                      value={phone}
                      onChange={(e) => setPhone(sanitizePhone(e.target.value))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ===== 03 — Teammates ===== */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>{sectionTeammates}</span>
                <div className={styles.teammateTitleRow}>
                  <h2 className={styles.sectionTitle}>Teammates</h2>
                  <button
                    type="button"
                    onClick={addTeammate}
                    disabled={teammates.length >= maxTeammates}
                    className={styles.addTeammateBtn}
                  >
                    <FiPlus /> Add Teammate ({teammates.length}/{maxTeammates})
                  </button>
                </div>
              </div>

              {teammates.length === 0 ? (
                <div className={styles.emptyTeammates}>
                  <p>
                    {minTeammates > 0
                      ? `No teammates added yet. Teams must consist of at least ${minTeammates + 1} members (1 Leader + at least ${minTeammates} Teammate${minTeammates > 1 ? "s" : ""}).`
                      : "No teammates added yet. Click \u201cAdd Teammate\u201d to add team members."}
                  </p>
                </div>
              ) : (
                <div className={styles.teammateList}>
                  {teammates.map((mate, idx) => (
                    <div key={idx} className={styles.teammateCard}>
                      <div className={styles.teammateHeader}>
                        <span className={styles.teammateNum}>
                          Teammate {idx + 1}
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
                          <label className={styles.label}>Full Name</label>
                          <input
                            type="text"
                            placeholder="Full Name"
                            className={styles.input}
                            value={mate.name}
                            onChange={(e) =>
                              updateTeammate(idx, "name", e.target.value)
                            }
                            required
                          />
                        </div>
                        {showGender && (
                          <div className={styles.field}>
                            <label className={styles.label}>Gender</label>
                            <select
                              className={styles.select}
                              value={mate.gender}
                              onChange={(e) =>
                                updateTeammate(idx, "gender", e.target.value)
                              }
                              required
                            >
                              <option value="" disabled>
                                Select Gender
                              </option>
                              {GENDER_OPTIONS.map((g) => (
                                <option key={g} value={g}>
                                  {g}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
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
                      <div className={styles.row}>
                        <div className={styles.field}>
                          <label className={styles.label}>Email</label>
                          <input
                            type="email"
                            placeholder="email@college.edu"
                            className={styles.input}
                            value={mate.email}
                            onChange={(e) =>
                              updateTeammate(idx, "email", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className={styles.field}>
                          <label className={styles.label}>Phone Number</label>
                          <div className={styles.phoneInputWrap}>
                            <span className={styles.phonePrefix}>+91</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ===== 04 — Guidelines ===== */}
              <div className={styles.sectionHeader}>
                <span className={styles.sectionNum}>{sectionGuidelines}</span>
                <h2 className={styles.sectionTitle}>
                  {requiresPayment
                    ? "Competition Guidelines"
                    : "Event Guidelines"}
                </h2>
              </div>

              <div className={styles.guidelinesInlineBox}>
                <ol className={styles.guidelinesInlineList}>{guidelines}</ol>

                <div className={styles.agreeContainer}>
                  <input
                    type="checkbox"
                    id="agree-guidelines"
                    className={styles.agreeCheckbox}
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <label
                    htmlFor="agree-guidelines"
                    className={styles.agreeLabel}
                  >
                    I have read and agree to the {guidelinesCheckboxLabel}.
                  </label>
                </div>
              </div>

              {/* ===== 05 — Payment (conditional) ===== */}
              {requiresPayment && paymentConfig && (
                <>
                  <div
                    className={`${styles.sectionHeader} ${!agreeTerms ? styles.paymentDisabled : ""}`}
                  >
                    <span className={styles.sectionNum}>{sectionPayment}</span>
                    <h2 className={styles.sectionTitle}>Payment Details</h2>
                  </div>

                  <div
                    className={`${styles.paymentInfoBox} ${!agreeTerms ? styles.paymentDisabled : ""}`}
                  >
                    <p className={styles.paymentInstructions}>
                      Scan the UPI QR code or pay to the UPI ID below to
                      complete your registration.
                    </p>
                    <div className={styles.paymentDetailsRow}>
                      <div className={styles.qrCodeWrapper}>
                        <img
                          src={paymentConfig.qrCodeSrc}
                          alt="Payment QR Code"
                          className={styles.qrImage}
                        />
                      </div>
                      <div className={styles.payment}>
                        <div className={styles.paymentTextGroup}>
                          <span className={styles.paymentLabel}>UPI ID:</span>
                          <div className={styles.upiValueContainer}>
                            <strong className={styles.paymentValue}>
                              {paymentConfig.upiId}
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
                            Registration Fee:
                          </span>
                          <strong className={styles.regFee}>
                            {paymentConfig.feeLabel}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`${styles.row} ${!agreeTerms ? styles.paymentDisabled : ""}`}
                  >
                    <div className={styles.field}>
                      <label className={styles.label}>
                        UPI ID (UPI ID used for payment)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. transfer-id@ybl"
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
                        placeholder="e.g. REF100"
                        className={styles.input}
                        value={referralCode}
                        disabled={!agreeTerms}
                        onChange={(e) => setReferralCode(e.target.value)}
                      />
                    </div>
                  </div>

                  <div
                    className={`${styles.field} ${!agreeTerms ? styles.paymentDisabled : ""}`}
                  >
                    <label className={styles.label}>
                      Screenshot of Payment
                    </label>
                    <div className={styles.fileUploadContainer}>
                      <input
                        type="file"
                        accept="image/*"
                        id="screenshot-upload"
                        className={styles.fileInput}
                        disabled={!agreeTerms}
                        onChange={handleFileChange}
                        required
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className={`${styles.fileLabel} ${!agreeTerms ? styles.fileLabelDisabled : ""}`}
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
                </>
              )}

              {/* ===== Error & Submit ===== */}
              {formError && <p className={styles.formErrorText}>{formError}</p>}

              <button
                type="submit"
                disabled={submitStatus === "submitting" || !agreeTerms}
                className={styles.submitBtn}
              >
                {submitStatus === "submitting" ? (
                  "Submitting registration..."
                ) : (
                  <>
                    <span>Submit Registration</span>
                    <FiArrowUpRight />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {showCopyToast && (
        <div className={styles.copyToast}>
          <span>UPI ID Copied to Clipboard!</span>
        </div>
      )}
    </>
  );
}
