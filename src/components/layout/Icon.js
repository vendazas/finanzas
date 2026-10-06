const paths = {
  grid: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  wallet: "M4 7h15a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v3M16 13h4",
  arrows: "m7 7-3 3 3 3m-3-3h16m-3 4 3 3-3 3m3-3H4",
  chart: "M4 20V10m6 10V4m6 16v-7m6 7V7",
  card: "M3 6h18v12H3V6Zm0 4h18",
  receipt: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Z",
  target: "M12 3a9 9 0 1 0 9 9m-9-5v5h5m0-5 4-4",
  calendar: "M5 4v3m14-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  building: "M4 21V5l8-3 8 3v16M8 21v-4h8v4M8 8h1m6 0h1M8 12h1m6 0h1",
  report: "M5 3h10l4 4v14H5V3Zm9 0v5h5M8 12h8M8 16h6",
  settings: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2M3.5 12h2m13 0h2M5.99 5.99 7.4 7.4m9.2 9.2 1.41 1.41m0-12.02L16.6 7.4m-9.2 9.2-1.41 1.41",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M18 6 6 18",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
};

export function Icon({ name, className = "", size = 20 }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width={size}>
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
