"use client";

import { useState, useCallback, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./ideathon.module.css";
import {
  FiArrowUpRight,
  FiUpload,
  FiTrash2,
  FiPlus,
  FiCopy,
  FiCheck,
} from "react-icons/fi";

const MAX_TEAMMATES = 3;

const emptyTeammate = () => ({ name: "", email: "", phone: "", college: "" });

const isValidPhone = (num: string) => /^[6-9]\d{9}$/.test(num);
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizePhone = (val: string) => val.replace(/\D/g, "").slice(0, 10);

export default function IdeathonPage() {
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [college, setCollege] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teammates, setTeammates] = useState<
    { name: string; email: string; phone: string; college: string }[]
  >([]);
  const [paymentScreenshotFile, setPaymentScreenshotFile] =
    useState<File | null>(null);
  const [screenshotFileName, setScreenshotFileName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("shaheemek890@okaxis");
    setCopied(true);
    setShowCopyToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowCopyToast(false);
    }, 2000);
  };

  const [formError, setFormError] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const deadline = new Date("2026-07-26T23:59:59");
    setIsClosed(new Date() > deadline);
  }, []);

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
    if (teammates.length < MAX_TEAMMATES) {
      setTeammates((prev) => [...prev, emptyTeammate()]);
    }
  };

  const removeTeammate = (index: number) => {
    setTeammates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTeammate = useCallback(
    (
      index: number,
      field: "name" | "email" | "phone" | "college",
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

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSubmitStatus("idle");
    setSubmitMessage("");

    if (!teamName.trim()) return setFormError("Team name is required.");
    if (!leaderName.trim())
      return setFormError("Team leader's name is required.");
    if (!college.trim()) return setFormError("College name is required.");
    if (!email.trim() || !isValidEmail(email))
      return setFormError("Enter a valid email address.");
    if (!phone.trim() || !isValidPhone(phone))
      return setFormError("Enter a valid 10-digit phone number.");

    if (teammates.length < 1) {
      return setFormError(
        "Minimum 2 people have to register as a team. Solo registration is not allowed.",
      );
    }

    for (let i = 0; i < teammates.length; i++) {
      const mate = teammates[i];
      if (!mate.name.trim())
        return setFormError(`Teammate ${i + 1}'s name is required.`);
      if (!mate.college.trim())
        return setFormError(`Teammate ${i + 1}'s college is required.`);
      if (!mate.email.trim() || !isValidEmail(mate.email))
        return setFormError(`Enter a valid email for Teammate ${i + 1}.`);
      if (!mate.phone.trim() || !isValidPhone(mate.phone))
        return setFormError(
          `Enter a valid 10-digit phone number for Teammate ${i + 1}.`,
        );
    }

    if (!paymentScreenshotFile)
      return setFormError("Please upload a screenshot of payment.");
    if (!upiId.trim()) return setFormError("UPI ID is required.");

    setAgreeTerms(false);
    setShowGuidelinesModal(true);
  };

  const handleFinalSubmit = async () => {
    if (!agreeTerms) return;
    setShowGuidelinesModal(false);
    setSubmitStatus("submitting");

    const baseUrl = process.env.NEXT_PUBLIC_IDEATHON_API_URL!;

    try {
      // Step 1: Upload Screenshot
      let objectKey = "";
      if (paymentScreenshotFile) {
        const formData = new FormData();
        formData.append("file", paymentScreenshotFile);

        const uploadRes = await fetch(`${baseUrl}/upload`, {
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

      if (!objectKey) {
        throw new Error("File upload did not return a valid key.");
      }

      // Step 2: Register Team
      const payload = {
        teamName: teamName.trim(),
        leader: {
          name: leaderName.trim(),
          email: email.trim(),
          phone: "+91" + phone.trim(),
          college: college.trim(),
        },
        teammates: teammates.map((t) => ({
          name: t.name.trim(),
          email: t.email.trim(),
          phone: t.phone.trim(),
          college: t.college.trim(),
        })),
        paymentScreenshot: objectKey,
        upiId: upiId.trim(),
        referralCode: referralCode.trim(),
      };

      const registerRes = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await registerRes.json();

      if (registerRes.status === 201) {
        setSubmitStatus("success");
        setSubmitMessage("Ideathon Registration Submitted Successfully!");
        setTeamName("");
        setLeaderName("");
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

  return (
    <>
      <Navbar isMenuShown={false} mainUrl={"/"} />
      <main className={styles.ideathonPage}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>IDEATHON</h1>
              <p className={styles.subtitle}>
                Turn your ideas into impact. Register now for IDEATHON '26 and
                showcase your innovation on a state-level platform.
              </p>
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
                <h2 className={styles.successTitle}>REGISTRATION CLOSED</h2>
                <p className={styles.successDescription}>
                  The registration deadline for the Ideathon has passed (26th
                  July 2026, 11:59 PM). We are no longer accepting submissions.
                </p>
              </div>
            ) : submitStatus === "success" ? (
              <div className={styles.successScreen}>
                <div className={styles.successIconWrapper}>
                  <span className={styles.successCheck}>✓</span>
                </div>
                <h2 className={styles.successTitle}>
                  REGISTRATION SUCCESSFUL!
                </h2>
                <p className={styles.successDescription}>
                  Your registration for the Ideathon has been recorded. Please
                  join the official WhatsApp group to get all upcoming
                  notifications, guidelines, and event announcements.
                </p>

                <a
                  href="https://chat.whatsapp.com/JGQikpijfYf9MBUBK1n66m?mode=gi_t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  Join WhatsApp Group
                </a>

                <button
                  type="button"
                  onClick={() => setSubmitStatus("idle")}
                  className={styles.resetBtn}
                >
                  Register Another Team
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitClick} className={styles.form}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>01</span>
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

                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>02</span>
                  <h2 className={styles.sectionTitle}>Team Leader Details</h2>
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
                </div>

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
                        onChange={(e) =>
                          setPhone(sanitizePhone(e.target.value))
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>03</span>
                  <div className={styles.teammateTitleRow}>
                    <h2 className={styles.sectionTitle}>Teammates</h2>
                    <button
                      type="button"
                      onClick={addTeammate}
                      disabled={teammates.length >= MAX_TEAMMATES}
                      className={styles.addTeammateBtn}
                    >
                      <FiPlus /> Add Teammate ({teammates.length}/
                      {MAX_TEAMMATES})
                    </button>
                  </div>
                </div>

                {teammates.length === 0 ? (
                  <div className={styles.emptyTeammates}>
                    <p>
                      No teammates added yet. Teams must consist of at least 2
                      members (1 Leader + at least 1 Teammate).
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

                <div className={styles.sectionHeader}>
                  <span className={styles.sectionNum}>04</span>
                  <h2 className={styles.sectionTitle}>Payment Details</h2>
                </div>

                <div className={styles.paymentInfoBox}>
                  <p className={styles.paymentInstructions}>
                    Scan the UPI QR code or pay to the UPI ID below to complete
                    your registration.
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
                        <strong className={styles.regFee}>₹200/Team</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label}>
                      UPI ID (UPI ID used for payment)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. transfer-id@ybl"
                      className={styles.input}
                      value={upiId}
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
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Screenshot of Payment</label>
                  <div className={styles.fileUploadContainer}>
                    <input
                      type="file"
                      accept="image/*"
                      id="screenshot-upload"
                      className={styles.fileInput}
                      onChange={handleFileChange}
                      required
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className={styles.fileLabel}
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
                  disabled={submitStatus === "submitting"}
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
      </main>
      {showGuidelinesModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowGuidelinesModal(false)}
        >
          <div
            className={styles.guidelinesModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalCloseBtn}
              onClick={() => setShowGuidelinesModal(false)}
            >
              ✕
            </button>
            <h3 className={styles.guidelinesModalTitle}>
              COMPETITION GUIDELINES
            </h3>

            <ol className={styles.guidelinesModalList}>
              <li>
                The competition consists of{" "}
                <strong>two rounds: Preliminary Round and Final Round.</strong>
              </li>
              <li>
                Only the <strong>shortlisted teams</strong> from the Preliminary
                Round will qualify for the <strong>Final Round</strong>, which
                will be held on{" "}
                <strong>
                  1st August 2026 at College of Engineering Chengannur (CEC)
                </strong>
                .
              </li>
              <li>
                Teams are <strong>free to choose their own theme/idea</strong>{" "}
                for the Preliminary Round.
              </li>
              <li>
                Teams{" "}
                <strong>
                  may change or refine their theme/idea before the Final Round
                </strong>{" "}
                if they develop a{" "}
                <strong>better or more improved concept</strong>.
              </li>
              <li>
                The <strong>Preliminary Round</strong> will be conducted{" "}
                <strong>online</strong>. Teams must submit their pitch in the{" "}
                <strong>prescribed format</strong>, which will be shared later.
              </li>
              <li>
                Registration will be considered confirmed upon successful
                completion of the process, and the{" "}
                <strong>
                  participation fee once processed will not be subject to
                  revision.
                </strong>
                .
              </li>
            </ol>

            <div className={styles.agreeContainer}>
              <input
                type="checkbox"
                id="agree-guidelines"
                className={styles.agreeCheckbox}
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
              />
              <label htmlFor="agree-guidelines" className={styles.agreeLabel}>
                I agree to the guidelines and confirm our team registration.
              </label>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowGuidelinesModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmSubmitBtn}
                disabled={!agreeTerms}
                onClick={handleFinalSubmit}
              >
                Confirm &amp; Register
              </button>
            </div>
          </div>
        </div>
      )}
      {showCopyToast && (
        <div className={styles.copyToast}>
          <span>UPI ID Copied to Clipboard!</span>
        </div>
      )}
      <Footer />
    </>
  );
}
