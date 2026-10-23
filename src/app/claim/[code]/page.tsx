import { redirect } from 'next/navigation';

export function generateStaticParams() {
  return [
    { code: 'GATE42DELAY' },
    { code: 'VIP-ROLEX-MET' },
    { code: 'MALDIVESFLY26' },
    { code: 'TUMITRANSIT' },
    { code: 'DUTYFREE2026' },
    { code: 'BOSEFLYER' },
    { code: 'SHACKKIDS' },
    { code: 'BLACKLANE26' },
  ];
}

export default async function ClaimCodePage({ params }: { params: Promise<{ code: string }> }) {
  const resolved = await params;
  redirect(`/claim?code=${encodeURIComponent(resolved.code)}`);
}
