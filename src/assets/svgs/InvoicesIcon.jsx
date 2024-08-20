function InvoicesIcon({ active }) {
  return (
    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.0004 9.81897H20.0006M12.0004 15.1525H20.0006M17.3339 20.486H20.0006M6.66687 28.4862V7.15222C6.66687 6.44496 6.94783 5.76666 7.44794 5.26655C7.94805 4.76643 8.62635 4.48547 9.33362 4.48547H22.6674C23.3746 4.48547 24.0529 4.76643 24.553 5.26655C25.0531 5.76666 25.3341 6.44496 25.3341 7.15222V28.4862L21.334 25.8195L18.6672 28.4862L16.0005 25.8195L13.3337 28.4862L10.667 25.8195L6.66687 28.4862Z"
        stroke={active ? 'white' : '#676793'}
        strokeWidth="2.66675"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default InvoicesIcon;
