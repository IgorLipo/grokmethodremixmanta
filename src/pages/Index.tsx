import { Header } from "@/components/dashboard/Header";
import { LiquidityHeroCard } from "@/components/dashboard/LiquidityHeroCard";
import { KPICard } from "@/components/dashboard/KPICard";
import { LiveLedger } from "@/components/dashboard/LiveLedger";
import { BudgetUtilization } from "@/components/dashboard/BudgetUtilization";
import { AccountsPayable } from "@/components/dashboard/AccountsPayable";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { SpendMixChart } from "@/components/dashboard/SpendMixChart";
import { TeamActivity } from "@/components/dashboard/TeamActivity";
import { BarChart3, PieChart, Users, RefreshCw } from "lucide-react";
import { 
  dashboardMetrics, 
  transactions, 
  currentPeriod 
} from "@/data/mockDashboard";

const Index = () => {
  const { liquidity, arr, gross_margin, ltv_cac, ndr } = dashboardMetrics;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Header period={currentPeriod} />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Key Metrics & Controls */}
          <section className="lg:col-span-4 space-y-6 animate-fade-in">
            <LiquidityHeroCard 
              totalLiquidity={`$${liquidity.total.toLocaleString()}`}
              monthlyBurn={`$${liquidity.burn.toLocaleString()}`}
              runwayMonths={liquidity.runway_months}
            />
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
              <KPICard 
                title="ARR"
                value={`$${(arr.value / 1000000).toFixed(1)}M`}
                icon={BarChart3}
                trend={{ 
                  direction: arr.change_pct > 0 ? 'up' : 'stable', 
                  value: `+${arr.change_pct}%`, 
                  label: 'vs last yr' 
                }}
              />
              <KPICard 
                title="Gross Margin"
                value={`${gross_margin.value}%`}
                icon={PieChart}
                trend={{ 
                  direction: 'stable', 
                  value: 'Stable', 
                  label: `target ${gross_margin.target}%` 
                }}
              />
              <KPICard 
                title="LTV:CAC"
                value={`${ltv_cac.value}x`}
                icon={Users}
                progress={ltv_cac.progress}
              />
              <KPICard 
                title="NDR"
                value={`${ndr.value}%`}
                icon={RefreshCw}
                progress={ndr.progress}
              />
            </div>
            
            <LiveLedger transactions={transactions} />
          </section>

          {/* MIDDLE COLUMN: Detailed Reports */}
          <section className="lg:col-span-5 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <BudgetUtilization />
            <AccountsPayable />
          </section>

          {/* RIGHT COLUMN: Analytics & Audit */}
          <section className="lg:col-span-3 space-y-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <CashFlowChart />
            <SpendMixChart />
            <TeamActivity />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
