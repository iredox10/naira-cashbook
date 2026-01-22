import { usePrivacy } from '../context/PrivacyContext';
import { cn } from '../lib/utils';
import { ReactNode } from 'react';

export function PrivacyBlur({ children, className }: { children: ReactNode; className?: string }) {
  const { isPrivacyMode } = usePrivacy();

  return (
    <span className={cn("transition-all duration-300", isPrivacyMode && "blur-md select-none", className)}>
      {children}
    </span>
  );
}
