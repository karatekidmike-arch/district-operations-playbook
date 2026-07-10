import './globals.css';

export const metadata = {
  title: 'District Operations Playbook',
  description: 'District budget and operations dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
