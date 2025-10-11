// app/layout.jsx
export const metadata = { title: "Daily Words", description: "5 mots d’actualité" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
