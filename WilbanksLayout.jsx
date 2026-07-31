import React from 'react';
import { Outlet } from 'react-router-dom';
import { CartProvider } from './CartContext';
import CursorGlow from './CursorGlow';
import Scene3DBackground from './Scene3DBackground';
import WilbanksNavbar from './WilbanksNavbar';
import CartDrawer from './CartDrawer';
import WilbanksFooter from './WilbanksFooter';
import LogoTransition from './LogoTransition';
import WhatsNewModal from './WhatsNewModal';
import LiveBanner from './LiveBanner';
import LoginPrompt from './LoginPrompt';

export default function WilbanksLayout() {
  return (
    <CartProvider>
      <Scene3DBackground />
      <LogoTransition />
      <CursorGlow />
      <WilbanksNavbar />
      <LiveBanner />
      <main>
        <Outlet />
      </main>
      <WilbanksFooter />
      <CartDrawer />
      <WhatsNewModal />
      <LoginPrompt />
    </CartProvider>
  );
}