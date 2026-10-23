// // src/pages/provider_register.jsx

// import { useState } from "react";

// import {
//   createUserWithEmailAndPassword,
//   updateProfile,
// } from "firebase/auth";

// import {
//   doc,
//   setDoc,
//   serverTimestamp,
// } from "firebase/firestore";

// import {
//   auth,
//   db,
// } from "../firebase/firebase";

// import {
//   uploadToCloudinary,
// } from "../services/cloudinary";

// import {
//   PROFESSIONS,
// } from "../lib/mockBackend";

// import ProfessionModal from "../components/profession_modal";

// import { useAuth } from "../context/AuthContext";
// // ─────────────────────────────────────────────────────────────
// // UI HELPERS
// // ─────────────────────────────────────────────────────────────

// function Input({
//   label,
//   error,
//   ...props
// }) {
//   return (
//     <div className="mb-4">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           {label}
//         </label>
//       )}

//       <input
//         className={`
//           w-full
//           border
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           outline-none
//           focus:ring-2
//           focus:ring-emerald-500
//           transition
//           ${
//             error
//               ? "border-red-400"
//               : "border-gray-200"
//           }
//         `}
//         {...props}
//       />

//       {error && (
//         <p className="text-xs text-red-500 mt-1">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

// function Textarea({
//   label,
//   error,
//   ...props
// }) {
//   return (
//     <div className="mb-4">
//       {label && (
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           {label}
//         </label>
//       )}

//       <textarea
//         rows={3}
//         className={`
//           w-full
//           border
//           rounded-xl
//           px-4
//           py-3
//           text-sm
//           outline-none
//           focus:ring-2
//           focus:ring-emerald-500
//           transition
//           resize-none
//           ${
//             error
//               ? "border-red-400"
//               : "border-gray-200"
//           }
//         `}
//         {...props}
//       />

//       {error && (
//         <p className="text-xs text-red-500 mt-1">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

// function Btn({
//   loading,
//   children,
//   ...props
// }) {
//   return (
//     <button
//       className="
//         w-full
//         bg-emerald-700
//         hover:bg-emerald-800
//         disabled:opacity-60
//         text-white
//         font-medium
//         text-sm
//         py-3.5
//         rounded-xl
//         transition-colors
//       "
//       disabled={loading}
//       {...props}
//     >
//       {loading
//         ? "Please wait…"
//         : children}
//     </button>
//   );
// }

// function StepBar({
//   current,
//   total,
// }) {
//   return (
//     <div className="flex gap-2 mb-8">
//       {Array.from({
//         length: total,
//       }).map((_, i) => (
//         <div
//           key={i}
//           className={`
//             flex-1
//             h-1
//             rounded-full
//             transition-colors
//             ${
//               i < current
//                 ? "bg-emerald-600"
//                 : "bg-gray-200"
//             }
//           `}
//         />
//       ))}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // STEP 1 — ACCOUNT
// // ─────────────────────────────────────────────────────────────

// function StepAccount({
//   onNext,
// }) {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//     fullName: "",
//     phone: "",
//   });

//   const [errors, setErrors] =
//     useState({});

//   const [loading, setLoading] =
//     useState(false);

//   const set = (key) => (e) => {
//     setForm((current) => ({
//       ...current,
//       [key]: e.target.value,
//     }));

//     setErrors((current) => ({
//       ...current,
//       [key]: "",
//     }));
//   };

//   async function submit(e) {
//     e.preventDefault();

//     const errs = {};

//     if (!form.fullName.trim()) {
//       errs.fullName =
//         "Full name is required";
//     }

//     if (!form.phone.trim()) {
//       errs.phone =
//         "Phone number is required";
//     }

//     if (!form.email.trim()) {
//       errs.email =
//         "Email is required";
//     }

//     if (form.password.length < 6) {
//       errs.password =
//         "Password must be at least 6 characters";
//     }

//     if (
//       Object.keys(errs).length > 0
//     ) {
//       setErrors(errs);
//       return;
//     }

//     setLoading(true);
//     setErrors({});

//     try {
//       // -------------------------------------------------------
//       // CREATE FIREBASE AUTH ACCOUNT
//       // -------------------------------------------------------

//       const credential =
//         await createUserWithEmailAndPassword(
//           auth,
//           form.email.trim(),
//           form.password
//         );

//       const firebaseUser =
//         credential.user;

//       // -------------------------------------------------------
//       // SET DISPLAY NAME
//       // -------------------------------------------------------

//       await updateProfile(
//         firebaseUser,
//         {
//           displayName:
//             form.fullName.trim(),
//         }
//       );

//       // -------------------------------------------------------
//       // CREATE MAIN USERS DOCUMENT IMMEDIATELY
//       // -------------------------------------------------------

//       await setDoc(
//         doc(
//           db,
//           "users",
//           firebaseUser.uid
//         ),
//         {
//           uid: firebaseUser.uid,

//           email:
//             firebaseUser.email ||
//             form.email.trim(),

//           name:
//             form.fullName.trim(),

//           phone:
//             form.phone.trim(),

//           role: "provider",

//           /*
//            * VERY IMPORTANT
//            *
//            * The account exists, but registration
//            * has not finished.
//            */
//           registrationComplete:
//             false,

//           createdAt:
//             serverTimestamp(),

//           updatedAt:
//             serverTimestamp(),
//         }
//       );

//       // -------------------------------------------------------
//       // CONTINUE TO STEP 2
//       // -------------------------------------------------------

//       onNext({
//         uid: firebaseUser.uid,
//         email:
//           firebaseUser.email ||
//           form.email.trim(),
//         fullName:
//           form.fullName.trim(),
//         phone:
//           form.phone.trim(),
//       });
//     } catch (error) {
//       console.error(
//         "Account creation failed:",
//         error
//       );

//       let message =
//         "Unable to create your account.";

//       switch (error.code) {
//         case "auth/email-already-in-use":
//           message =
//             "An account already exists with this email. Please sign in instead.";
//           break;

//         case "auth/invalid-email":
//           message =
//             "Please enter a valid email address.";
//           break;

//         case "auth/weak-password":
//           message =
//             "Your password is too weak.";
//           break;

//         case "auth/network-request-failed":
//           message =
//             "Network error. Please check your internet connection.";
//           break;

//         default:
//           message =
//             error.message ||
//             message;
//       }

//       setErrors({
//         email: message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={submit}>
//       <h2 className="text-xl font-semibold mb-1">
//         Create your account
//       </h2>

//       <p className="text-sm text-gray-500 mb-6">
//         Create your provider account to
//         start offering services.
//       </p>

//       <Input
//         label="Full name"
//         placeholder="Emeka Adeyemi"
//         value={form.fullName}
//         onChange={set("fullName")}
//         error={errors.fullName}
//       />

//       <Input
//         label="Phone number"
//         placeholder="+234 80..."
//         type="tel"
//         value={form.phone}
//         onChange={set("phone")}
//         error={errors.phone}
//       />

//       <Input
//         label="Email address"
//         placeholder="you@email.com"
//         type="email"
//         value={form.email}
//         onChange={set("email")}
//         error={errors.email}
//       />

//       <Input
//         label="Password"
//         type="password"
//         placeholder="Minimum 6 characters"
//         value={form.password}
//         onChange={set("password")}
//         error={errors.password}
//       />

//       <Btn loading={loading}>
//         Continue →
//       </Btn>
//     </form>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // STEP 2 — PROFILE
// // ─────────────────────────────────────────────────────────────

// function StepProfile({
//   data,
//   onNext,
//   onBack,
// }) {
//   const [bio, setBio] =
//     useState(data.bio || "");

//   const [location, setLocation] =
//     useState(data.location || "");

//   const [avatar, setAvatar] =
//     useState(
//       data.avatarFile || null
//     );

//   const [preview, setPreview] =
//     useState(
//       data.profileImageUrl || null
//     );

//   const [loading, setLoading] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   function pickAvatar(e) {
//     const file =
//       e.target.files?.[0];

//     if (!file) return;

//     if (
//       !file.type.startsWith("image/")
//     ) {
//       setError(
//         "Please select an image file."
//       );
//       return;
//     }

//     if (
//       file.size >
//       5 * 1024 * 1024
//     ) {
//       setError(
//         "Profile image must be smaller than 5MB."
//       );
//       return;
//     }

//     setError("");

//     setAvatar(file);

//     const objectUrl =
//       URL.createObjectURL(file);

//     setPreview(objectUrl);
//   }

//   async function submit(e) {
//     e.preventDefault();

//     if (!bio.trim()) {
//       setError(
//         "Please add a short bio."
//       );
//       return;
//     }

//     if (!location.trim()) {
//       setError(
//         "Please enter your service area."
//       );
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       let profileImageUrl =
//         data.profileImageUrl || "";

//       let profileImagePublicId =
//         data.profileImagePublicId || "";

//       // -------------------------------------------------------
//       // CLOUDINARY
//       // -------------------------------------------------------

//       if (avatar) {
//         const result =
//           await uploadToCloudinary(
//             avatar
//           );

//         profileImageUrl =
//           result.url;

//         profileImagePublicId =
//           result.publicId;
//       }

//       // -------------------------------------------------------
//       // SAVE DRAFT TO USERS
//       // -------------------------------------------------------

//       if (data.uid) {
//         await setDoc(
//           doc(
//             db,
//             "users",
//             data.uid
//           ),
//           {
//             bio: bio.trim(),

//             location:
//               location.trim(),

//             profileImageUrl,

//             profileImagePublicId,

//             registrationComplete:
//               false,

//             updatedAt:
//               serverTimestamp(),
//           },
//           {
//             merge: true,
//           }
//         );
//       }

//       onNext({
//         bio: bio.trim(),

//         location:
//           location.trim(),

//         avatarFile: avatar,

//         profileImageUrl,

//         profileImagePublicId,
//       });
//     } catch (err) {
//       console.error(
//         "Profile upload failed:",
//         err
//       );

//       setError(
//         err.message ||
//           "Failed to save your profile."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={submit}>
//       <h2 className="text-xl font-semibold mb-1">
//         Your profile
//       </h2>

//       <p className="text-sm text-gray-500 mb-6">
//         Customers will see this information
//         before booking you.
//       </p>

//       <div className="mb-5">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Profile photo
//         </label>

//         <label className="flex items-center gap-4 cursor-pointer">
//           <div
//             className={`
//               w-16
//               h-16
//               rounded-full
//               flex
//               items-center
//               justify-center
//               overflow-hidden
//               border-2
//               ${
//                 preview
//                   ? "border-emerald-400"
//                   : "border-dashed border-gray-300"
//               }
//             `}
//           >
//             {preview ? (
//               <img
//                 src={preview}
//                 alt="Profile preview"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <span className="text-2xl">
//                 👤
//               </span>
//             )}
//           </div>

//           <span className="text-sm text-emerald-600 font-medium">
//             {preview
//               ? "Change photo"
//               : "Upload photo"}
//           </span>

//           <input
//             type="file"
//             accept="image/jpeg,image/png,image/webp"
//             className="hidden"
//             onChange={pickAvatar}
//           />
//         </label>
//       </div>

//       <Textarea
//         label="Short bio"
//         placeholder="Tell customers about your experience and what makes you reliable…"
//         value={bio}
//         onChange={(e) => {
//           setBio(e.target.value);
//           setError("");
//         }}
//         error=""
//       />

//       <Input
//         label="Location / area you cover"
//         placeholder="e.g. Lekki, Ajah, Victoria Island"
//         value={location}
//         onChange={(e) => {
//           setLocation(
//             e.target.value
//           );
//           setError("");
//         }}
//       />

//       {error && (
//         <p className="text-sm text-red-500 mb-4">
//           {error}
//         </p>
//       )}

//       <div className="flex gap-3">
//         <button
//           type="button"
//           onClick={onBack}
//           disabled={loading}
//           className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50"
//         >
//           Back
//         </button>

//         <div className="w-2/3">
//           <Btn loading={loading}>
//             Continue →
//           </Btn>
//         </div>
//       </div>
//     </form>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // STEP 3 — SERVICE
// // ─────────────────────────────────────────────────────────────

// function StepServices({
//   data,
//   onNext,
//   onBack,
// }) {
//   const [
//     professionId,
//     setProfessionId,
//   ] = useState(
//     data.professionId || null
//   );

//   const [modalOpen, setModalOpen] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const selectedProfession =
//     PROFESSIONS.find(
//       (profession) =>
//         profession.id ===
//         professionId
//     );

//   async function submit(e) {
//     e.preventDefault();

//     if (!professionId) {
//       setError(
//         "Please select the service you offer."
//       );
//       return;
//     }

//     const serviceData = {
//       professionId,
//       professionName:
//         selectedProfession?.name ||
//         "",
//     };

//     // Save draft
//     if (data.uid) {
//       try {
//         await setDoc(
//           doc(
//             db,
//             "users",
//             data.uid
//           ),
//           {
//             professionId,
//             professionName:
//               selectedProfession?.name ||
//               "",

//             registrationComplete:
//               false,

//             updatedAt:
//               serverTimestamp(),
//           },
//           {
//             merge: true,
//           }
//         );
//       } catch (err) {
//         console.error(
//           "Failed to save profession:",
//           err
//         );

//         setError(
//           "Unable to save your profession. Please try again."
//         );

//         return;
//       }
//     }

//     onNext(serviceData);
//   }

//   return (
//     <form onSubmit={submit}>
//       <h2 className="text-xl font-semibold mb-1">
//         Your primary service
//       </h2>

//       <p className="text-sm text-gray-500 mb-6">
//         Select the primary service you offer.
//       </p>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-1.5">
//           Your profession
//         </label>

//         <button
//           type="button"
//           onClick={() => {
//             setError("");
//             setModalOpen(true);
//           }}
//           className={`
//             w-full
//             text-left
//             border
//             rounded-xl
//             px-4
//             py-3
//             text-sm
//             transition
//             flex
//             items-center
//             justify-between
//             ${
//               error
//                 ? "border-red-400"
//                 : "border-gray-200"
//             }
//             ${
//               selectedProfession
//                 ? "text-gray-900 font-medium"
//                 : "text-gray-400"
//             }
//           `}
//         >
//           <span>
//             {selectedProfession
//               ? selectedProfession.name
//               : "Select the service you offer…"}
//           </span>

//           <span className="text-xs text-gray-400">
//             Change
//           </span>
//         </button>

//         {error && (
//           <p className="text-xs text-red-500 mt-1">
//             {error}
//           </p>
//         )}
//       </div>

//       <ProfessionModal
//         open={modalOpen}
//         professions={PROFESSIONS}
//         selectedId={professionId}
//         title="Choose your profession"
//         subtitle="Pick the one that best describes what you do."
//         onSelect={(id) => {
//           setProfessionId(id);
//           setModalOpen(false);
//           setError("");
//         }}
//         onClose={() =>
//           setModalOpen(false)
//         }
//       />

//       <div className="flex gap-3">
//         <button
//           type="button"
//           onClick={onBack}
//           className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl"
//         >
//           Back
//         </button>

//         <div className="w-2/3">
//           <Btn>
//             Continue →
//           </Btn>
//         </div>
//       </div>
//     </form>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // STEP 4 — WORK SAMPLES
// // ─────────────────────────────────────────────────────────────

// function StepSamples({
//   data,
//   onBack,
//   onDone,
// }) {
//   const [files, setFiles] =
//     useState(
//       data.workSampleFiles || []
//     );

//   const [previews, setPreviews] =
//     useState(
//       data.workSamplePreviews || []
//     );

//   const [loading, setLoading] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   function pickFiles(e) {
//     const picked =
//       Array.from(
//         e.target.files || []
//       );

//     if (!picked.length) return;

//     const validFiles =
//       picked
//         .filter((file) =>
//           file.type.startsWith(
//             "image/"
//           )
//         )
//         .filter(
//           (file) =>
//             file.size <=
//             5 * 1024 * 1024
//         )
//         .slice(0, 6);

//     if (
//       validFiles.length !==
//       picked.length
//     ) {
//       setError(
//         "Some files were skipped. Images must be under 5MB each."
//       );
//     } else {
//       setError("");
//     }

//     setFiles(validFiles);

//     const newPreviews =
//       validFiles.map((file) =>
//         URL.createObjectURL(file)
//       );

//     setPreviews(newPreviews);
//   }

//   async function submit(e) {
//     e.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const workSamples = [];

//       // -------------------------------------------------------
//       // UPLOAD WORK SAMPLES
//       // -------------------------------------------------------

//       for (const file of files) {
//         const result =
//           await uploadToCloudinary(
//             file
//           );

//         workSamples.push({
//           url: result.url,
//           publicId:
//             result.publicId,
//         });
//       }

//       // -------------------------------------------------------
//       // FINALIZE PROVIDER
//       // -------------------------------------------------------

//       await onDone(
//         workSamples
//       );
//     } catch (err) {
//       console.error(
//         "Work sample upload failed:",
//         err
//       );

//       setError(
//         err.message ||
//           "Unable to finish your registration."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <form onSubmit={submit}>
//       <h2 className="text-xl font-semibold mb-1">
//         Work samples
//       </h2>

//       <p className="text-sm text-gray-500 mb-6">
//         Upload photos of your previous
//         work. This helps customers
//         understand what you offer.
//       </p>

//       <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl h-36 cursor-pointer hover:border-emerald-400 transition-colors mb-4">
//         <span className="text-3xl mb-2">
//           📷
//         </span>

//         <span className="text-sm text-gray-500">
//           Click to select photos
//           (up to 6)
//         </span>

//         <input
//           type="file"
//           multiple
//           accept="image/jpeg,image/png,image/webp"
//           className="hidden"
//           onChange={pickFiles}
//         />
//       </label>

//       {previews.length > 0 && (
//         <div className="grid grid-cols-3 gap-2 mb-5">
//           {previews.map(
//             (
//               preview,
//               index
//             ) => (
//               <div
//                 key={index}
//                 className="aspect-square rounded-xl overflow-hidden bg-gray-100"
//               >
//                 <img
//                   src={preview}
//                   alt={`Work sample ${
//                     index + 1
//                   }`}
//                   className="w-full h-full object-cover"
//                 />
//               </div>
//             )
//           )}
//         </div>
//       )}

//       {error && (
//         <p className="text-sm text-red-500 mb-4">
//           {error}
//         </p>
//       )}

//       <div className="flex gap-3">
//         <button
//           type="button"
//           onClick={onBack}
//           disabled={loading}
//           className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50"
//         >
//           Back
//         </button>

//         <div className="w-2/3">
//           <Btn loading={loading}>
//             Create my provider account →
//           </Btn>
//         </div>
//       </div>

//       <p className="text-xs text-gray-400 text-center mt-3">
//         You can add more work samples
//         later from your dashboard.
//       </p>
//     </form>
//   );
// }

// // ─────────────────────────────────────────────────────────────
// // MAIN REGISTRATION
// // ─────────────────────────────────────────────────────────────

// export default function ProviderRegister({
//   onRegistered,
//   onGoToLogin,
// }) {
//   const { user } = useAuth(); // Fetch the incomplete user session

//   // Intelligently resume at the exact step they dropped off
//   const [step, setStep] = useState(1);

//   // Seed the form with data already saved to the Firestore 'users' doc
//   const [providerData, setProviderData] = useState({
//     uid: user?.uid || "",
//     email: user?.email || "",
//     fullName: user?.name || "",
//     phone: user?.phone || "",

//     bio: user?.bio || "",
//     location: user?.location || "",

//     profileImageUrl: user?.profileImageUrl || "",
//     profileImagePublicId: user?.profileImagePublicId || "",

//     professionId: user?.professionId || "",
//     professionName: user?.professionName || "",

//     workSampleFiles: [],
//     workSamplePreviews: [],
//   });

//   const [saving, setSaving] = useState(false);

//   // ───────────────────────────────────────────────────────────
//   // STEP 1
//   // ───────────────────────────────────────────────────────────

//   function handleAccountDone(
//     accountData
//   ) {
//     setProviderData(
//       (current) => ({
//         ...current,
//         ...accountData,
//       })
//     );

//     setStep(2);
//   }

//   // ───────────────────────────────────────────────────────────
//   // STEP 2
//   // ───────────────────────────────────────────────────────────

//   function handleProfileDone(
//     profileData
//   ) {
//     setProviderData(
//       (current) => ({
//         ...current,
//         ...profileData,
//       })
//     );

//     setStep(3);
//   }

//   // ───────────────────────────────────────────────────────────
//   // STEP 3
//   // ───────────────────────────────────────────────────────────

//   function handleServicesDone(
//     serviceData
//   ) {
//     setProviderData(
//       (current) => ({
//         ...current,
//         ...serviceData,
//       })
//     );

//     setStep(4);
//   }

//   // ───────────────────────────────────────────────────────────
//   // FINAL STEP
//   // ───────────────────────────────────────────────────────────

//   // Extract your context updater if available (e.g., fetchUserData, reloadUser, etc.)
// const { fetchUserData } = useAuth(); 

// async function handleAllDone(workSamples) {
//   const firebaseUser = auth.currentUser;

//   if (!firebaseUser) {
//     throw new Error(
//       "Your authentication session has expired. Please register again."
//     );
//   }

//   setSaving(true);

//   try {
//     const uid = firebaseUser.uid;

//     const finalData = {
//       uid,
//       fullName: providerData.fullName,
//       email: providerData.email,
//       phone: providerData.phone,
//       bio: providerData.bio,
//       location: providerData.location,
//       profileImageUrl: providerData.profileImageUrl || "",
//       profileImagePublicId: providerData.profileImagePublicId || "",
//       professionId: providerData.professionId,
//       professionName: providerData.professionName,
//       workSamples,
//       status: "active",
//       role: "provider",
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp(),
//     };

//     // 1. Write provider doc
//     await setDoc(doc(db, "providers", uid), finalData);

//     // 2. Write user doc
//     await setDoc(
//       doc(db, "users", uid),
//       {
//         uid,
//         email: providerData.email,
//         name: providerData.fullName,
//         phone: providerData.phone,
//         role: "provider",
//         registrationComplete: true,
//         updatedAt: serverTimestamp(),
//       },
//       { merge: true }
//     );

//     console.log("Provider registration completed successfully.");

//     // 3. Force update local AuthContext so protected routes allow entry
//     if (fetchUserData) {
//       await fetchUserData(uid);
//     }

//     // 4. Trigger redirect
//     if (onRegistered) {
//       onRegistered(uid);
//     }
//   } catch (error) {
//     console.error("Failed to create provider profile:", error);
//     throw new Error(
//       error.message ||
//         "Your account was created, but we couldn't finish your provider profile."
//     );
//   } finally {
//     setSaving(false);
//   }
// }

//   // ───────────────────────────────────────────────────────────
//   // UI
//   // ───────────────────────────────────────────────────────────

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

//         {/* LOGO */}
//         <div className="text-lg font-semibold tracking-tight mb-6">
//           Sure
//           <span className="text-emerald-600">
//             Pro
//           </span>

//           <span className="ml-2 text-xs font-normal text-gray-400">
//             registration
//           </span>
//         </div>

//         {/* STEP BAR */}
//         <StepBar
//           current={step}
//           total={4}
//         />

//         {/* STEP 1 */}
//         {step === 1 && (
//           <StepAccount
//             onNext={
//               handleAccountDone
//             }
//           />
//         )}

//         {/* STEP 2 */}
//         {step === 2 && (
//           <StepProfile
//             data={providerData}
//             onNext={
//               handleProfileDone
//             }
//             onBack={() =>
//               setStep(1)
//             }
//           />
//         )}

//         {/* STEP 3 */}
//         {step === 3 && (
//           <StepServices
//             data={providerData}
//             onNext={
//               handleServicesDone
//             }
//             onBack={() =>
//               setStep(2)
//             }
//           />
//         )}

//         {/* STEP 4 */}
//         {step === 4 && (
//           <StepSamples
//             data={providerData}
//             onBack={() =>
//               setStep(3)
//             }
//             onDone={
//               handleAllDone
//             }
//           />
//         )}

//         {/* LOGIN */}
//         <p className="text-center text-xs text-gray-400 mt-5">
//           Already have an account?{" "}

//           <button
//             type="button"
//             className="text-emerald-600 hover:underline"
//             onClick={
//               onGoToLogin
//             }
//           >
//             Sign in
//           </button>
//         </p>
//       </div>
//     </div>
//   );
// }


// src/pages/provider_register.jsx
// ─────────────────────────────────────────────────────────────
// Steps: 1) Verify email (OTP) -> 2) Account -> 3) Profile -> 4)
// Profession -> 5) Work samples (finalizes).
//
// Resume-safety: if useAuth().user already exists (they got partway
// through before, e.g. closed the tab), we skip straight past the
// email/account steps — those already happened — and jump to
// whichever of Profile/Profession/Samples is still incomplete, based
// on what's already saved on their users/{uid} doc.
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { uploadToCloudinary } from '../services/cloudinary'
import { PROFESSIONS } from '../lib/professions'
import ProfessionModal from '../components/profession_modal'
import EmailVerificationStep from '../components/EmailVerificationStep'
import { Input, Textarea, Btn, StepBar } from '../components/form_kit'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase'

// ── step 1: email verification ──────────────────────────────
function StepEmail({ onNext }) {
  return <EmailVerificationStep onVerified={onNext} />
}

// ── step 2: account ──────────────────────────────────────────
function StepAccount({ verifiedEmail, onNext }) {
  const { registerStep1 } = useAuth()
  const [form, setForm] = useState({ fullName: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (key) => (e) => {
    setForm((c) => ({ ...c, [key]: e.target.value }))
    setErrors((c) => ({ ...c, [key]: '' }))
  }

  async function submit(e) {
    e.preventDefault()
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (Object.keys(errs).length) return setErrors(errs)

    setLoading(true)
    try {
      await registerStep1({ role: 'provider', email: verifiedEmail, fullName: form.fullName.trim(), phone: form.phone.trim(), password: form.password })
      onNext()
    } catch (error) {
      let message = 'Unable to create your account.'
      switch (error.code) {
        case 'auth/email-already-in-use': message = 'An account already exists with this email. Please sign in instead.'; break
        case 'auth/weak-password': message = 'Your password is too weak.'; break
        case 'auth/network-request-failed': message = 'Network error. Please check your internet connection.'; break
        default: message = error.message || message
      }
      setErrors({ password: message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">
        Verified as <span className="font-medium text-gray-700">{verifiedEmail}</span>
      </p>
      <Input label="Full name" placeholder="Emeka Adeyemi" value={form.fullName} onChange={set('fullName')} error={errors.fullName} />
      <Input label="Phone number" placeholder="+234 80..." type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
      <Input label="Password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} error={errors.password} />
      <Btn loading={loading}>Continue →</Btn>
    </form>
  )
}

// ── step 3: profile (bio + location + avatar) ───────────────
function StepProfile({ data, onNext, onBack }) {
  const { updateProfile } = useAuth()
  const [bio, setBio] = useState(data.bio || '')
  const [location, setLocation] = useState(data.location || '')
  const [avatar, setAvatar] = useState(null)
  const [preview, setPreview] = useState(data.profileImageUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return setError('Please select an image file.')
    if (file.size > 5 * 1024 * 1024) return setError('Profile image must be smaller than 5MB.')
    setError('')
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  async function submit(e) {
    e.preventDefault()
    if (!bio.trim()) return setError('Please add a short bio.')
    if (!location.trim()) return setError('Please enter your service area.')

    setLoading(true)
    setError('')
    try {
      let profileImageUrl = data.profileImageUrl || ''
      if (avatar) {
        const result = await uploadToCloudinary(avatar)
        profileImageUrl = result.url
      }
      await updateProfile({ bio: bio.trim(), location: location.trim(), profileImageUrl })
      onNext({ bio: bio.trim(), location: location.trim(), profileImageUrl })
    } catch (err) {
      setError(err.message || 'Failed to save your profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">Your profile</h2>
      <p className="text-sm text-gray-500 mb-6">Customers will see this information before booking you.</p>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo</label>
        <label className="flex items-center gap-4 cursor-pointer">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border-2 ${preview ? 'border-emerald-400' : 'border-dashed border-gray-300'}`}>
            {preview ? <img src={preview} alt="Profile preview" className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
          </div>
          <span className="text-sm text-emerald-600 font-medium">{preview ? 'Change photo' : 'Upload photo'}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickAvatar} />
        </label>
      </div>

      <Textarea label="Short bio" placeholder="Tell customers about your experience and what makes you reliable…" value={bio} onChange={(e) => { setBio(e.target.value); setError('') }} />
      <Input label="Location / area you cover" placeholder="e.g. Lekki, Ajah, Victoria Island" value={location} onChange={(e) => { setLocation(e.target.value); setError('') }} />

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50">Back</button>
        <div className="w-2/3"><Btn loading={loading}>Continue →</Btn></div>
      </div>
    </form>
  )
}

// ── step 4: profession ───────────────────────────────────────
function StepServices({ data, onNext, onBack }) {
  const { updateProfile } = useAuth()
  const [professionId, setProfessionId] = useState(data.professionId || null)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedProfession = PROFESSIONS.find((p) => p.id === professionId)

  async function submit(e) {
    e.preventDefault()
    if (!professionId) return setError('Please select the service you offer.')
    setLoading(true)
    try {
      await updateProfile({ professionId, professionName: selectedProfession?.name || '' })
      onNext({ professionId, professionName: selectedProfession?.name || '' })
    } catch (err) {
      setError('Unable to save your profession. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">Your primary service</h2>
      <p className="text-sm text-gray-500 mb-6">Select the primary service you offer.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Your profession</label>
        <button
          type="button"
          onClick={() => { setError(''); setModalOpen(true) }}
          className={`w-full text-left border rounded-xl px-4 py-3 text-sm transition flex items-center justify-between ${error ? 'border-red-400' : 'border-gray-200'} ${selectedProfession ? 'text-gray-900 font-medium' : 'text-gray-400'}`}
        >
          <span>{selectedProfession ? selectedProfession.name : 'Select the service you offer…'}</span>
          <span className="text-xs text-gray-400">Change</span>
        </button>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      <ProfessionModal
        open={modalOpen}
        professions={PROFESSIONS}
        selectedId={professionId}
        onSelect={(id) => { setProfessionId(id); setModalOpen(false); setError('') }}
        onClose={() => setModalOpen(false)}
      />

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl">Back</button>
        <div className="w-2/3"><Btn loading={loading}>Continue →</Btn></div>
      </div>
    </form>
  )
}

// ── step 5: work samples (finalizes) ─────────────────────────
function StepSamples({ data, onBack, onDone }) {
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function pickFiles(e) {
    const picked = Array.from(e.target.files || [])
    if (!picked.length) return
    const validFiles = picked.filter((f) => f.type.startsWith('image/')).filter((f) => f.size <= 5 * 1024 * 1024).slice(0, 6)
    setError(validFiles.length !== picked.length ? 'Some files were skipped. Images must be under 5MB each.' : '')
    setFiles(validFiles)
    setPreviews(validFiles.map((f) => URL.createObjectURL(f)))
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const workSamples = []
      for (const file of files) {
        const result = await uploadToCloudinary(file)
        workSamples.push({ url: result.url, publicId: result.publicId })
      }
      await onDone(workSamples)
    } catch (err) {
      setError(err.message || 'Unable to finish your registration.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit}>
      <h2 className="text-xl font-semibold mb-1">Work samples</h2>
      <p className="text-sm text-gray-500 mb-6">Upload photos of your previous work. This helps customers understand what you offer.</p>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl h-36 cursor-pointer hover:border-emerald-400 transition-colors mb-4">
        <span className="text-3xl mb-2">📷</span>
        <span className="text-sm text-gray-500">Click to select photos (up to 6)</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={pickFiles} />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {previews.map((preview, index) => (
            <div key={index} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
              <img src={preview} alt={`Work sample ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} disabled={loading} className="w-1/3 border border-gray-200 text-gray-700 font-medium text-sm py-3.5 rounded-xl disabled:opacity-50">Back</button>
        <div className="w-2/3"><Btn loading={loading}>Create my provider account →</Btn></div>
      </div>
      <p className="text-xs text-gray-400 text-center mt-3">You can add more work samples later from your dashboard.</p>
    </form>
  )
}

// ── main wizard ───────────────────────────────────────────────
// step numbering: 1=email, 2=account, 3=profile, 4=profession, 5=samples
function resumeStepFor(user) {
  if (!user) return 1
  if (!user.bio || !user.location) return 3
  if (!user.professionId) return 4
  return 5
}

export default function ProviderRegister({ onRegistered, onGoToLogin }) {
  const { user, fetchUserData } = useAuth()
  const [step, setStep] = useState(() => resumeStepFor(user))
  const [verifiedEmail, setVerifiedEmail] = useState(user?.email || '')
  const [providerData, setProviderData] = useState({
    bio: user?.bio || '',
    location: user?.location || '',
    profileImageUrl: user?.profileImageUrl || '',
    professionId: user?.professionId || '',
    professionName: user?.professionName || '',
  })

  function handleEmailVerified(email) {
    setVerifiedEmail(email)
    setStep(2)
  }
  function handleProfileDone(profileData) {
    setProviderData((c) => ({ ...c, ...profileData }))
    setStep(4)
  }
  function handleServicesDone(serviceData) {
    setProviderData((c) => ({ ...c, ...serviceData }))
    setStep(5)
  }

  async function handleAllDone(workSamples) {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) throw new Error('Your authentication session has expired. Please register again.')

    const uid = firebaseUser.uid
    const finalData = {
      uid,
      fullName: user?.name || '',
      email: user?.email || verifiedEmail,
      phone: user?.phone || '',
      bio: providerData.bio,
      location: providerData.location,
      profileImageUrl: providerData.profileImageUrl || '',
      professionId: providerData.professionId,
      professionName: providerData.professionName,
      workSamples,
      status: 'active',
      role: 'provider',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(doc(db, 'providers', uid), finalData)
    await setDoc(doc(db, 'users', uid), { registrationComplete: true, updatedAt: serverTimestamp() }, { merge: true })

    if (fetchUserData) await fetchUserData(uid)
    onRegistered?.(uid)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <div className="text-lg font-semibold tracking-tight mb-6">
          Sure<span className="text-emerald-600">Pro</span>
          <span className="ml-2 text-xs font-normal text-gray-400">registration</span>
        </div>

        <StepBar current={step} total={5} />

        {step === 1 && <StepEmail onNext={handleEmailVerified} />}
        {step === 2 && <StepAccount verifiedEmail={verifiedEmail} onNext={() => setStep(3)} />}
        {step === 3 && <StepProfile data={providerData} onNext={handleProfileDone} onBack={() => setStep(2)} />}
        {step === 4 && <StepServices data={providerData} onNext={handleServicesDone} onBack={() => setStep(3)} />}
        {step === 5 && <StepSamples data={providerData} onBack={() => setStep(4)} onDone={handleAllDone} />}

        <p className="text-center text-xs text-gray-400 mt-5">
          Already have an account?{' '}
          <button type="button" className="text-emerald-600 hover:underline" onClick={onGoToLogin}>Sign in</button>
        </p>
      </div>
    </div>
  )
}