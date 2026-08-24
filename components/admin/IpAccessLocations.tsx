import { MapPin } from 'lucide-react';

import type { IpLocation } from '@/types/Onetimecode';

interface IpAccessLocationsProps {
  rawIp: string | null | undefined;
  details?: IpLocation[];
}

function parseIpList(rawIp: string | null | undefined): string[] {
  if (!rawIp) return [];

  try {
    const decoded: unknown = JSON.parse(rawIp);
    if (Array.isArray(decoded)) {
      return decoded
        .map((ip) => String(ip).trim())
        .filter(Boolean);
    }
  } catch {
    // Support legacy comma, semicolon, or line-separated values.
  }

  return rawIp
    .split(/[\n,;]+/)
    .map((ip) => ip.trim())
    .filter(Boolean);
}

export default function IpAccessLocations({ rawIp, details }: IpAccessLocationsProps) {
  const fallbackDetails: IpLocation[] = parseIpList(rawIp).map((ip) => ({
    ip,
    city: null,
    region: null,
    country: null,
    country_code: null,
    location: null,
  }));
  const locations = details && details.length > 0 ? details : fallbackDetails;

  if (locations.length === 0) {
    return <span className="text-xs text-gray-400">Chưa ghi nhận</span>;
  }

  return (
    <div className="min-w-[220px] space-y-2">
      {locations.map((item) => (
        <div key={item.ip} className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2">
          <div className="break-all font-mono text-xs font-medium text-gray-800">
            {item.ip}
          </div>
          <div className="mt-1 flex items-start gap-1 text-xs text-gray-600">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
            <span>{item.location || 'Không xác định được vị trí'}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
