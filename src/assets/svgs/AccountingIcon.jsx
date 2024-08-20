function AccountingIcon({ active }) {
  return (
    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.6678 19.1508V19.1642M16.0005 19.1508V19.1642M21.3333 19.1508V19.1642M10.6678 23.1504V23.1637M16.0005 23.1504V23.1637M21.3333 23.1504V23.1637M5.33508 7.1522C5.33508 6.44504 5.616 5.76684 6.11604 5.2668C6.61608 4.76676 7.29428 4.48584 8.00144 4.48584H23.9996C24.7068 4.48584 25.385 4.76676 25.885 5.2668C26.3851 5.76684 26.666 6.44504 26.666 7.1522V25.8167C26.666 26.5239 26.3851 27.2021 25.885 27.7021C25.385 28.2022 24.7068 28.4831 23.9996 28.4831H8.00144C7.29428 28.4831 6.61608 28.2022 6.11604 27.7021C5.616 27.2021 5.33508 26.5239 5.33508 25.8167V7.1522ZM10.6678 11.1517C10.6678 10.7982 10.8083 10.4591 11.0583 10.209C11.3083 9.95902 11.6474 9.81856 12.001 9.81856H20.0001C20.3537 9.81856 20.6928 9.95902 20.9428 10.209C21.1928 10.4591 21.3333 10.7982 21.3333 11.1517V12.4849C21.3333 12.8385 21.1928 13.1776 20.9428 13.4276C20.6928 13.6776 20.3537 13.8181 20.0001 13.8181H12.001C11.6474 13.8181 11.3083 13.6776 11.0583 13.4276C10.8083 13.1776 10.6678 12.8385 10.6678 12.4849V11.1517Z"
        stroke={active ? 'white' : '#676793'}
        strokeWidth="2.66636"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default AccountingIcon;
