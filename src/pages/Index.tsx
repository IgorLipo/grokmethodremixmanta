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

const transactions = [
  { id: '1', vendor: 'AWS Inc.', category: 'Infrastructure', amount: 2450, type: 'debit' as const },
  { id: '2', vendor: 'Stripe Payout', category: 'Merchant ID **88', amount: 14230.50, type: 'credit' as const },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Header />
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Key Metrics & Controls */}
          <section className="lg:col-span-4 space-y-6 animate-fade-in">
            <LiquidityHeroCard 
              totalLiquidity="$4,285,102"
              monthlyBurn="$324,000"
              runwayMonths={18}
            />
            
            {/* KPI Grid */}
            <div className="grid grid-cols-2 gap-4">
              <KPICard 
                title="ARR"
                value="$12.5M"
                icon={BarChart3}
                trend={{ direction: 'up', value: '+12.4%', label: 'vs last yr' }}
              />
              <KPICard 
                title="Gross Margin"
                value="78.2%"
                icon={PieChart}
                trend={{ direction: 'stable', value: 'Stable', label: 'target 80%' }}
              />
              <KPICard 
                title="LTV:CAC"
                value="4.1x"
                icon={Users}
                progress={82}
              />
              <KPICard 
                title="NDR"
                value="114%"
                icon={RefreshCw}
                progress={100}
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
