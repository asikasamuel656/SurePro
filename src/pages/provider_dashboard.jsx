import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "LP"
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "";

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

function formatBudget(min, max) {
  if (!min && !max) return "Budget not specified";

  const format = (value) =>
    `₦${Number(value || 0).toLocaleString("en-NG")}`;

  if (min && max) {
    return `${format(min)}–${format(max)}`;
  }

  return format(min || max);
}

function Stars({ count = 0, size = "text-sm" }) {
  const rounded = Math.round(Number(count) || 0);

  return (
    <span className={`${size} text-emerald-500`}>
      {"★".repeat(Math.min(rounded, 5))}
      {"☆".repeat(Math.max(0, 5 - rounded))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────

const STATUS_BADGE = {
  new: {
    label: "New",
    className:
      "bg-emerald-50 text-emerald-800 border border-emerald-200",
  },

  urgent: {
    label: "Urgent",
    className:
      "bg-red-50 text-red-800 border border-red-200",
  },

  open: {
    label: "Open",
    className:
      "bg-blue-50 text-blue-800 border border-blue-200",
  },

  applied: {
    label: "Applied",
    className:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
};

const FILTERS = [
  "All jobs",
  "New today",
  "Urgent",
  "High budget",
  "Nearby",
];

// ─────────────────────────────────────────────────────────────
// Toggle
// ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? "bg-emerald-500" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
          transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Job Card
// ─────────────────────────────────────────────────────────────

function JobCard({
  job,
  isApplied,
  onApply,
  onViewDetail,
}) {
  const status =
    job.status || "open";

  const badge =
    isApplied
      ? STATUS_BADGE.applied
      : STATUS_BADGE[status] ||
        STATUS_BADGE.open;

  const jobAddress =
    job.address ||
    job.location ||
    job.jobAddress ||
    "Location not provided";

  const imageUrl =
    job.imageUrl ||
    job.photoUrl ||
    job.requestImageUrl ||
    job.coverImageUrl ||
    "";

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden mb-3
        transition-colors hover:border-emerald-300
        cursor-pointer
        ${
          isApplied
            ? "border-emerald-200"
            : "border-gray-200"
        }`}
      onClick={() =>
        onViewDetail(job)
      }
    >

      <div className="flex">

        {/* Request image */}
        <div className="w-28 flex-shrink-0 bg-gray-100 relative overflow-hidden">

          {imageUrl ? (
            <img
              src={imageUrl}
              alt={
                job.title ||
                "Customer request"
              }
              className="w-full h-full min-h-[150px] object-cover"
            />
          ) : (
            <div
              className="w-full h-full min-h-[150px]
              flex items-center justify-center
              bg-emerald-50"
            >
              <svg
                width="64"
                height="64"
                viewBox="0 0 64 64"
                fill="none"
              >
                <rect
                  x="8"
                  y="18"
                  width="48"
                  height="38"
                  rx="4"
                  fill="#d1fae5"
                />

                <path
                  d="M16 18V12C16 9.8 17.8 8 20 8H44C46.2 8 48 9.8 48 12V18"
                  stroke="#059669"
                  strokeWidth="2"
                />

                <path
                  d="M25 31H39M25 39H35"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          <span
            className="absolute bottom-1.5 left-1.5
            text-white text-[10px]
            px-1.5 py-0.5 rounded
            bg-black/55"
          >
            {imageUrl
              ? "Request photo"
              : "No photo"}
          </span>
        </div>

        {/* Request information */}
        <div className="flex-1 p-3 min-w-0">

          {/* Status + date */}
          <div className="flex items-center gap-2 flex-wrap mb-1">

            <span
              className={`text-[11px]
              font-medium px-2 py-0.5
              rounded-full
              ${badge.className}`}
            >
              {isApplied
                ? "✓ Applied"
                : badge.label}
            </span>

            <span className="text-[11px] text-gray-400">
              {formatDate(
                job.createdAt
              )}
            </span>

          </div>

          {/* Request title */}
          <div
            className="text-sm font-semibold
            text-gray-900 mb-1
            leading-snug"
          >
            {job.title ||
              "Untitled request"}
          </div>

          {/* Location */}
          <div
            className="text-xs text-gray-500
            mb-2 flex items-center gap-1"
          >

            <svg
              className="w-3 h-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>

            <span className="truncate">
              {jobAddress}
            </span>

          </div>

          {/* DESCRIPTION */}
          <p
            className="text-xs text-gray-500
            line-clamp-3 mb-2
            leading-relaxed"
          >
            {job.description ||
              "No description was added to this request."}
          </p>

          {/* Bottom information */}
          <div
            className="flex items-center
            justify-between flex-wrap
            gap-2"
          >

            {/* Customer */}
            <div
              className="flex items-center
              gap-1.5 min-w-0"
            >

              <div
                className="w-6 h-6 rounded-full
                flex items-center justify-center
                text-[9px] font-medium
                flex-shrink-0"
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                }}
              >
                {getInitials(
                  job.customerName ||
                    job.customer?.name ||
                    "Customer"
                )}
              </div>

              <span
                className="text-xs text-gray-500
                truncate"
              >
                {job.customerName ||
                  job.customer?.name ||
                  "Customer"}
              </span>

            </div>

            {/* Budget */}
            <div className="flex items-center gap-2">

              <span
                className="text-xs font-medium
                text-emerald-700"
              >
                {formatBudget(
                  job.budgetMin,
                  job.budgetMax
                )}
              </span>

              {isApplied ? (
                <span
                  className="text-xs px-3 py-1.5
                  rounded-full
                  bg-emerald-50
                  border border-emerald-200
                  text-emerald-700
                  font-medium"
                >
                  ✓ Applied
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApply(job);
                  }}
                  className="text-xs px-3 py-1.5
                  rounded-full
                  bg-emerald-700
                  hover:bg-emerald-800
                  text-white font-medium
                  transition-colors"
                >
                  Apply
                </button>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* Applied notice */}
      {isApplied && (
        <div
          className="mx-3 mb-3 flex items-center
          gap-2 text-xs text-emerald-800
          bg-emerald-50 border
          border-emerald-200 rounded-lg
          px-3 py-2"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>

          Your application was sent
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Profile Tab
// ─────────────────────────────────────────────────────────────

function MainTab({
  profile,
  available,
  applicationsCount,
}) {
  const stats = [
    {
      num: profile.jobsDone ?? 0,
      lbl: "Jobs done",
    },
    {
      num: profile.rating
        ? Number(profile.rating).toFixed(1)
        : "—",
      lbl: "Rating",
    },
    {
      num: profile.years
        ? `${profile.years}yr`
        : "—",
      lbl: "On SurePro",
    },
  ];

  return (
    <div className="flex flex-col">

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-gray-100">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`py-2.5 text-center ${
              i < 2
                ? "border-r border-gray-100"
                : ""
            }`}
          >
            <div className="text-sm font-medium text-emerald-700">
              {s.num}
            </div>

            <div className="text-[9px] text-gray-400 mt-0.5">
              {s.lbl}
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="px-4 py-3 border-b border-gray-100">

        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mb-2">
          Status
        </div>

        <span
          className={`inline-flex items-center gap-1.5
          text-[10px] font-medium px-2.5 py-1 rounded-full
          ${
            available
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-gray-100 border border-gray-200 text-gray-500"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              available
                ? "bg-emerald-500"
                : "bg-gray-400"
            }`}
          />

          {available
            ? "Online — accepting jobs"
            : "Offline — not taking jobs"}
        </span>
      </div>

      {/* Applications */}
      <div className="px-4 py-3 border-b border-gray-100">

        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mb-2">
          Active applications
        </div>

        <div
          className="flex items-center justify-between
          bg-emerald-50 border border-emerald-200
          rounded-lg px-3 py-2"
        >
          <div>
            <div className="text-base font-medium text-emerald-700">
              {applicationsCount}
            </div>

            <div className="text-[9px] text-emerald-600 mt-0.5">
              Pending / active
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-4 py-3 border-b border-gray-100">

        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mb-2">
          Contact
        </div>

        {[
          {
            icon: "phone",
            text: profile.phone,
          },
          {
            icon: "mail",
            text: profile.email,
          },
          {
            icon: "pin",
            text: profile.location,
          },
        ]
          .filter((item) => item.text)
          .map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-gray-500 mb-1.5 last:mb-0"
            >
              <svg
                className="w-3.5 h-3.5 text-gray-300 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {r.icon === "phone" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                )}

                {r.icon === "mail" && (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                )}

                {r.icon === "pin" && (
                  <>
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
                  </>
                )}
              </svg>

              <span className="truncate">
                {r.text}
              </span>
            </div>
          ))}
      </div>

      {/* Skills */}
      <div className="px-4 py-3 border-b border-gray-100">

        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mb-2">
          Skills
        </div>

        {profile.skills?.length ? (
          <div className="flex flex-wrap gap-1">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="text-[10px] px-2 py-1
                bg-emerald-50 border border-emerald-200
                text-emerald-800 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">
            No skills added yet.
          </p>
        )}
      </div>

      {/* Documents */}
      <div className="px-4 py-3">

        <div className="text-[9px] font-medium text-gray-400 uppercase tracking-wide mb-2">
          Documents
        </div>

        {profile.documents?.length ? (
          profile.documents.map((document, i) => (
            <div
              key={i}
              className="flex items-center gap-2
              text-xs text-gray-500 mb-1.5 last:mb-0"
            >
              <svg
                className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>

              {document.name || document}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400">
            No documents uploaded.
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reviews
// ─────────────────────────────────────────────────────────────

function ReviewsTab({ reviews, profile }) {
  const rating = Number(profile.rating) || 0;

  return (
    <div className="flex flex-col">

      {/* Rating */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-4">

        <div className="text-center">

          <div className="text-3xl font-semibold text-emerald-700 leading-none">
            {rating ? rating.toFixed(1) : "—"}
          </div>

          <Stars
            count={Math.round(rating)}
            size="text-sm"
          />

          <div className="text-[10px] text-gray-400 mt-0.5">
            {reviews.length} reviews
          </div>
        </div>

        <div className="flex-1">
          {[
            5,
            4,
            3,
            2,
            1,
          ].map((star) => {
            const count = reviews.filter(
              (review) =>
                Number(review.stars) === star
            ).length;

            const percentage =
              reviews.length
                ? (count / reviews.length) * 100
                : 0;

            return (
              <div
                key={star}
                className="flex items-center gap-1.5 mb-1 last:mb-0"
              >
                <span className="text-[9px] text-gray-400 w-2 text-right">
                  {star}
                </span>

                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <div className="text-sm text-gray-400">
            No reviews yet.
          </div>

          <p className="text-xs text-gray-300 mt-1">
            Reviews from completed jobs will appear here.
          </p>
        </div>
      ) : (
        reviews.map((review) => (
          <div
            key={review.id}
            className="px-4 py-3 border-b border-gray-100"
          >
            <div className="flex items-center gap-2 mb-1.5">

              <div
                className="w-6 h-6 rounded-full flex items-center
                justify-center text-[9px] font-medium flex-shrink-0"
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                }}
              >
                {getInitials(review.customerName)}
              </div>

              <div>
                <div className="text-[11px] font-medium text-gray-900">
                  {review.customerName || "Customer"}
                </div>

                <div className="text-[9px] text-gray-400">
                  {formatDate(review.createdAt)}
                </div>
              </div>
            </div>

            <Stars
              count={Number(review.stars) || 0}
              size="text-xs"
            />

            <p className="text-[11px] text-gray-500 leading-relaxed mt-1 mb-1.5">
              {review.text || "No review text."}
            </p>

            {review.jobTitle && (
              <span
                className="inline-flex items-center gap-1
                text-[9px] text-gray-400 border border-gray-200
                rounded-full px-2 py-0.5"
              >
                🔧 {review.jobTitle}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Profile Sidebar
// ─────────────────────────────────────────────────────────────

function ProfileSidebar({
  profile,
  available,
  availabilitySaving,
  onAvailabilityChange,
  applicationsCount,
  reviews,
  onClose,
}) {
  const [activeTab, setActiveTab] =
    useState("main");

  return (
    <div
      className="hidden w-72 flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white md:flex"
    >
      {/* Header */}
      <div
        style={{
          background: "#065f46",
        }}
        className="px-5 pt-5"
      >
        <div className="mb-3 flex items-start justify-between">

          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.name || "Provider"}
              className="w-14 h-14 rounded-full object-cover
              border-2 border-emerald-400"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full border-2
              border-emerald-400 bg-emerald-100
              flex items-center justify-center
              text-lg font-medium text-emerald-800"
            >
              {getInitials(profile.name)}
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center
            justify-center text-white text-sm mt-0.5"
            style={{
              background:
                "rgba(255,255,255,0.15)",
            }}
          >
            ✕
          </button>
        </div>

        <div className="truncate text-sm font-semibold text-white">
          {profile.name || "Provider"}
        </div>

        <div
          className="mt-0.5 text-xs"
          style={{
            color: "#a7f3d0",
          }}
        >
          {profile.trade || "Service Provider"}
          {profile.location
            ? ` · ${profile.location}`
            : ""}
        </div>

        {/* Tabs */}
        <div
          className="mb-0 mt-1 flex border-t"
          style={{
            borderColor:
              "rgba(255,255,255,0.1)",
          }}
        >
          {["main", "reviews"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() =>
                setActiveTab(tab)
              }
              className={`flex-1 py-2.5 text-[11px]
              font-medium capitalize relative
              ${
                activeTab === tab
                  ? "text-white"
                  : "text-white/40"
              }`}
            >
              {tab.charAt(0).toUpperCase() +
                tab.slice(1)}

              {activeTab === tab && (
                <span
                  className="absolute bottom-0
                  left-1/4 right-1/4 h-0.5
                  rounded-t bg-emerald-400"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div
        className="flex items-center justify-between
        px-4 py-2.5 border-b border-gray-100"
      >
        <div>
          <div className="text-xs font-medium text-gray-900">
            {available
              ? "Available for jobs"
              : "Not available"}
          </div>

          <div className="text-[10px] text-gray-400 mt-0.5">
            {available
              ? "You appear in job matches"
              : "Hidden from new job matches"}
          </div>
        </div>

        <Toggle
          checked={available}
          disabled={availabilitySaving}
          onChange={onAvailabilityChange}
        />
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === "main" ? (
          <MainTab
            profile={profile}
            available={available}
            applicationsCount={
              applicationsCount
            }
          />
        ) : (
          <ReviewsTab
            reviews={reviews}
            profile={profile}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Provider Dashboard
// ─────────────────────────────────────────────────────────────

export default function ProviderDashboard({
  onApplyJob,
  appliedJobIds = [],
}) {
  const { user } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [jobs, setJobs] =
    useState([]);

  const [applications, setApplications] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [available, setAvailable] =
    useState(false);

  const [availabilitySaving, setAvailabilitySaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [activeFilter, setActiveFilter] =
    useState("All jobs");

  // ─────────────────────────────────────────
  // Load provider data
  // ─────────────────────────────────────────

  useEffect(() => {
  if (!user?.uid) return;

  let cancelled = false;
  let unsubscribeRequests = null;

  async function loadProviderData() {
    try {
      setLoading(true);
      setError("");

      // ─────────────────────────────────────
      // Provider profile
      // providers/{uid}
      // ─────────────────────────────────────

      const providerRef = doc(
        db,
        "providers",
        user.uid
      );

      const providerSnap =
        await getDoc(providerRef);

      let providerData = {};

      if (providerSnap.exists()) {
        providerData = providerSnap.data();
      }

      // ─────────────────────────────────────
      // Provider applications
      // applications where providerId = uid
      // ─────────────────────────────────────

      const applicationsQuery = query(
        collection(db, "applications"),
        where(
          "providerId",
          "==",
          user.uid
        )
      );

      const applicationsSnap =
        await getDocs(applicationsQuery);

      const loadedApplications =
        applicationsSnap.docs.map(
          (applicationDoc) => ({
            id: applicationDoc.id,
            ...applicationDoc.data(),
          })
        );

      // ─────────────────────────────────────
      // Reviews
      // reviews where providerId = uid
      // ─────────────────────────────────────

      const reviewsQuery = query(
        collection(db, "reviews"),
        where(
          "providerId",
          "==",
          user.uid
        )
      );

      const reviewsSnap =
        await getDocs(reviewsQuery);

      const loadedReviews =
        reviewsSnap.docs.map(
          (reviewDoc) => ({
            id: reviewDoc.id,
            ...reviewDoc.data(),
          })
        );

      if (cancelled) return;

      // ─────────────────────────────────────
      // Provider profile
      // ─────────────────────────────────────

      setProfile({
        uid: user.uid,

        name:
          providerData.fullName ||
          providerData.name ||
          user.displayName ||
          "Provider",

        email:
          providerData.email ||
          user.email ||
          "",

        phone:
          providerData.phone ||
          "",

        trade:
          providerData.professionName ||
          providerData.trade ||
          providerData.service ||
          "",

        location:
          providerData.location ||
          providerData.address ||
          "",

        imageUrl:
          providerData.profileImageUrl ||
          providerData.imageUrl ||
          "",

        skills:
          Array.isArray(providerData.skills)
            ? providerData.skills
            : [],

        documents:
          Array.isArray(providerData.documents)
            ? providerData.documents
            : [],

        jobsDone:
          providerData.jobsDone || 0,

        rating:
          providerData.rating || 0,

        years:
          providerData.years ||
          providerData.yearsOnSurePro ||
          0,
      });

      setAvailable(
        providerData.available !== false
      );

      setApplications(
        loadedApplications
      );

      setReviews(
        loadedReviews
      );

      // ─────────────────────────────────────
      // CUSTOMER REQUESTS
      //
      // This is the important part.
      //
      // Customer dashboard writes to:
      // requests/{requestId}
      // ─────────────────────────────────────

      const requestsQuery = query(
        collection(db, "requests"),
        where("status", "==", "open")
      );

      unsubscribeRequests =
        onSnapshot(
          requestsQuery,
          (snapshot) => {
            if (cancelled) return;

            const loadedRequests =
              snapshot.docs.map(
                (requestDoc) => ({
                  id: requestDoc.id,
                  ...requestDoc.data(),
                })
              );

            // newest requests first
            loadedRequests.sort(
              (a, b) => {
                const aTime =
                  a.createdAt?.toMillis?.() || 0;

                const bTime =
                  b.createdAt?.toMillis?.() || 0;

                return bTime - aTime;
              }
            );

            setJobs(loadedRequests);
            setLoading(false);
          },
          (requestError) => {
            console.error(
              "Unable to load customer requests:",
              requestError
            );

            if (!cancelled) {
              setError(
                requestError.message ||
                  "Unable to load customer requests."
              );

              setLoading(false);
            }
          }
        );

    } catch (err) {
      console.error(
        "Failed to load provider dashboard:",
        err
      );

      if (!cancelled) {
        setError(
          "We couldn't load your dashboard. Please try again."
        );

        setLoading(false);
      }
    }
  }

  loadProviderData();

  return () => {
    cancelled = true;

    if (unsubscribeRequests) {
      unsubscribeRequests();
    }
  };
}, [user?.uid]);

  // ─────────────────────────────────────────
  // Applied job IDs
  // ─────────────────────────────────────────

  const firestoreAppliedJobIds =
    useMemo(() => {
      return applications
        .map(
          (application) =>
            application.jobId
        )
        .filter(Boolean);
    }, [applications]);

  const allAppliedJobIds =
    useMemo(() => {
      return [
        ...new Set([
          ...firestoreAppliedJobIds,
          ...appliedJobIds,
        ]),
      ];
    }, [
      firestoreAppliedJobIds,
      appliedJobIds,
    ]);

  // ─────────────────────────────────────────
  // Filter jobs
  // ─────────────────────────────────────────

  const filteredJobs =
    useMemo(() => {
      return jobs.filter((job) => {
        if (
          allAppliedJobIds.includes(
            job.id
          )
        ) {
          return true;
        }

        if (
          activeFilter ===
          "All jobs"
        ) {
          return true;
        }

        if (
          activeFilter ===
          "New today"
        ) {
          if (!job.createdAt)
            return false;

          const date =
            job.createdAt.toDate
              ? job.createdAt.toDate()
              : new Date(
                  job.createdAt
                );

          const now = new Date();

          return (
            date.toDateString() ===
            now.toDateString()
          );
        }

        if (
          activeFilter ===
          "Urgent"
        ) {
          return job.status === "urgent";
        }

        if (
          activeFilter ===
          "High budget"
        ) {
          return (
            Number(
              job.budgetMax || 0
            ) >= 50000
          );
        }

        if (
          activeFilter ===
          "Nearby"
        ) {
          // Location filtering should eventually
          // be replaced with a proper geolocation/
          // distance system.
          return true;
        }

        return true;
      });
    }, [
      jobs,
      activeFilter,
      allAppliedJobIds,
    ]);

  // ─────────────────────────────────────────
  // Availability
  // ─────────────────────────────────────────

  async function handleAvailabilityChange(
    newValue
  ) {
    if (!user?.uid) return;

    try {
      setAvailabilitySaving(true);

      const providerRef = doc(
        db,
        "providers",
        user.uid
      );

      await updateDoc(
        providerRef,
        {
          available: newValue,
          updatedAt:
            serverTimestamp(),
        }
      );

      setAvailable(newValue);

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              available: newValue,
            }
          : previous
      );
    } catch (err) {
      console.error(
        "Failed to update availability:",
        err
      );

      alert(
        "Unable to update your availability. Please try again."
      );
    } finally {
      setAvailabilitySaving(false);
    }
  }

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">

          <div
            className="w-8 h-8 border-2
            border-emerald-200 border-t-emerald-600
            rounded-full animate-spin mx-auto"
          />

          <p className="text-sm text-gray-500 mt-3">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Error
  // ─────────────────────────────────────────

  if (error) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-xl p-6 text-center">

          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            !
          </div>

          <h2 className="mt-3 text-sm font-semibold text-gray-900">
            Something went wrong
          </h2>

          <p className="text-xs text-gray-500 mt-2">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 px-4 py-2 rounded-full
            bg-emerald-700 hover:bg-emerald-800
            text-white text-xs font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Main UI
  // ─────────────────────────────────────────

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">

      {/* Top bar */}
      <header
        className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5"
      >
        <div className="text-base font-semibold tracking-tight text-gray-900">
          Sure<span className="text-emerald-600">Pro</span>
        </div>

        <div className="flex items-center gap-2.5">

          {/* Notification */}
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-colors hover:bg-gray-50"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            <span
              className="absolute top-2 right-2
              w-1.5 h-1.5 bg-emerald-600
              rounded-full border border-white"
            />
          </button>

          {/* Avatar */}
          <button
            type="button"
            onClick={() =>
              setSidebarOpen(
                (open) => !open
              )
            }
            className={`h-9 w-9 overflow-hidden rounded-full border-2 border-emerald-600 bg-emerald-50 transition-colors hover:bg-emerald-100
            ${
              sidebarOpen
                ? "bg-emerald-100 text-emerald-800"
                : "bg-emerald-50 text-emerald-800"
            }`}
          >
            {profile?.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(
                profile?.name
              )
            )}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">

        {/* Job feed */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4">

          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">

            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Customer requests
              </h1>

              <p className="mt-0.5 text-xs text-gray-400">
                Requests from customers looking for
                {profile?.trade
                  ? ` ${profile.trade}`
                  : " service providers"}{" "}
                · {jobs.length} open requests
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">

            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter(
                    filter
                  )
                }
                className={`flex-shrink-0
                text-xs px-3.5 py-1.5
                rounded-full border transition-all
                ${
                  activeFilter ===
                  filter
                    ? "bg-emerald-700 border-emerald-700 text-white font-medium"
                    : "bg-white border-gray-200 text-gray-500 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Empty state */}
          {filteredJobs.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center">

              <div
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700"
              >
                🔧
              </div>

              <h2 className="mt-3 text-sm font-semibold text-gray-900">
                No jobs found
              </h2>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-400">
                New jobs matching your services
                will appear here.
              </p>
            </div>
          )}

          {/* Jobs */}
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isApplied={allAppliedJobIds.includes(
                job.id
              )}
              onApply={onApplyJob}
              onViewDetail={onApplyJob}
            />
          ))}
        </main>

        {/* Profile sidebar */}
        {sidebarOpen && profile && (
          <ProfileSidebar
            profile={profile}
            available={available}
            availabilitySaving={
              availabilitySaving
            }
            onAvailabilityChange={
              handleAvailabilityChange
            }
            applicationsCount={
              applications.length
            }
            reviews={reviews}
            onClose={() =>
              setSidebarOpen(false)
            }
          />
        )}
      </div>
    </div>
  );
}