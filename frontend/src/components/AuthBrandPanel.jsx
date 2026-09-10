import React from 'react';
import heroImage from '../assets/hero.png';

const AuthBrandPanel = () => (
  <section className="relative hidden min-h-screen overflow-hidden bg-[#12132d] lg:block">
    <img
      src={heroImage}
      alt="ProjectPulse project management workspace"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  </section>
);

export default AuthBrandPanel;
