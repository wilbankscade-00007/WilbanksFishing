import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProductsTab from '@/components/admin/ProductsTab';
import SponsorsTab from '@/components/admin/SponsorsTab';
import AboutTab from '@/components/admin/AboutTab';
import VideosTab from '@/components/admin/VideosTab';
import TipsTab from '@/components/admin/TipsTab';
import BehindTheScenesTab from '@/components/admin/BehindTheScenesTab';
import SiteImagesTab from '@/components/admin/SiteImagesTab';
import CommentsTab from '@/components/admin/CommentsTab';
import MarqueePhotosTab from '@/components/admin/MarqueePhotosTab';
import CatchGalleryTab from '@/components/admin/CatchGalleryTab';
import StatsTab from '@/components/admin/StatsTab';
import YouTubeStatsTab from '@/components/admin/YouTubeStatsTab';
import WhatsNewTab from '@/components/admin/WhatsNewTab';
import GearTab from '@/components/admin/GearTab';
import UsersTab from '@/components/admin/UsersTab';
import ActiveUsersTab from '@/components/admin/ActiveUsersTab';

const TABS = [
  { id: 'users', label: 'Users', component: UsersTab },
  { id: 'active-now', label: 'Active Now', component: ActiveUsersTab },
  { id: 'stats', label: 'Site Stats', component: StatsTab },
  { id: 'products', label: 'Products', component: ProductsTab },
  { id: 'sponsors', label: 'Sponsors', component: SponsorsTab },
  { id: 'about', label: 'About Page', component: AboutTab },
  { id: 'videos', label: 'Videos', component: VideosTab },
  { id: 'tips', label: 'Tips', component: TipsTab },
  { id: 'gear', label: 'Gear', component: GearTab },
  { id: 'bts', label: 'Behind the Scenes', component: BehindTheScenesTab },
  { id: 'marquee1', label: 'Photo Marquee 1', component: MarqueePhotosTab, props: { entity: 'CatchPhoto' } },
  { id: 'marquee2', label: 'Photo Marquee 2', component: MarqueePhotosTab, props: { entity: 'PhotoMarquee2' } },
  { id: 'catch-gallery', label: 'Catch Gallery Marquee', component: CatchGalleryTab },
  { id: 'youtube-stats', label: 'YouTube Stats', component: YouTubeStatsTab },
  { id: 'whats-new', label: "What's New", component: WhatsNewTab },
  { id: 'comments', label: 'Comments', component: CommentsTab },
  { id: 'site-images', label: 'Background Photos', component: SiteImagesTab },
];

export default function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const activeTabConfig = TABS.find(t => t.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || ProductsTab;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-24">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-[0.3em] uppercase text-[#E2E8F0]/50 hover:text-[#E10000] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="mb-8">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Management</span>
          <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-[#E2E8F0] uppercase leading-[0.9] mt-2">
            Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 border-b border-[#1C1010] pb-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-xs uppercase tracking-wider rounded-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#E10000] text-white'
                  : 'border border-[#1C1010] text-[#E2E8F0]/60 hover:border-[#E10000] hover:text-[#E2E8F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ActiveComponent {...(activeTabConfig?.props || {})} />
      </div>
    </div>
  );
}