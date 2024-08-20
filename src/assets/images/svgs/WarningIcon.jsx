function WarningIcon({ stroke }) {
  return (
    <svg width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30.0005 20.25V36M57.2405 22.74V43.26C57.2405 46.62 55.4405 49.74 52.5305 51.45L34.7105 61.74C31.8005 63.42 28.2005 63.42 25.2605 61.74L7.44048 51.45C6.0058 50.6182 4.81528 49.4235 3.98853 47.9859C3.16177 46.5482 2.72789 44.9184 2.73048 43.26V22.74C2.73048 19.38 4.53048 16.26 7.44048 14.55L25.2605 4.26C28.1705 2.58 31.7705 2.58 34.7105 4.26L52.5305 14.55C55.4405 16.26 57.2405 19.35 57.2405 22.74Z"
        stroke={stroke ?? '#E56363'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M30 45.5996V45.8996" stroke={stroke ?? '#E56363'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default WarningIcon;
