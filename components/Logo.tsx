type LogoProps = {
  className?: string
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 616.63 233.85"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          .str0 { stroke:#666666; stroke-width:3.91; stroke-miterlimit:22.9256 }
          .str1 { stroke:#999999; stroke-width:3.91; stroke-miterlimit:22.9256 }
          .fil0 { fill: currentColor }
          .fil1 { fill: #ED3237 }
        `}
      </style>

      <path
        className="fil0 str0"
        d="M3.76 23.98l73.63 0.04 95.48 135.65 84.07 -110.13c17.51,-20.09 40.64,-25.28 81.69,-25.59l199.5 0.04 -39.79 51.48 -140.86 -0.15c-48.71,0.77 -64.77,23.46 -81.58,50.25l-52.71 68.55c-35.28,49.24 -68.27,51.52 -99.78,-0.01l-119.66 -170.13z"
      />

      <path
        className="fil1 str1"
        d="M267.17 227.04l200.02 0.1c48,-0.62 76.3,-20.16 77.22,-65.98 -1.16,-37.66 -24.24,-58.57 -77.2,-56.68l-109.83 -0.3c-15.66,0.73 -23,-5.48 -21.71,-18.87 -20.99,7.79 -36.58,20.99 -47.68,38.67 13.15,15.36 36.47,22.24 69.4,21.12l109.82 0.48c27.57,-0.35 27.34,39.32 -0.86,39.32l-159.82 -0.03 -39.36 42.17z"
      />

      <polygon
        className="fil0 str1"
        points="549.93,95.85 612.08,31.93 612.08,227.23 549.93,227.23"
      />

      <polygon
        className="fil1 str1"
        points="549.92,2.1 612.08,1.96 549.92,67.73"
      />
    </svg>
  )
}
