import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8 text-center">
        <p>&copy; {new Date().getFullYear()} IntimaCare. All rights reserved.</p>
        <p className="text-gray-400 text-sm mt-2">Discreet shipping guaranteed</p>
      </div>
    </footer>
  );
};

export default Footer;
