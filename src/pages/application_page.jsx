// SurePro — Real Firebase Job Application Page
// Route: /provider/jobs/:jobId/apply
//
// Flow:
// 1. Get job/request ID from URL
// 2. Load exact request from Firestore
// 3. Get the request owner's customerId
// 4. Load exact customer profile from users/{customerId}
// 5. Load current provider profile from providers/{providerId}
// 6. Submit application to applications collection
// 7. Update request applicant count/list
// 8. Create customer notification
// 9. Show application tracking screen

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  arrayUnion,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

// ─────────────────────────────────────────────
// Cloudinary
// Uses the LocalPro unsigned upload preset
// ─────────────────────────────────────────────

const CLOUDINARY_CLOUD_NAME = "gyi1abfr";
const CLOUDINARY_UPLOAD_PRESET = "localpro_unsigned";

async function uploadToCloudinary(file) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Photo upload failed: ${text}`);
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
  };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "CU"
  );
}

function formatDate(value) {
  if (!value) return "Recently";

  try {
    const date = value?.toDate ? value.toDate() : new Date(value);

    return date.toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function formatRelativeDate(value) {
  if (!value) return "Recently";

  try {
    const date = value?.toDate ? value.toDate() : new Date(value);

    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString("en-NG");
  } catch {
    return "Recently";
  }
}

function formatBudget(min, max, budget) {
  if (budget) return budget;

  const minimum = Number(min || 0);
  const maximum = Number(max || 0);

  if (minimum && maximum) {
    return `₦${minimum.toLocaleString("en-NG")}–₦${maximum.toLocaleString(
      "en-NG"
    )}`;
  }

  if (minimum) {
    return `₦${minimum.toLocaleString("en-NG")}`;
  }

  if (maximum) {
    return `₦${maximum.toLocaleString("en-NG")}`;
  }

  return "Budget not specified";
}

function getStatusBadge(status) {
  const normalized = String(status || "open").toLowerCase();

  if (normalized === "urgent") {
    return {
      label: "Urgent",
      className:
        "bg-red-50 text-red-800 border border-red-200",
    };
  }

  if (normalized === "new") {
    return {
      label: "New",
      className:
        "bg-emerald-50 text-emerald-800 border border-emerald-200",
    };
  }

  if (normalized === "open") {
    return {
      label: "Open",
      className:
        "bg-blue-50 text-blue-800 border border-blue-200",
    };
  }

  return {
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    className:
      "bg-gray-50 text-gray-700 border border-gray-200",
  };
}

// ─────────────────────────────────────────────
// Apply Form
// ─────────────────────────────────────────────

function ApplyForm({
  job,
  customer,
  provider,
  onBack,
  onSubmit,
  submitting,
}) {
  const [coverNote, setCoverNote] = useState("");
  const [quote, setQuote] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");

  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("");

  const [noteError, setNoteError] = useState(false);

  const noteRef = useRef(null);

  const badge = getStatusBadge(job.status);

  const customerName =
    customer?.fullName ||
    customer?.name ||
    job.customerName ||
    "Customer";

  function handleFiles(event) {
    setPhotoError("");

    const selected = Array.from(event.target.files || []).slice(0, 6);

    const withUrls = selected.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPhotos(withUrls);
  }

  function removePhoto(index) {
    setPhotos((current) => {
      const removed = current[index];

      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }

      return current.filter((_, i) => i !== index);
    });
  }

  function handleSubmit() {
    if (!coverNote.trim()) {
      setNoteError(true);
      noteRef.current?.focus();
      return;
    }

    onSubmit({
      coverNote: coverNote.trim(),
      quote: quote.trim(),
      date,
      timeSlot,
      photos,
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-10">

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 mb-5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>

        Back to jobs
      </button>

      {/* ─────────────────────────────────────── */}
      {/* Job Details */}
      {/* ─────────────────────────────────────── */}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">

        {/* Job image */}
        <div className="w-full h-40 bg-gray-100 relative overflow-hidden">

          {job.imageUrl ? (
            <img
              src={job.imageUrl}
              alt={job.title || "Job"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg
                className="w-14 h-14 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 7h4l2-2h6l2 2h4v12H3V7z"
                />

                <circle
                  cx="12"
                  cy="13"
                  r="3"
                  strokeWidth={1.5}
                />
              </svg>
            </div>
          )}

          <span
            className="absolute top-2.5 left-2.5 text-white text-[11px] px-2 py-0.5 rounded"
            style={{
              background: "rgba(0,0,0,0.52)",
            }}
          >
            Customer request
          </span>
        </div>

        {/* Details */}
        <div className="p-4">

          <div className="flex items-center gap-2 flex-wrap mb-2">

            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}
            >
              {badge.label}
            </span>

            <span className="text-xs text-gray-400">
              Posted {formatRelativeDate(job.createdAt)}
            </span>
          </div>

          <h2 className="text-base font-medium text-gray-900 mb-1.5">
            {job.title || "Untitled request"}
          </h2>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">

            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            {job.address ||
              job.location ||
              "Location not specified"}
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-4">
            {job.description ||
              "The customer has not provided a detailed description."}
          </p>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-2">

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                Budget
              </div>

              <div className="text-sm font-medium text-emerald-700">
                {formatBudget(
                  job.budgetMin,
                  job.budgetMax,
                  job.budget
                )}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                Job type
              </div>

              <div className="text-sm font-medium text-gray-900">
                {job.type ||
                  job.service ||
                  job.categoryName ||
                  job.category ||
                  "General service"}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                Duration
              </div>

              <div className="text-sm font-medium text-gray-900">
                {job.duration || "To be discussed"}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                Applications
              </div>

              <div className="text-sm font-medium text-gray-900">
                {Number(job.applicantsCount) ||
                  job.applicants?.length ||
                  0}{" "}
                so far
              </div>
            </div>

          </div>
        </div>

        {/* Customer */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-t border-gray-100">

          {customer?.photoURL ||
          customer?.avatarUrl ||
          customer?.photoUrl ? (
            <img
              src={
                customer.photoURL ||
                customer.avatarUrl ||
                customer.photoUrl
              }
              alt={customerName}
              className="w-9 h-9 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
              style={{
                background: "#d1fae5",
                color: "#065f46",
              }}
            >
              {getInitials(customerName)}
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-900">
              {customerName}
            </div>

            <div className="text-[11px] text-gray-400">
              Customer
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* Match */}
      {/* ─────────────────────────────────────── */}

      {job.match !== undefined && (
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">

          <div className="w-14 h-14 flex-shrink-0 rounded-full bg-white border-2 border-emerald-400 flex flex-col items-center justify-center">

            <span className="text-lg font-semibold text-emerald-700 leading-none">
              {Number(job.match) || 0}%
            </span>

            <span className="text-[9px] text-emerald-600 mt-0.5">
              match
            </span>

          </div>

          <p className="text-sm text-emerald-800 leading-relaxed">
            <strong className="font-medium">
              {Number(job.match) >= 90
                ? "Excellent fit."
                : Number(job.match) >= 75
                ? "Good fit."
                : "Potential fit."}
            </strong>{" "}

            {job.matchTip ||
              "Your skills may be a good match for this customer request."}
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* Application */}
      {/* ─────────────────────────────────────── */}

      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Your application
      </h3>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 space-y-4">

        {/* Cover note */}
        <div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Cover note{" "}
            <span className="text-gray-400 font-normal">
              (required)
            </span>
          </label>

          <textarea
            ref={noteRef}
            rows={4}
            value={coverNote}
            onChange={(event) => {
              setCoverNote(event.target.value);
              setNoteError(false);
            }}
            placeholder="Introduce yourself and explain why you're the right person for this job..."
            disabled={submitting}
            className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none ${
              noteError
                ? "border-red-400"
                : "border-gray-200"
            }`}
          />

          {noteError && (
            <p className="text-xs text-red-500 mt-1">
              A cover note is required.
            </p>
          )}

          {!noteError && (
            <p className="text-xs text-gray-400 mt-1">
              Explain your relevant experience and how you would approach the job.
            </p>
          )}
        </div>

        {/* Quote */}
        <div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Your quote (₦)
          </label>

          <input
            type="number"
            min={0}
            value={quote}
            onChange={(event) =>
              setQuote(event.target.value)
            }
            placeholder="e.g. 55000"
            disabled={submitting}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

          <p className="text-xs text-gray-400 mt-1">
            Customer budget:{" "}
            {formatBudget(
              job.budgetMin,
              job.budgetMax,
              job.budget
            )}
          </p>
        </div>

        {/* Date */}
        <div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Earliest available date
          </label>

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            disabled={submitting}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />

        </div>

        {/* Time */}
        <div>

          <label className="block text-xs font-medium text-gray-700 mb-1.5">
            Preferred time of day
          </label>

          <select
            value={timeSlot}
            onChange={(event) =>
              setTimeSlot(event.target.value)
            }
            disabled={submitting}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition bg-white"
          >
            <option value="">
              Select a time
            </option>

            <option>
              Morning (7am–12pm)
            </option>

            <option>
              Afternoon (12pm–5pm)
            </option>

            <option>
              Either works
            </option>
          </select>

        </div>

      </div>

      {/* ─────────────────────────────────────── */}
      {/* Photos */}
      {/* ─────────────────────────────────────── */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">

        <div className="text-sm font-medium text-gray-900 mb-0.5">
          Relevant work photos{" "}
          <span className="text-xs text-gray-400 font-normal">
            (optional)
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-3">
          Upload up to 6 photos showing similar work you have completed.
        </p>

        <label className="flex flex-col items-center justify-center border-dashed border-2 border-gray-200 rounded-xl h-32 cursor-pointer hover:border-emerald-400 transition-colors relative">

          <svg
            className="w-7 h-7 text-gray-300 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <span className="text-xs text-gray-400">
            Click to select photos (up to 6)
          </span>

          <input
            type="file"
            multiple
            accept="image/*"
            disabled={submitting}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFiles}
          />

        </label>

        {photoError && (
          <p className="text-xs text-red-500 mt-2">
            {photoError}
          </p>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">

            {photos.map((photo, index) => (
              <div
                key={`${photo.file.name}-${index}`}
                className="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
              >

                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={submitting}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs"
                >
                  ×
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-400 text-white font-medium text-sm py-3.5 rounded-xl transition-colors"
      >
        {submitting
          ? "Sending application..."
          : "Submit application"}
      </button>

      <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
        Your application will be sent directly to{" "}
        <span className="font-medium text-gray-500">
          {customerName}
        </span>
        .
      </p>

    </div>
  );
}

// ─────────────────────────────────────────────
// Sending Screen
// ─────────────────────────────────────────────

function SendingScreen({ customerName }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">

      <div className="w-16 h-16 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin mb-6" />

      <p className="text-sm font-medium text-gray-900 mb-1">
        Sending your application...
      </p>

      <p className="text-xs text-gray-400">
        Sending directly to {customerName || "the customer"}
      </p>

    </div>
  );
}

// ─────────────────────────────────────────────
// Success Screen
// ─────────────────────────────────────────────

function SuccessScreen({
  job,
  customer,
  application,
  onViewStatus,
  onBackToFeed,
}) {
  const customerName =
    customer?.fullName ||
    customer?.name ||
    job.customerName ||
    "Customer";

  return (
    <div className="max-w-lg mx-auto px-4 py-10 text-center">

      <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-5">

        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>

      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Application sent!
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed mb-6">
        Your application has been sent directly to{" "}
        <strong className="font-medium text-gray-700">
          {customerName}
        </strong>
        . They can now review your application and respond.
      </p>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-xl text-left mb-6 overflow-hidden">

        <div className="px-4 py-3 border-b border-gray-100">

          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">
            Job
          </div>

          <div className="text-sm font-medium text-gray-900">
            {job.title}
          </div>

          <div className="text-xs text-gray-400 mt-0.5">
            {job.address ||
              job.location ||
              "Location not specified"}
          </div>

        </div>

        {[
          {
            label: "Customer",
            value: customerName,
          },
          {
            label: "Your quote",
            value: application.quote
              ? `₦${Number(
                  application.quote
                ).toLocaleString("en-NG")}`
              : "To be negotiated",
          },
          {
            label: "Available from",
            value: application.date
              ? formatDate(application.date)
              : "Flexible",
          },
          {
            label: "Preferred time",
            value:
              application.timeSlot ||
              "Flexible",
          },
          {
            label: "Work photos",
            value: application.photos?.length
              ? `${application.photos.length} attached`
              : "None attached",
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 last:border-b-0"
          >
            <span className="text-xs text-gray-400">
              {row.label}
            </span>

            <span className="text-xs font-medium text-gray-900 text-right ml-4">
              {row.value}
            </span>
          </div>
        ))}

      </div>

      {/* What next */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-left">

        <div className="text-xs font-medium text-gray-700 mb-3">
          What happens next
        </div>

        {[
          {
            step: "1",
            title: "Customer reviews your application",
            sub: "They can see your cover note, quote and work photos.",
          },
          {
            step: "2",
            title: "Customer responds",
            sub: "You'll see the application status change when they respond.",
          },
          {
            step: "3",
            title: "Confirm the job",
            sub: "Agree on the date, time, price and access details.",
          },
          {
            step: "4",
            title: "Complete the job",
            sub: "Finish the work and follow the agreed payment process.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="flex gap-3 mb-3 last:mb-0"
          >

            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[10px] font-semibold text-emerald-700 flex-shrink-0 mt-0.5">
              {item.step}
            </div>

            <div>
              <div className="text-xs font-medium text-gray-900">
                {item.title}
              </div>

              <div className="text-xs text-gray-400 mt-0.5">
                {item.sub}
              </div>
            </div>

          </div>
        ))}

      </div>

      <button
        type="button"
        onClick={onViewStatus}
        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm py-3.5 rounded-xl transition-colors mb-3"
      >
        Track this application
      </button>

      <button
        type="button"
        onClick={onBackToFeed}
        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm py-3.5 rounded-xl border border-gray-200 transition-colors"
      >
        Back to job feed
      </button>

    </div>
  );
}

// ─────────────────────────────────────────────
// Tracker
// ─────────────────────────────────────────────

function ApplicationTracker({
  job,
  customer,
  application,
  onBackToFeed,
}) {
  const [activeTab, setActiveTab] = useState("status");

  const customerName =
    customer?.fullName ||
    customer?.name ||
    job.customerName ||
    "Customer";

  const status = application?.status || "pending";

  const statusInfo = {
    pending: {
      title: "Waiting for response",
      text: `${customerName} has been notified and can now review your application.`,
    },

    viewed: {
      title: "Application viewed",
      text: `${customerName} has viewed your application.`,
    },

    accepted: {
      title: "Application accepted",
      text: `${customerName} accepted your application.`,
    },

    rejected: {
      title: "Application declined",
      text: `${customerName} did not accept this application.`,
    },

    withdrawn: {
      title: "Application withdrawn",
      text: "You withdrew this application.",
    },
  };

  const currentStatus =
    statusInfo[status] || statusInfo.pending;

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 pb-10">

      <button
        type="button"
        onClick={onBackToFeed}
        className="flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 mb-5"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>

        Back to job feed
      </button>

      {/* Job */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">

        <div className="flex items-start gap-3">

          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">

            <svg
              className="w-6 h-6 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 7h4l2-2h6l2 2h4v12H3V7z"
              />

              <circle
                cx="12"
                cy="13"
                r="3"
                strokeWidth={1.5}
              />
            </svg>

          </div>

          <div className="flex-1 min-w-0">

            <div className="text-sm font-medium text-gray-900 mb-0.5">
              {job.title}
            </div>

            <div className="text-xs text-gray-400">
              {job.address ||
                job.location ||
                "Location not specified"}
            </div>

          </div>

          <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium px-2.5 py-1 rounded-full flex-shrink-0">
            Applied
          </span>

        </div>

      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">

        {[
          {
            key: "status",
            label: "Status",
          },
          {
            key: "details",
            label: "Your application",
          },
          {
            key: "messages",
            label: "Messages",
          },
        ].map((tab) => (
          <button
            type="button"
            key={tab.key}
            onClick={() =>
              setActiveTab(tab.key)
            }
            className={`px-4 py-2.5 text-sm font-medium relative transition-colors ${
              activeTab === tab.key
                ? "text-emerald-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}

            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t" />
            )}
          </button>
        ))}

      </div>

      {/* Status */}
      {activeTab === "status" && (
        <div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">

            <div className="text-sm font-medium text-amber-800">
              {currentStatus.title}
            </div>

            <div className="text-xs text-amber-600 mt-0.5">
              {currentStatus.text}
            </div>

          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">

            <div className="text-xs font-medium text-gray-700 mb-4">
              Application timeline
            </div>

            {[
              {
                title: "Application submitted",
                sub: "Your application was successfully submitted.",
                done: true,
              },
              {
                title: "Customer notified",
                sub: `${customerName} has been notified.`,
                done: true,
              },
              {
                title: "Customer response",
                sub: "Waiting for the customer to respond.",
                done:
                  status === "accepted" ||
                  status === "rejected",
              },
              {
                title: "Job confirmed",
                sub: "Confirm timing, price and access.",
                done: status === "accepted",
              },
              {
                title: "Job completed",
                sub: "Complete the work for the customer.",
                done: false,
              },
            ].map((item, index, array) => (
              <div
                key={item.title}
                className="flex gap-3"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      item.done
                        ? "bg-emerald-600 border-emerald-600"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    {item.done ? (
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-200" />
                    )}
                  </div>

                  {index < array.length - 1 && (
                    <div
                      className={`w-0.5 flex-1 my-1 ${
                        item.done
                          ? "bg-emerald-300"
                          : "bg-gray-100"
                      }`}
                      style={{
                        minHeight: "24px",
                      }}
                    />
                  )}

                </div>

                <div className="pb-4 flex-1">

                  <div
                    className={`text-sm font-medium ${
                      item.done
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </div>

                  <div className="text-xs text-gray-400 mt-0.5">
                    {item.sub}
                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>
      )}

      {/* Details */}
      {activeTab === "details" && (
        <div className="space-y-4">

          <div className="bg-white border border-gray-200 rounded-xl p-4">

            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
              Cover note
            </div>

            <p className="text-sm text-gray-700 leading-relaxed">
              {application.coverNote ||
                "No cover note submitted."}
            </p>

          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

            {[
              {
                label: "Customer",
                value: customerName,
              },
              {
                label: "Your quote",
                value: application.quote
                  ? `₦${Number(
                      application.quote
                    ).toLocaleString("en-NG")}`
                  : "To be negotiated",
              },
              {
                label: "Available from",
                value: application.date
                  ? formatDate(application.date)
                  : "Flexible",
              },
              {
                label: "Preferred time",
                value:
                  application.timeSlot ||
                  "Flexible",
              },
              {
                label: "Submitted",
                value: formatRelativeDate(
                  application.createdAt
                ),
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex justify-between items-center px-4 py-3 border-b border-gray-100 last:border-b-0"
              >
                <span className="text-xs text-gray-400">
                  {row.label}
                </span>

                <span className="text-sm font-medium text-gray-900 text-right ml-4">
                  {row.value}
                </span>
              </div>
            ))}

          </div>

          {application.photos?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-4">

              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
                Work photos
              </div>

              <div className="grid grid-cols-3 gap-2">

                {application.photos.map(
                  (photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {/* Messages */}
      {activeTab === "messages" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

          <div className="px-4 py-3 border-b border-gray-100">

            <div className="text-sm font-medium text-gray-900">
              {customerName}
            </div>

            <div className="text-xs text-gray-400">
              Application conversation
            </div>

          </div>

          <div className="flex flex-col items-center justify-center py-14 px-4 text-center">

            <svg
              className="w-10 h-10 text-gray-200 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            <p className="text-sm font-medium text-gray-500 mb-1">
              No messages yet
            </p>

            <p className="text-xs text-gray-400">
              Messaging will become available when the customer responds.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────
// Main Application Page
// ─────────────────────────────────────────────

export default function ApplicationPage({
  job: jobProp,
  onBack,
  onBackToFeed,
}) {
  const { jobId } = useParams();
  const { user: currentUser, initializing } = useAuth();

  const [job, setJob] = useState(jobProp || null);
  const [customer, setCustomer] = useState(null);
  const [provider, setProvider] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [step, setStep] = useState("form");

  const [applicationData, setApplicationData] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  // ─────────────────────────────────────────
  // Load exact request + customer + provider
  // ─────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function loadApplicationData() {
      if (initializing) return;

      if (!currentUser?.uid) {
        setLoading(false);
        setLoadError(
          "You must be signed in as a provider to apply."
        );
        return;
      }

      const exactJobId = jobId || jobProp?.id;

      if (!exactJobId) {
        setLoading(false);
        setLoadError(
          "No job was selected."
        );
        return;
      }

      setLoading(true);
      setLoadError("");

      try {
        // ─────────────────────────────────────
        // 1. Get exact customer request
        // requests/{jobId}
        // ─────────────────────────────────────

        const requestRef = doc(
          db,
          "requests",
          exactJobId
        );

        const requestSnap =
          await getDoc(requestRef);

        if (!requestSnap.exists()) {
          throw new Error(
            "This customer request no longer exists."
          );
        }

        const requestData = {
          id: requestSnap.id,
          ...requestSnap.data(),
        };

        // Only open/new/urgent requests should accept
        // applications.
        const requestStatus =
          String(
            requestData.status || "open"
          ).toLowerCase();

        if (
          !["open", "new", "urgent"].includes(
            requestStatus
          )
        ) {
          throw new Error(
            "This customer request is no longer accepting applications."
          );
        }

        // ─────────────────────────────────────
        // 2. Get direct customer ID
        // ─────────────────────────────────────

        const customerId =
          requestData.customerId;

        if (!customerId) {
          throw new Error(
            "This request is missing its customer ID. The request cannot receive applications safely."
          );
        }

        // ─────────────────────────────────────
        // 3. Load customer
        // users/{customerId}
        // ─────────────────────────────────────

        const customerRef = doc(
          db,
          "users",
          customerId
        );

        const customerSnap =
          await getDoc(customerRef);

        const customerData =
          customerSnap.exists()
            ? {
                uid: customerSnap.id,
                ...customerSnap.data(),
              }
            : {
                uid: customerId,
                fullName:
                  requestData.customerName ||
                  "Customer",
                email:
                  requestData.customerEmail ||
                  "",
                phone:
                  requestData.customerPhone ||
                  "",
              };

        // ─────────────────────────────────────
        // 4. Load provider
        // providers/{currentUser.uid}
        // ─────────────────────────────────────

        const providerRef = doc(
          db,
          "providers",
          currentUser.uid
        );

        const providerSnap =
          await getDoc(providerRef);

        const providerData =
          providerSnap.exists()
            ? {
                uid: providerSnap.id,
                ...providerSnap.data(),
              }
            : {
                uid: currentUser.uid,
                fullName:
                  currentUser.fullName ||
                  currentUser.displayName ||
                  "Provider",
                email:
                  currentUser.email || "",
              };

        // ─────────────────────────────────────
        // 5. Check whether this provider already
        // applied to this exact request
        // ─────────────────────────────────────

        const applicationsQuery =
          query(
            collection(db, "applications"),
            where(
              "providerId",
              "==",
              currentUser.uid
            )
          );

        const applicationsSnap =
          await getDocs(
            applicationsQuery
          );

        const alreadyApplied =
          applicationsSnap.docs.some(
            (applicationDoc) => {
              const data =
                applicationDoc.data();

              return (
                data.jobId === exactJobId ||
                data.requestId === exactJobId
              );
            }
          );

        if (alreadyApplied) {
          throw new Error(
            "You have already applied for this job."
          );
        }

        if (!cancelled) {
          setJob(requestData);
          setCustomer(customerData);
          setProvider(providerData);
        }
      } catch (error) {
        console.error(
          "Failed to load application page:",
          error
        );

        if (!cancelled) {
          setLoadError(
            error.message ||
              "We couldn't load this customer request."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadApplicationData();

    return () => {
      cancelled = true;
    };
  }, [
    jobId,
    jobProp?.id,
    currentUser?.uid,
    initializing,
  ]);

  // ─────────────────────────────────────────
  // Submit Application
  // ─────────────────────────────────────────

  async function handleSubmit(data) {
    if (!currentUser?.uid) {
      setLoadError(
        "Your provider session has expired. Please sign in again."
      );
      return;
    }

    if (!job?.id) {
      setLoadError(
        "The selected job could not be found."
      );
      return;
    }

    if (!job.customerId) {
      setLoadError(
        "This job has no customer assigned to it."
      );
      return;
    }

    setSubmitting(true);
    setLoadError("");
    setStep("sending");

    try {
      // ─────────────────────────────────────
      // Upload photos first
      // ─────────────────────────────────────

      const uploadedPhotos = [];

      for (const photo of data.photos || []) {
        const uploaded =
          await uploadToCloudinary(
            photo.file
          );

        uploadedPhotos.push({
          url: uploaded.url,
          publicId: uploaded.publicId,
          fileName: photo.file.name,
        });
      }

      // ─────────────────────────────────────
      // Build application
      // ─────────────────────────────────────

      const customerName =
        customer?.fullName ||
        customer?.name ||
        job.customerName ||
        "Customer";

      const providerName =
        provider?.fullName ||
        provider?.name ||
        currentUser.displayName ||
        "Provider";

      const application = {
        // Core relationships
        jobId: job.id,
        requestId: job.id,

        providerId: currentUser.uid,
        customerId: job.customerId,

        // Provider snapshot
        providerName,
        providerEmail:
          provider?.email ||
          currentUser.email ||
          "",
        providerPhone:
          provider?.phone ||
          "",

        providerProfession:
          provider?.professionName ||
          provider?.trade ||
          provider?.service ||
          "",

        providerLocation:
          provider?.location ||
          "",

        providerImageUrl:
          provider?.profileImageUrl ||
          provider?.imageUrl ||
          "",

        // Customer snapshot
        customerName,
        customerEmail:
          customer?.email ||
          job.customerEmail ||
          "",

        customerPhone:
          customer?.phone ||
          job.customerPhone ||
          "",

        customerAddress:
          customer?.address ||
          job.customerAddress ||
          job.address ||
          "",

        // Job snapshot
        jobTitle:
          job.title ||
          "Untitled request",

        jobAddress:
          job.address ||
          job.location ||
          "",

        jobDescription:
          job.description ||
          "",

        jobBudget:
          job.budget ||
          formatBudget(
            job.budgetMin,
            job.budgetMax
          ),

        jobBudgetMin:
          Number(job.budgetMin || 0),

        jobBudgetMax:
          Number(job.budgetMax || 0),

        jobType:
          job.type ||
          job.service ||
          job.categoryName ||
          job.category ||
          "",

        // Application information
        coverNote: data.coverNote,

        quote: data.quote
          ? Number(data.quote)
          : null,

        availableDate:
          data.date || "",

        date:
          data.date || "",

        timeSlot:
          data.timeSlot || "",

        photos: uploadedPhotos,

        // Application state
        status: "pending",

        customerNotified: true,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      };

      // ─────────────────────────────────────
      // Create application
      // ─────────────────────────────────────

      const applicationRef =
        await addDoc(
          collection(db, "applications"),
          application
        );

      // ─────────────────────────────────────
      // Update request
      //
      // Customer requests already contain:
      // applicants: []
      // applicantsCount: 0
      // ─────────────────────────────────────

      await updateDoc(
        doc(db, "requests", job.id),
        {
          applicants: arrayUnion({
            applicationId:
              applicationRef.id,

            providerId:
              currentUser.uid,

            providerName,

            providerProfession:
              provider?.professionName ||
              provider?.trade ||
              "",

            status: "pending",

            quote: data.quote
              ? Number(data.quote)
              : null,

            createdAt:
              new Date().toISOString(),
          }),

          applicantsCount:
            Number(
              job.applicantsCount || 0
            ) + 1,

          updatedAt:
            serverTimestamp(),
        }
      );

      // ─────────────────────────────────────
      // Create customer notification
      //
      // users/{customerId}/notifications
      // ─────────────────────────────────────

      await addDoc(
        collection(
          db,
          "users",
          job.customerId,
          "notifications"
        ),
        {
          type: "new_application",

          applicationId:
            applicationRef.id,

          jobId: job.id,

          customerId:
            job.customerId,

          providerId:
            currentUser.uid,

          providerName,

          providerProfession:
            provider?.professionName ||
            provider?.trade ||
            "",

          jobTitle:
            job.title ||
            "New job application",

          message:
            `${providerName} applied for your job.`,

          read: false,

          createdAt:
            serverTimestamp(),
        }
      );

      // ─────────────────────────────────────
      // Store locally for success/tracking UI
      // ─────────────────────────────────────

      const localApplication = {
        ...application,

        id: applicationRef.id,

        createdAt: new Date(),
      };

      setApplicationData(
        localApplication
      );

      setStep("success");
    } catch (error) {
      console.error(
        "Failed to submit application:",
        error
      );

      setLoadError(
        error.message ||
          "We couldn't submit your application. Please try again."
      );

      setStep("form");
    } finally {
      setSubmitting(false);
    }
  }

  // ─────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }

    navigate(-1);
  }

  function goBackToFeed() {
    if (onBackToFeed) {
      onBackToFeed();
      return;
    }

    navigate("/provider/dashboard");
  }

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────

  if (
    initializing ||
    loading
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">

        <div className="text-center">

          <div className="mx-auto w-10 h-10 rounded-full border-2 border-emerald-200 border-t-emerald-600 animate-spin" />

          <p className="text-sm text-gray-500 mt-4">
            Loading customer request...
          </p>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────

  if (loadError && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">

        <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl p-6 text-center">

          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            !
          </div>

          <h1 className="text-base font-semibold text-gray-900">
            Unable to load job
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            {loadError}
          </p>

          <button
            type="button"
            onClick={goBackToFeed}
            className="mt-5 w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium py-3 rounded-xl"
          >
            Back to jobs
          </button>

        </div>

      </div>
    );
  }

  // ─────────────────────────────────────────
  // Main
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-5 h-14 flex items-center sticky top-0 z-20">

        <button
          type="button"
          onClick={goBackToFeed}
          className="text-base font-medium tracking-tight text-gray-900"
        >
          Sure<span className="text-emerald-600">
            Pro
          </span>
        </button>

        {step === "form" && (
          <span className="ml-3 text-xs text-gray-400">
            · Apply for job
          </span>
        )}

        {(step === "success" ||
          step === "tracking") && (
          <span className="ml-3 text-xs text-gray-400">
            · Application status
          </span>
        )}

      </header>

      {/* Error while form is open */}
      {loadError && job && (
        <div className="max-w-2xl mx-auto px-4 pt-4">

          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {loadError}
          </div>

        </div>
      )}

      {step === "form" && job && (
        <ApplyForm
          job={job}
          customer={customer}
          provider={provider}
          onSubmit={handleSubmit}
          onBack={goBack}
          submitting={submitting}
        />
      )}

      {step === "sending" && (
        <SendingScreen
          customerName={
            customer?.fullName ||
            customer?.name ||
            job?.customerName ||
            "Customer"
          }
        />
      )}

      {step === "success" && (
        <SuccessScreen
          job={job}
          customer={customer}
          application={applicationData}
          onViewStatus={() =>
            setStep("tracking")
          }
          onBackToFeed={
            goBackToFeed
          }
        />
      )}

      {step === "tracking" && (
        <ApplicationTracker
          job={job}
          customer={customer}
          application={applicationData}
          onBackToFeed={
            goBackToFeed
          }
        />
      )}

    </div>
  );
}