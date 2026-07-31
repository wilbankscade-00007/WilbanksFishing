import React from 'react';

export default function LaunchVideo() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="font-heading font-bold text-2xl text-[#E2E8F0] uppercase mb-4">Website Launch Video</h2>
      <video
        controls
        className="w-full rounded-sm border border-[#1C1010]"
        src="https://media.base44.com/videos/public/6a5139318a957c718bd166bb/0bcca8f13_Site_Launch_Promo.mp4"
      />
      <p className="text-xs text-[#E2E8F0]/50 mt-3">
        Right-click the video → Save video as… to download and use it in your next YouTube upload.
      </p>
    </div>
  );
}