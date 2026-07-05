import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#14120F] text-[#F7F3EA] mt-auto font-['Work_Sans']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,400&family=Work+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
      `}</style>
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 text-center">
        <p className="font-display text-lg tracking-wide">
          &copy; {new Date().getFullYear()} IntimaCare. All rights reserved.
        </p>
        <p className="text-[#B7AC98] text-xs uppercase tracking-[0.2em] mt-3">
          Discreet shipping guaranteed
        </p>
      </div>
    </footer>
  );
};

export default Footer;
