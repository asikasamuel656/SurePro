// pages/customer_dashboard.jsx

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/firebase";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import RequestModal from "../components/request_modal";

const FILTERS = ["All", "Open", "Reviewing", "Hired", "Completed"];

const STATUS_BADGE = {
  open: "bg-emerald-50 text-emerald-800 border border-emerald-200",
  reviewing: "bg-amber-50 text-amber-800 border border-amber-200",
  hired: "bg-blue-50 text-blue-800 border border-blue-200",
  completed: "bg-gray-100 text-gray-700 border border-gray-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

const STATUS_LABEL = {
  open: "Open",
  reviewing: "Reviewing",
  hired: "Hired",
  completed: "Completed",
  cancelled: "Cancelled",
};

function getInitials(name = "Customer") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getProfileImage(profile) {
  if (!profile) return "";

  return (
    profile.avatarUrl ||
    profile.profileImageUrl ||
    profile.imageUrl ||
    profile.photoURL ||
    ""
  );
}

function formatDate(timestamp) {
  if (!timestamp) return "Just now";

  try {
    const date = timestamp.toDate
      ? timestamp.toDate()
      : new Date(timestamp);

    const now = new Date();
    const difference = now.getTime() - date.getTime();

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

function formatBudget(min, max) {
  const hasMin = min !== undefined && min !== null && min !== "";
  const hasMax = max !== undefined && max !== null && max !== "";

  if (!hasMin && !hasMax) {
    return "Budget not set";
  }

  const formatAmount = (amount) =>
    `₦${Number(amount).toLocaleString("en-NG")}`;

  if (hasMin && hasMax) {
    return `${formatAmount(min)} – ${formatAmount(max)}`;
  }

  if (hasMin) {
    return `From ${formatAmount(min)}`;
  }

  return `Up to ${formatAmount(max)}`;
}

function Avatar({
  src,
  name,
  size = "md",
  className = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const sizeClasses = {
    sm: "h-6 w-6 text-[9px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-base",
    xl: "h-14 w-14 text-lg",
  };

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={`${name || "Customer"} profile`}
        onError={() => setImageFailed(true)}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-800 ${className}`}
      aria-label={`${name || "Customer"} initials`}
    >
      {getInitials(name)}
    </div>
  );
}

function LocationIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function JobPhoto({ job }) {
  const imageUrl =
    job.imageUrl ||
    job.photoUrl ||
    job.requestImageUrl ||
    job.coverImageUrl ||
    "";

  const [imageFailed, setImageFailed] = useState(false);

  if (imageUrl && !imageFailed) {
    return (
      <div
        className="relative w-28 flex-shrink-0 overflow-hidden bg-gray-100"
        style={{ minHeight: 122 }}
      >
        <img
          src={imageUrl}
          alt={job.title || "Request"}
          onError={() => setImageFailed(true)}
          className="h-full w-full object-cover"
        />

        <span
          className="absolute bottom-1.5 left-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white"
        >
          Request photo
        </span>
      </div>
    );
  }

  return (
    <div
      className="relative flex w-28 flex-shrink-0 items-center justify-center overflow-hidden bg-emerald-50"
      style={{ minHeight: 122 }}
    >
      <svg
        width="112"
        height="122"
        viewBox="0 0 112 122"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="112" height="122" fill="#ecfdf5" />
        <rect x="8" y="58" width="96" height="64" fill="#d1fae5" />
        <rect x="30" y="20" width="52" height="42" rx="3" fill="#a7f3d0" />
        <rect x="42" y="70" width="28" height="34" rx="2" fill="#059669" />
        <circle cx="87" cy="31" r="12" fill="#34d399" opacity="0.85" />
        <path
          d="M81 31h12M87 25v12"
          stroke="#ffffff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <span className="absolute bottom-1.5 left-1.5 rounded bg-emerald-800/70 px-1.5 py-0.5 text-[10px] text-white">
        No photo
      </span>
    </div>
  );
}

function JobCard({ job, onViewApplicants }) {
  const status = job.status || "open";
  const isCompleted = status === "completed";
  const applicants = Array.isArray(job.applicants) ? job.applicants : [];
  const applicantsCount =
    Number(job.applicantsCount) || applicants.length || 0;

  const jobAddress =
    job.address ||
    job.location ||
    job.jobAddress ||
    "Location not provided";

  return (
    <article
      className={`mb-3 overflow-hidden rounded-xl border bg-white transition-colors hover:border-emerald-300 ${
        isCompleted ? "border-gray-200 opacity-80" : "border-gray-200"
      }`}
    >
      <div className="flex">
        <JobPhoto job={job} />

        <div className="min-w-0 flex-1 p-3">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                STATUS_BADGE[status] || STATUS_BADGE.open
              }`}
            >
              {STATUS_LABEL[status] || "Open"}
            </span>

            <span className="text-[11px] text-gray-400">
              {formatDate(job.createdAt)}
            </span>
          </div>

          <h2 className="mb-1 text-sm font-semibold leading-snug text-gray-900">
            {job.title || "Untitled request"}
          </h2>

          <div className="mb-1.5 flex items-center gap-1 text-xs text-gray-500">
            <LocationIcon className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{jobAddress}</span>
          </div>

          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-gray-500">
            {job.description || "No description was added to this request."}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {(status === "open" || status === "reviewing") && (
                <>
                  <div className="flex">
                    {applicants.slice(0, 3).map((applicant, index) => {
                      const name =
                        applicant.fullName ||
                        applicant.name ||
                        applicant.providerName ||
                        "Provider";

                      const image =
                        applicant.avatarUrl ||
                        applicant.profileImageUrl ||
                        applicant.imageUrl ||
                        "";

                      return (
                        <Avatar
                          key={
                            applicant.uid ||
                            applicant.providerId ||
                            `${name}-${index}`
                          }
                          src={image}
                          name={name}
                          size="sm"
                          className="border-2 border-white"
                          style={{
                            marginLeft: index > 0 ? "-7px" : "0",
                          }}
                        />
                      );
                    })}
                  </div>

                  <span className="text-xs text-gray-500">
                    {applicantsCount} applicant
                    {applicantsCount === 1 ? "" : "s"}
                  </span>
                </>
              )}

              {status === "hired" && (
                <span className="text-xs font-medium text-blue-700">
                  Provider hired
                </span>
              )}

              {status === "completed" && (
                <span className="text-xs font-medium text-gray-500">
                  Job completed
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {(job.budgetMin !== undefined || job.budgetMax !== undefined) && (
                <span className="text-xs font-semibold text-emerald-700">
                  {formatBudget(job.budgetMin, job.budgetMax)}
                </span>
              )}

              {(status === "open" || status === "reviewing") && (
                <button
                  type="button"
                  onClick={() => onViewApplicants(job)}
                  className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-800"
                >
                  View applicants
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({ label, value, tone = "emerald" }) {
  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-3">
      <div className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </div>

      <div
        className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-sm font-semibold ${
          toneClasses[tone] || toneClasses.emerald
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ContactRow({ type, value }) {
  const icons = {
    phone: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498A1 1 0 0 1 21 15.72V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z"
      />
    ),
    email: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"
        />
      </>
    ),
    address: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657 13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </>
    ),
  };

  return (
    <div className="mb-2 flex items-start gap-2 text-xs text-gray-500 last:mb-0">
      <svg
        className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {icons[type]}
      </svg>

      <span className="break-words">{value}</span>
    </div>
  );
}

function OverviewTab({ jobs, profile }) {
  const openJobs = jobs.filter((job) => (job.status || "open") === "open");
  const reviewingJobs = jobs.filter(
    (job) => job.status === "reviewing"
  );
  const hiredJobs = jobs.filter((job) => job.status === "hired");
  const completedJobs = jobs.filter(
    (job) => job.status === "completed"
  );

  const activeJobs = jobs.filter(
    (job) => !["completed", "cancelled"].includes(job.status)
  );

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-2 border-b border-gray-100 p-4">
        <StatCard label="Open" value={openJobs.length} tone="emerald" />
        <StatCard
          label="Reviewing"
          value={reviewingJobs.length}
          tone="amber"
        />
        <StatCard label="Hired" value={hiredJobs.length} tone="blue" />
        <StatCard
          label="Completed"
          value={completedJobs.length}
          tone="gray"
        />
      </div>

      <div className="border-b border-gray-100 px-4 py-3">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          Recent requests
        </div>

        {activeJobs.length === 0 ? (
          <p className="text-xs text-gray-400">
            You do not have active requests yet.
          </p>
        ) : (
          activeJobs.slice(0, 4).map((job) => {
            const status = job.status || "open";

            return (
              <div
                key={job.id}
                className="mb-2.5 last:mb-0"
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-medium text-gray-800">
                    {job.title || "Untitled request"}
                  </span>

                  <span
                    className={`flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                      STATUS_BADGE[status] || STATUS_BADGE.open
                    }`}
                  >
                    {STATUS_LABEL[status] || "Open"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>
                    {Number(job.applicantsCount) ||
                      job.applicants?.length ||
                      0}{" "}
                    applicants
                  </span>

                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-b border-gray-100 px-4 py-3">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          Contact details
        </div>

        <ContactRow
          type="phone"
          value={profile?.phone || "No phone number provided"}
        />

        <ContactRow
          type="email"
          value={profile?.email || "No email address provided"}
        />

        <ContactRow
          type="address"
          value={profile?.address || "No address provided"}
        />
      </div>

      <div className="px-4 py-3">
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-gray-400">
          About you
        </div>

        <p className="text-xs leading-relaxed text-gray-500">
          {profile?.bio || "Add a short bio to help providers understand your needs."}
        </p>
      </div>
    </div>
  );
}

function ReviewsTab() {
  return (
    <div className="px-4 py-8 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg text-emerald-600">
        ★
      </div>

      <h3 className="mt-3 text-sm font-medium text-gray-900">
        No reviews yet
      </h3>

      <p className="mx-auto mt-1 max-w-[210px] text-xs leading-relaxed text-gray-400">
        Reviews from providers will appear after you complete jobs.
      </p>
    </div>
  );
}

export default function CustomerDashboard({ onViewApplicants }) {
  const { user: currentUser, initializing } = useAuth();

  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingRequest, setCreatingRequest] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (initializing) {
      return undefined;
    }

    if (!currentUser?.uid) {
      setProfile(null);
      setJobs([]);
      setLoading(false);
      setError("You must be signed in to view your dashboard.");
      return undefined;
    }

    setLoading(true);
    setError("");

    const profileRef = doc(db, "users", currentUser.uid);

    const unsubscribeProfile = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile({
            uid: snapshot.id,
            ...snapshot.data(),
          });
        } else {
          setProfile({
            uid: currentUser.uid,
            fullName:
              currentUser.fullName ||
              currentUser.displayName ||
              "Customer",
            email: currentUser.email || "",
            role: "customer",
          });
        }
      },
      (profileError) => {
        console.error("Unable to load customer profile:", profileError);

        setProfile({
          uid: currentUser.uid,
          fullName:
            currentUser.fullName ||
            currentUser.displayName ||
            "Customer",
          email: currentUser.email || "",
          role: "customer",
        });
      }
    );

    const requestsQuery = query(
      collection(db, "requests"),
      where("customerId", "==", currentUser.uid)
    );

    const unsubscribeRequests = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const loadedJobs = snapshot.docs.map((requestDoc) => ({
          id: requestDoc.id,
          ...requestDoc.data(),
        }));

        setJobs(loadedJobs);
        setLoading(false);
      },
      (requestError) => {
        console.error("Unable to load customer requests:", requestError);

        setJobs([]);
        setError(
          requestError.message ||
            "We could not load your requests. Please refresh and try again."
        );
        setLoading(false);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeRequests();
    };
  }, [currentUser?.uid, currentUser?.email, currentUser?.displayName, currentUser?.fullName, initializing]);

  const filteredJobs = useMemo(() => {
    if (activeFilter === "All") {
      return jobs;
    }

    return jobs.filter(
      (job) => (job.status || "open") === activeFilter.toLowerCase()
    );
  }, [activeFilter, jobs]);

  const displayName =
    profile?.fullName ||
    profile?.name ||
    currentUser?.fullName ||
    currentUser?.displayName ||
    "Customer";

  const profileImage = getProfileImage(profile);

  const handleRequestCreated = async (requestData) => {
    if (!currentUser?.uid) {
      setCreateError("You must be signed in before posting a request.");
      return false;
    }

    setCreatingRequest(true);
    setCreateError("");

    try {
      const requestRef = await addDoc(collection(db, "requests"), {
        ...requestData,

        customerId: currentUser.uid,
        customerName: displayName,
        customerEmail: profile?.email || currentUser.email || "",
        customerPhone: profile?.phone || "",
        customerAddress: profile?.address || "",
        customerAvatarUrl: profileImage,

        status: "open",
        applicants: [],
        applicantsCount: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setPostModalOpen(false);

      return requestRef.id;
    } catch (requestError) {
      console.error("Error creating request:", requestError);

      setCreateError(
        requestError.message ||
          "Your request could not be posted. Please try again."
      );

      return false;
    } finally {
      setCreatingRequest(false);
    }
  };

  if (initializing || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" />
          <p className="mt-3 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser?.uid) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-5">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center">
          <h1 className="text-base font-semibold text-gray-900">
            Sign in required
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Please sign in as a customer to access your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5">
        <div className="text-base font-semibold tracking-tight text-gray-900">
          Sure<span className="text-emerald-600">Pro</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setPostModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-full bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800 sm:px-4"
          >
            <span className="text-sm leading-none">+</span>
            <span className="hidden sm:inline">Post a request</span>
            <span className="sm:hidden">Post</span>
          </button>

          <button
            type="button"
            onClick={() => setSidebarOpen((isOpen) => !isOpen)}
            className="h-9 w-9 overflow-hidden rounded-full border-2 border-emerald-600 bg-emerald-50 transition-colors hover:bg-emerald-100"
            aria-label="Toggle profile sidebar"
          >
            <Avatar
              src={profileImage}
              name={displayName}
              size="md"
              className="h-full w-full rounded-none"
            />
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Your requests
              </h1>

              <p className="mt-0.5 text-xs text-gray-400">
                {jobs.length} request{jobs.length === 1 ? "" : "s"} posted
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

          {createError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {createError}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
            >
              {error}
            </div>
          )}

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-all ${
                  activeFilter === filter
                    ? "border-emerald-700 bg-emerald-700 font-medium text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredJobs.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">
                +
              </div>

              <h2 className="mt-3 text-sm font-semibold text-gray-900">
                {jobs.length === 0
                  ? "You have not posted a request yet"
                  : `No ${activeFilter.toLowerCase()} requests`}
              </h2>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-gray-400">
                {jobs.length === 0
                  ? "Describe the service you need and verified providers can apply."
                  : "Try another filter to see your other requests."}
              </p>

              {jobs.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCreateError("");
                    setPostModalOpen(true);
                  }}
                  className="mt-4 rounded-full bg-emerald-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-800"
                >
                  Post your first request
                </button>
              )}
            </div>
          ) : (
            filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onViewApplicants={onViewApplicants || (() => {})}
              />
            ))
          )}
        </main>

        {sidebarOpen && (
          <aside className="hidden w-72 flex-shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white md:flex">
            <div className="flex-shrink-0 bg-emerald-900">
              <div className="px-5 pt-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="relative">
                    <Avatar
                      src={profileImage}
                      name={displayName}
                      size="xl"
                      className="border-2 border-emerald-400"
                    />

                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-emerald-900 bg-emerald-400" />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-white transition-colors hover:bg-white/20"
                    style={{ background: "rgba(255,255,255,0.15)" }}
                    aria-label="Close profile sidebar"
                  >
                    ×
                  </button>
                </div>

                <div className="truncate text-sm font-semibold text-white">
                  {displayName}
                </div>

                <div className="mt-0.5 text-xs text-emerald-200">
                  Customer
                </div>

                <div className="mb-4 mt-1 flex items-center gap-1 text-xs text-emerald-100">
                  <LocationIcon className="h-3.5 w-3.5 flex-shrink-0" />

                  <span className="truncate">
                    {profile?.address || "Address not provided"}
                  </span>
                </div>
              </div>

              <div
                className="flex border-t"
                style={{ borderColor: "rgba(255,255,255,0.12)" }}
              >
                {[
                  { key: "overview", label: "Overview" },
                  { key: "reviews", label: "Reviews" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex-1 py-2.5 text-[11px] font-medium transition-colors ${
                      activeTab === tab.key
                        ? "text-white"
                        : "text-white/45 hover:text-white/75"
                    }`}
                  >
                    {tab.label}

                    {activeTab === tab.key && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-t bg-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {activeTab === "overview" ? (
                <OverviewTab jobs={jobs} profile={profile} />
              ) : (
                <ReviewsTab />
              )}
            </div>
          </aside>
        )}
      </div>

      <RequestModal
        open={postModalOpen}
        onClose={() => {
          if (!creatingRequest) {
            setPostModalOpen(false);
          }
        }}
        onCreated={handleRequestCreated}
        loading={creatingRequest}
      />
    </div>
  );
}