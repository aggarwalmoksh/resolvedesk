import React from 'react';
import { cn } from '../lib/cn';

/* ==========================================================================
   BASE SKELETON
   Single-sweep shimmer effect, no endless distraction
   ========================================================================== */

export function Skeleton({ className, radius = 'md', width, height, style }) {
  const radii = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
    xl: 'rounded-[var(--radius-xl)]',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn('skeleton', radii[radius] || radii.md, className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}

/* ==========================================================================
   PAGE SKELETON (Generic fallback)
   ========================================================================== */

export function PageSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-44" radius="md" />
          <Skeleton className="h-3.5 w-64" radius="sm" />
        </div>
        <Skeleton className="h-9 w-28" radius="md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <Skeleton className="h-3 w-20" radius="sm" />
            <Skeleton className="h-7 w-16" radius="md" />
          </div>
        ))}
      </div>

      <div className="card p-5 space-y-4">
        <Skeleton className="h-4 w-32" radius="sm" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border-default/50 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" radius="full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-48" radius="sm" />
                  <Skeleton className="h-2.5 w-32" radius="sm" />
                </div>
              </div>
              <Skeleton className="h-5 w-16" radius="full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   DASHBOARD SKELETON
   ========================================================================== */

export function DashboardSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" radius="md" />
          <Skeleton className="h-3.5 w-56" radius="sm" />
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <Skeleton className="h-3 w-24" radius="sm" />
            <Skeleton className="h-8 w-16" radius="md" />
          </div>
        ))}
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card p-5 space-y-4">
          <Skeleton className="h-4 w-36" radius="sm" />
          <div className="space-y-3 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28" radius="sm" />
                  <Skeleton className="h-3 w-12" radius="sm" />
                </div>
                <Skeleton className="h-2 w-full" radius="full" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <Skeleton className="h-4 w-28" radius="sm" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-10 w-full" radius="md" />
            <Skeleton className="h-10 w-full" radius="md" />
          </div>
        </div>
      </div>

      {/* Recent complaints table skeleton */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-40" radius="sm" />
          <Skeleton className="h-7 w-20" radius="md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-border-default/50 last:border-0">
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-60" radius="sm" />
                <Skeleton className="h-2.5 w-36" radius="sm" />
              </div>
              <Skeleton className="h-5 w-20" radius="full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   COMPLAINTS / INBOX SKELETON
   ========================================================================== */

export function ComplaintsSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-24" radius="md" />
          <Skeleton className="h-3.5 w-48" radius="sm" />
        </div>
        <Skeleton className="h-5 w-16" radius="full" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64 flex-1" radius="md" />
        <Skeleton className="h-9 w-32" radius="md" />
        <Skeleton className="h-9 w-36" radius="md" />
      </div>

      {/* Complaint rows */}
      <div className="card divide-y divide-border-default">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <Skeleton className="h-9 w-9" radius="full" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-3.5 w-64 max-w-full" radius="sm" />
                <Skeleton className="h-2.5 w-40" radius="sm" />
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Skeleton className="h-5 w-16" radius="full" />
              <Skeleton className="h-3 w-12" radius="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   SUBSCRIPTION / BILLING SKELETON
   ========================================================================== */

export function SubscriptionSkeleton({ className }) {
  return (
    <div className={cn('space-y-8 animate-stagger-in', className)} aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-32" radius="md" />
        <Skeleton className="h-3.5 w-52" radius="sm" />
      </div>

      {/* Usage metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-24" radius="sm" />
              <Skeleton className="h-3.5 w-12" radius="sm" />
            </div>
            <Skeleton className="h-2 w-full" radius="full" />
          </div>
        ))}
      </div>

      {/* 3 Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" radius="sm" />
              <Skeleton className="h-8 w-28" radius="md" />
              <Skeleton className="h-3 w-40" radius="sm" />
            </div>
            <div className="space-y-3 pt-3 border-t border-border-default">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3 w-3/4" radius="sm" />
              ))}
            </div>
            <Skeleton className="h-10 w-full" radius="md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   BOTS SKELETON
   ========================================================================== */

export function BotsSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-36" radius="md" />
          <Skeleton className="h-3.5 w-52" radius="sm" />
        </div>
        <Skeleton className="h-9 w-28" radius="md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" radius="sm" />
                <Skeleton className="h-3 w-24" radius="sm" />
              </div>
              <Skeleton className="h-2.5 w-2.5" radius="full" />
            </div>
            <div className="pt-3 border-t border-border-default flex gap-2">
              <Skeleton className="h-8 flex-1" radius="md" />
              <Skeleton className="h-8 w-8" radius="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   TEAM SKELETON
   ========================================================================== */

export function TeamSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" radius="md" />
          <Skeleton className="h-3.5 w-48" radius="sm" />
        </div>
        <Skeleton className="h-9 w-32" radius="md" />
      </div>

      <div className="card divide-y divide-border-default">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9" radius="full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" radius="sm" />
                <Skeleton className="h-2.5 w-44" radius="sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-16" radius="full" />
              <Skeleton className="h-7 w-7" radius="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   SETTINGS SKELETON
   ========================================================================== */

export function SettingsSkeleton({ className }) {
  return (
    <div className={cn('space-y-6 animate-stagger-in', className)} aria-busy="true">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-28" radius="md" />
        <Skeleton className="h-3.5 w-44" radius="sm" />
      </div>

      <div className="flex gap-2 border-b border-border-default pb-3">
        <Skeleton className="h-7 w-20" radius="md" />
        <Skeleton className="h-7 w-24" radius="md" />
        <Skeleton className="h-7 w-20" radius="md" />
      </div>

      <div className="card p-6 space-y-5 max-w-xl">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" radius="sm" />
          <Skeleton className="h-9 w-full" radius="md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" radius="sm" />
          <Skeleton className="h-9 w-full" radius="md" />
        </div>
      </div>
    </div>
  );
}
