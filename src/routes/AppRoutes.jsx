import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { RouteLoadingFallback } from '@/components/feedback/RouteLoadingFallback'
import { ROUTES } from "@/constants/Routes";

// Every page is lazy-loaded so the initial bundle only contains what's
// needed for the very first screen -- the rest downloads as the person
// navigates, keeping SurePro fast even as it grows.
const Onboarding = lazy(() => import('@/features/auth/pages/Onboarding').then((m) => ({ default: m.Onboarding })))
const SelectAccountType = lazy(() => import('@/features/auth/pages/SelectAccountType').then((m) => ({ default: m.SelectAccountType })))
const Register = lazy(() => import('@/features/auth/pages/Register').then((m) => ({ default: m.Register })))
const Login = lazy(() => import('@/features/auth/pages/Login').then((m) => ({ default: m.Login })))
const VerifyEmail = lazy(() => import('@/features/auth/pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail })))
const ForgotPassword = lazy(() => import('@/features/auth/pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword').then((m) => ({ default: m.ResetPassword })))
const CompleteProfile = lazy(() => import('@/features/auth/pages/CompleteProfile').then((m) => ({ default: m.CompleteProfile })))

const Home = lazy(() => import('@/features/home/pages/Home').then((m) => ({ default: m.Home })))
const Discover = lazy(() => import('@/features/discovery/pages/Discover').then((m) => ({ default: m.Discover })))
const AllServices = lazy(() => import('@/features/discovery/pages/AllServices').then((m) => ({ default: m.AllServices })))
const LocationPermission = lazy(() => import('@/features/location/pages/LocationPermission').then((m) => ({ default: m.LocationPermission })))
const ProfessionalProfile = lazy(() => import('@/features/professionals/pages/ProfessionalProfile').then((m) => ({ default: m.ProfessionalProfile })))

const Feed = lazy(() => import('@/features/feed/pages/Feed').then((m) => ({ default: m.Feed })))
const CreatePost = lazy(() => import('@/features/feed/pages/CreatePost').then((m) => ({ default: m.CreatePost })))
const PostDetails = lazy(() => import('@/features/feed/pages/PostDetails').then((m) => ({ default: m.PostDetails })))

const MyJobs = lazy(() => import('@/features/jobs/pages/MyJobs').then((m) => ({ default: m.MyJobs })))
const CreateJob = lazy(() => import('@/features/jobs/pages/CreateJob').then((m) => ({ default: m.CreateJob })))
const JobRequests = lazy(() => import('@/features/jobs/pages/JobRequests').then((m) => ({ default: m.JobRequests })))
const JobDetails = lazy(() => import('@/features/jobs/pages/JobDetails').then((m) => ({ default: m.JobDetails })))

const Conversations = lazy(() => import('@/features/messaging/pages/Conversations').then((m) => ({ default: m.Conversations })))
const ChatThread = lazy(() => import('@/features/messaging/pages/ChatThread').then((m) => ({ default: m.ChatThread })))
const Notifications = lazy(() => import('@/features/notifications/pages/Notifications').then((m) => ({ default: m.Notifications })))
const JobTracking = lazy(() => import('@/features/tracking/pages/JobTracking').then((m) => ({ default: m.JobTracking })))

const Profile = lazy(() => import('@/features/profile/pages/Profile').then((m) => ({ default: m.Profile })))
const EditProfessionalProfile = lazy(() => import('@/features/profile/pages/EditProfessionalProfile').then((m) => ({ default: m.EditProfessionalProfile })))
const Settings = lazy(() => import('@/features/settings/pages/Settings').then((m) => ({ default: m.Settings })))
const Saved = lazy(() => import('@/features/saved/pages/Saved').then((m) => ({ default: m.Saved })))

const SafetyCenter = lazy(() => import('@/features/safety/pages/SafetyCenter').then((m) => ({ default: m.SafetyCenter })))
const BlockedUsers = lazy(() => import('@/features/safety/pages/BlockedUsers').then((m) => ({ default: m.BlockedUsers })))
const CommunityGuidelines = lazy(() => import('@/features/safety/pages/CommunityGuidelines').then((m) => ({ default: m.CommunityGuidelines })))
const HelpCenter = lazy(() => import('@/features/support/pages/HelpCenter').then((m) => ({ default: m.HelpCenter })))
const ContactSupport = lazy(() => import('@/features/support/pages/ContactSupport').then((m) => ({ default: m.ContactSupport })))

const AdminDashboard = lazy(() => import('@/features/admin/pages/AdminDashboard').then((m) => ({ default: m.AdminDashboard })))
const AdminUsers = lazy(() => import('@/features/admin/pages/AdminUsers').then((m) => ({ default: m.AdminUsers })))
const AdminVerification = lazy(() => import('@/features/admin/pages/AdminVerification').then((m) => ({ default: m.AdminVerification })))
const AdminJobs = lazy(() => import('@/features/admin/pages/AdminJobs').then((m) => ({ default: m.AdminJobs })))
const AdminReports = lazy(() => import('@/features/admin/pages/AdminReports').then((m) => ({ default: m.AdminReports })))

const NotFound = lazy(() => import('@/pages/NotFound').then((m) => ({ default: m.NotFound })))

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path={ROUTES.ONBOARDING} element={<Onboarding />} />
        <Route path={ROUTES.SELECT_ACCOUNT_TYPE} element={<SelectAccountType />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
        <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

        <Route path={ROUTES.COMPLETE_PROFILE} element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path={ROUTES.HOME} element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path={ROUTES.DISCOVER} element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path={ROUTES.ALL_SERVICES} element={<ProtectedRoute><AllServices /></ProtectedRoute>} />
        <Route path={ROUTES.LOCATION_PERMISSION} element={<ProtectedRoute><LocationPermission /></ProtectedRoute>} />
        <Route path={ROUTES.PROFESSIONAL_PROFILE} element={<ProtectedRoute><ProfessionalProfile /></ProtectedRoute>} />

        <Route path={ROUTES.FEED} element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path={ROUTES.CREATE_POST} element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path={ROUTES.POST_DETAILS} element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />

        <Route path={ROUTES.MY_JOBS} element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
        <Route path={ROUTES.CREATE_JOB} element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
        <Route path={ROUTES.JOB_REQUESTS} element={<ProtectedRoute><JobRequests /></ProtectedRoute>} />
        <Route path={ROUTES.JOB_DETAILS} element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />

        <Route path={ROUTES.CONVERSATIONS} element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
        <Route path={ROUTES.CHAT} element={<ProtectedRoute><ChatThread /></ProtectedRoute>} />
        <Route path={ROUTES.NOTIFICATIONS} element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path={ROUTES.JOB_TRACKING} element={<ProtectedRoute><JobTracking /></ProtectedRoute>} />

        <Route path={ROUTES.PROFILE} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path={ROUTES.EDIT_PROFESSIONAL_PROFILE} element={<ProtectedRoute><EditProfessionalProfile /></ProtectedRoute>} />
        <Route path={ROUTES.SETTINGS} element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path={ROUTES.SAVED} element={<ProtectedRoute><Saved /></ProtectedRoute>} />

        <Route path={ROUTES.SAFETY_CENTER} element={<ProtectedRoute><SafetyCenter /></ProtectedRoute>} />
        <Route path={ROUTES.BLOCKED_USERS} element={<ProtectedRoute><BlockedUsers /></ProtectedRoute>} />
        <Route path={ROUTES.COMMUNITY_GUIDELINES} element={<ProtectedRoute><CommunityGuidelines /></ProtectedRoute>} />
        <Route path={ROUTES.HELP_CENTER} element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
        <Route path={ROUTES.CONTACT_SUPPORT} element={<ProtectedRoute><ContactSupport /></ProtectedRoute>} />

        <Route path={ROUTES.ADMIN_DASHBOARD} element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_USERS} element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_VERIFICATION} element={<ProtectedRoute><AdminRoute><AdminVerification /></AdminRoute></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_JOBS} element={<ProtectedRoute><AdminRoute><AdminJobs /></AdminRoute></ProtectedRoute>} />
        <Route path={ROUTES.ADMIN_REPORTS} element={<ProtectedRoute><AdminRoute><AdminReports /></AdminRoute></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}