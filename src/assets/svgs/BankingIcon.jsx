function BankingIcon({ active }) {
  return (
    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.00183 28.4794H27.9991M4.00183 13.8144H27.9991M6.66819 8.48172L16.0005 4.48218L25.3327 8.48172M5.33501 13.8144V28.4794M26.6659 13.8144V28.4794M10.6677 19.1472V23.1467M16.0005 19.1472V23.1467M21.3332 19.1472V23.1467"
        stroke={active ? 'white' : '#676793'}
        strokeWidth="2.66636"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default BankingIcon;
