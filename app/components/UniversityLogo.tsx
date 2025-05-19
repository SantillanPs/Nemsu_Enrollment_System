"use client";

import React from "react";

interface UniversityLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const UniversityLogo: React.FC<UniversityLogoProps> = ({
  width = 80,
  height = 80,
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Circle border */}
      <circle cx="100" cy="100" r="95" fill="#ffffff" stroke="#0047AB" strokeWidth="10" />
      
      {/* Inner circle */}
      <circle cx="100" cy="100" r="80" fill="#ffffff" stroke="#0047AB" strokeWidth="2" />
      
      {/* University shield */}
      <path
        d="M100 30 L140 50 L140 110 C140 140 100 160 100 160 C100 160 60 140 60 110 L60 50 Z"
        fill="#ffffff"
        stroke="#0047AB"
        strokeWidth="3"
      />
      
      {/* Book */}
      <rect x="75" y="70" width="50" height="40" fill="#ffffff" stroke="#0047AB" strokeWidth="2" />
      <path d="M100 70 L100 110" stroke="#0047AB" strokeWidth="2" />
      <path d="M75 75 L125 75" stroke="#0047AB" strokeWidth="1" />
      <path d="M75 85 L125 85" stroke="#0047AB" strokeWidth="1" />
      <path d="M75 95 L125 95" stroke="#0047AB" strokeWidth="1" />
      <path d="M75 105 L125 105" stroke="#0047AB" strokeWidth="1" />
      
      {/* Torch */}
      <path d="M100 40 L100 65" stroke="#0047AB" strokeWidth="3" />
      <path
        d="M100 40 C105 35 110 30 115 35 C120 40 115 45 110 50 C105 55 95 55 90 50 C85 45 80 40 85 35 C90 30 95 35 100 40"
        fill="#FFD700"
        stroke="#0047AB"
        strokeWidth="2"
      />
      
      {/* Text at the bottom */}
      <text
        x="100"
        y="130"
        fontFamily="Arial"
        fontSize="10"
        fontWeight="bold"
        textAnchor="middle"
        fill="#0047AB"
      >
        NEMSU
      </text>
      <text
        x="100"
        y="145"
        fontFamily="Arial"
        fontSize="6"
        textAnchor="middle"
        fill="#0047AB"
      >
        NORTH EASTERN MINDANAO
      </text>
      <text
        x="100"
        y="155"
        fontFamily="Arial"
        fontSize="6"
        textAnchor="middle"
        fill="#0047AB"
      >
        STATE UNIVERSITY
      </text>
    </svg>
  );
};

export default UniversityLogo;
