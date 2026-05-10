import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  subtitle?: string;
  empty?: boolean;
}

export const StatCard = ({ title, value, icon, trend, subtitle, empty }: StatCardProps) => (
  <div className="bg-glass-dark border border-gold/10 p-6 rounded-3xl hover:border-gold/30 transition-all group shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      {trend && (
        <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full uppercase tracking-tighter">
          {trend}
        </span>
      )}
    </div>
    <p className="text-ash/60 text-sm font-medium uppercase tracking-widest">{title}</p>
    {empty ? (
      <p className="text-ash/40 text-sm font-medium mt-2">Hedef Belirlenmedi</p>
    ) : (
      <>
        <p className="text-3xl font-serif text-white mt-1">{value}</p>
        {subtitle && <p className="text-ash/50 text-xs mt-0.5">{subtitle}</p>}
      </>
    )}
  </div>
);