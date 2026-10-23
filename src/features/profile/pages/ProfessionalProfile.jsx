import { useState } from 'react'
import { useNavigate, useParams } from 'react'
import {
  ChevronLeft,
  Share2,
  MoreVertical,
  CheckCircle2,
  Star,
  MessageCircle,
  Phone,
  Heart,
  ChevronDown,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function ProfessionalProfile() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isFavorite, setIsFavorite] = useState(false)

  // Demo state/data representing profile payload
  const pro = {
    id: id || 'pro-1',
    name: 'Tunde Plumbing',
    badge: 'Top Pro',
    category: 'Plumbing Specialist',
    location: 'Yaba, Lagos',
    rating: 4.9,
    reviewsCount: 128,
    avatar: '/images/tunde.jpg',
    isVerified: true,
    stats: {
      experience: '5+',
      jobsDone: 238,
      onTime: '98%',
      repeatClients: '92%',
    },
    availability: '7:00 AM - 8:00 PM',
    services: [
      { name: 'Pipe Installation', price: 'From ₦15,000' },
      { name: 'Leak Repair', price: 'From ₦7,000' },
      { name: 'Bathroom Fittings', price: 'From ₦25,000' },
    ],
    featuredWork: [
      { id: 1, title: 'Kitchen pipe fix', location: 'Yaba, Lagos', image: '/images/work1.jpg' },
      { id: 2, title: 'Water heater install', location: 'Surulere, Lagos', image: '/images/work2.jpg' },
      { id: 3, title: 'Bathroom upgrade', location: 'Ikoyi, Lagos', image: '/images/work3.jpg' },
    ],
    topReview: {
      author: 'Chinedu A.',
      rating: 5.0,
      date: '2 days ago',
      avatar: '/images/user-review.jpg',
      comment:
        'Tunde came early, fixed the problem and explained everything. Very professional and neat work!',
    },
  }

  return (
    <div className="min-h-dvh bg-bg pb-24">
      <div className="mobile-shell mx-auto max-w-2xl bg-surface min-h-dvh">
        {/* Top Action Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink">
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-5 pt-4">
          {/* Main Profile Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={pro.avatar}
                alt={pro.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-emerald-600"
              />
              <div>
                <div className="flex items-center gap-1">
                  <h1 className="text-lg font-bold text-ink">{pro.name}</h1>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-600/20" />
                </div>
                <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                  ★ {pro.badge}
                </span>
                <p className="text-xs text-muted mt-0.5">{pro.category}</p>
                <p className="text-xs text-muted">{pro.location}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-emerald-50/50 p-2.5 text-center">
              <div className="text-base font-extrabold text-ink">{pro.rating}</div>
              <div className="flex justify-center text-amber-500 my-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[10px] font-medium text-muted">({pro.reviewsCount} reviews)</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-border bg-bg p-3 text-center">
            <div>
              <p className="text-sm font-bold text-ink">{pro.stats.experience}</p>
              <p className="text-[10px] text-muted">Years Exp.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{pro.stats.jobsDone}</p>
              <p className="text-[10px] text-muted">Jobs done</p>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{pro.stats.onTime}</p>
              <p className="text-[10px] text-muted">On-time</p>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{pro.stats.repeatClients}</p>
              <p className="text-[10px] text-muted">Repeat clients</p>
            </div>
          </div>

          {/* Availability and Contact Quick Actions */}
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="text-xs font-bold text-ink">Available today</p>
                <p className="text-[11px] text-muted flex items-center gap-1">
                  {pro.availability} <ChevronDown className="h-3 w-3" />
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-ink">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Phone className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Services & Pricing */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-ink">Services & Pricing</h2>
              <button className="text-xs font-semibold text-emerald-600">See all</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {pro.services.map((svc, i) => (
                <div key={i} className="min-w-[130px] rounded-2xl border border-border bg-bg p-3">
                  <p className="text-xs font-bold text-ink">{svc.name}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-600">{svc.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Work */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-ink">Featured work</h2>
              <button className="text-xs font-semibold text-emerald-600">View gallery</button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {pro.featuredWork.map((work) => (
                <div key={work.id} className="w-36 shrink-0 rounded-2xl border border-border bg-surface p-2">
                  <img src={work.image} alt="" className="h-24 w-full rounded-xl object-cover mb-1.5" />
                  <p className="text-xs font-bold text-ink truncate">{work.title}</p>
                  <p className="text-[10px] text-muted truncate">{work.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-6">
            <h2 className="text-sm font-bold text-ink mb-2">What customers say</h2>
            <div className="rounded-2xl border border-border bg-bg p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img src={pro.topReview.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  <span className="text-xs font-bold text-ink">{pro.topReview.author}</span>
                  <span className="text-xs font-bold text-amber-500">★ {pro.topReview.rating}</span>
                </div>
                <span className="text-[10px] text-muted">{pro.topReview.date}</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">{pro.topReview.comment}</p>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Request CTA */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-surface p-4">
          <div className="mx-auto flex max-w-2xl items-center gap-3">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-ink"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-danger text-danger' : ''}`} />
            </button>
            <Button
              className="flex-1 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700"
              onClick={() => navigate(`/request-service/${pro.id}`)}
            >
              Request Service
              <span className="block text-[10px] font-normal opacity-90">Get a response within minutes</span>
            </Button>
            <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-border text-ink">
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}