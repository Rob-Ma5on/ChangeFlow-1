import { Button } from "@/components/ui/button";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  return (
    <header className="bg-card shadow-sm border-b border-border p-6" data-testid="topbar">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground" data-testid="text-page-title">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1" data-testid="text-page-subtitle">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {actions}
          <button 
            className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            data-testid="button-notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5V7a1 1 0 011-1h5m-5 10v-5a1 1 0 00-1-1H4a1 1 0 00-1 1v5a1 1 0 001 1h5z" />
            </svg>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center" data-testid="badge-notifications">
              5
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
