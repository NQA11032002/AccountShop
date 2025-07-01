// hooks/useSession.ts
import { useEffect, useState } from 'react';

export function useSession() {
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('session_id');
        if (stored) {
            setSessionId(stored);
        }
    }, []);

    return sessionId;
}
