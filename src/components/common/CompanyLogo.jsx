import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

const CompanyLogo = ({ logo, name, className = "w-12 h-12", iconSize = "w-6 h-6", textClassName = "text-lg" }) => {
  const [imgError, setImgError] = useState(false);
  
  // Try to generate a candidate domain from the name
  const candidateDomain = name?.toLowerCase().replace(/[^a-z0-9]/g, '') + ".com";
  const clearbitUrl = `https://logo.clearbit.com/${candidateDomain}`;
  const uiAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'C')}&background=random&color=fff&bold=true`;

  const finalLogo = logo && logo.startsWith('http') ? logo : (imgError ? uiAvatarUrl : (logo ? logo : clearbitUrl));

  if (!name && !logo) {
    return (
      <div className={`${className} rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400`}>
        <Building2 className={iconSize} />
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg bg-white dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-all duration-300`}>
      <img
        src={finalLogo}
        alt={name}
        className="w-full h-full object-contain p-0.5"
        onError={(e) => {
          if (!imgError) {
            setImgError(true);
          } else {
            // If even UI Avatar fails (unlikely), show icon
            e.target.style.display = 'none';
          }
        }}
      />
    </div>
  );
};

export default CompanyLogo;
