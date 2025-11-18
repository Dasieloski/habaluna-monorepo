'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { width: 48, height: 48 },
    md: { width: 64, height: 64 },
    lg: { width: 96, height: 96 },
  };

  const sizeConfig = sizes[size];

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: sizeConfig.width, height: sizeConfig.height }}>
      <img
        src="/logo.png"
        alt="Habanaluna Logo"
        width={sizeConfig.width}
        height={sizeConfig.height}
        className="object-contain w-full h-full"
      />
    </div>
  );
}

export function LogoWithText({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Logo size="md" />
    </div>
  );
}

