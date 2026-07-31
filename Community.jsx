import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Camera, MessageCircle, Users, ArrowRight, Vote as VoteIcon, Flame, Video } from 'lucide-react';
import EmojiShoutFeed from '@/components/EmojiShoutFeed';
import CatchOfMonthVote from '@/components/CatchOfMonthVote';
import DailyCheckIn from '@/components/DailyCheckIn';
import EpisodeReactions from '@/components/EpisodeReactions';

const FEATURES = [
  { to: '/Leaderboard', icon: Trophy, label: 'Leaderboard', desc: 'Climb the fan rankings' },
  { to: '/CatchBoard', icon: Camera, label: 'Catch Board', desc: 'Your personal catch dashboard' },
  { to: '/YouTube', icon: MessageCircle, label: 'On The Water', desc: 'Videos & live stats' },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <span className="text-[10px] tracking-[0.4em] text-[#E10000] uppercase">Where the crew gathers</span>
          <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-[#E2E8F0] uppercase leading-[0.9] mt-2 text-glow">
            Community
          </h1>
          <p className="text-sm text-[#E2E8F0]/50 max-w-xl mx-auto mt-4">
            Vote for Catch of the Month, build a daily check-in streak, react to the latest episode, and drop emojis in the crew feed. No typing required — just tap and join in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                className="group flex items-center gap-4 p-4 border border-[#1C1010] rounded-sm hover:border-[#E10000]/60 hover:bg-[#E10000]/5 transition-all lift-3d"
              >
                <div className="w-11 h-11 rounded-full border border-[#1C1010] bg-gradient-to-b from-[#2A1410] to-[#0E0808] flex items-center justify-center group-hover:border-[#E10000] transition-all">
                  <Icon className="w-5 h-5 text-[#E2E8F0]/70 group-hover:text-[#E10000] transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold text-sm text-[#E2E8F0] uppercase tracking-wide group-hover:text-[#E10000] transition-colors">{f.label}</p>
                  <p className="text-xs text-[#E2E8F0]/40">{f.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[#E2E8F0]/20 group-hover:text-[#E10000] group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>

        <div className="mb-4 flex items-center gap-2">
          <VoteIcon className="w-4 h-4 text-[#E10000]" />
          <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">Catch of the Month</h2>
        </div>
        <div className="mb-10"><CatchOfMonthVote /></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#E10000]" />
              <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">Daily Check-In</h2>
            </div>
            <DailyCheckIn />
          </div>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Video className="w-4 h-4 text-[#E10000]" />
              <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">React to the Latest Drop</h2>
            </div>
            <EpisodeReactions />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-[#E10000]" />
          <h2 className="font-heading font-bold text-lg text-[#E2E8F0] uppercase tracking-wide">Family Gathering</h2>
        </div>
        <EmojiShoutFeed />

        <p className="text-center text-[10px] text-[#E2E8F0]/30 tracking-[0.2em] uppercase mt-8">
          Tap to participate · Login required to vote & react
        </p>
      </div>
    </div>
  );
}