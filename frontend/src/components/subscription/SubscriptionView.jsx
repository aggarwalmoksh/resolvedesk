import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { formatMoney } from '../../lib/format';
import { BillingPeriod, PlanCards } from './PlanCards';
import { PageHeading, WorkspaceDialog } from '../../workspace/controls';

export function SubscriptionView() {
  const { subscription, upgradePlan } = useData();
  const { user } = useAuth();
  const [choice, setChoice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { plan, usage, billing_period = 'monthly' } = subscription;
  const period = searchParams.get('period') || billing_period;
  const annual = period === 'annual';
  const currentId = ['scale', 'enterprise'].includes(plan.id) ? 'business' : plan.id;

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setError('');
    try { await upgradePlan(choice.id, choice.period); setChoice(null); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <>
    <PageHeading title="Plans and usage" description="Review capacity for Telegram bots and team seats." />
    <section className="rd-panel rd-billing-summary">
      <div><p>Current plan</p><h2>{plan.name}</h2>{plan.id === 'growth' && <p>{billing_period === 'annual' ? 'Annual' : 'Monthly'}</p>}</div>
      {[[ 'Telegram bots', usage.bots], ['Team seats', usage.team_members]].map(([label, resource]) => {
        const used = resource.total_used ?? resource.active ?? resource.current;
        return <div key={label}><label>{label} <strong>{used} / {resource.max}</strong></label>
          <progress aria-label={label} value={used} max={resource.max} /></div>;
      })}
    </section>
    <div className="rd-pricing-heading"><h2>Compare plans</h2><BillingPeriod annual={annual} onChange={value => setSearchParams({ period: value ? 'annual' : 'monthly' }, { replace: true })} /></div>
    <PlanCards annual={annual} currentId={currentId === 'growth' && period !== billing_period ? null : currentId} renderAction={item => {
      if (item.custom) return <Link className="rd-secondary" to="/contact">Talk to sales</Link>;
      return user.role === 'owner' && <button className={item.id === 'growth' ? 'rd-primary' : 'rd-secondary'}
        onClick={() => { setChoice({ ...item, period: item.id === 'growth' && annual ? 'annual' : 'monthly' }); setError(''); }}>Choose {item.id === 'growth' && annual ? 'annual Growth' : item.name}</button>;
    }} />
    {choice && <WorkspaceDialog title={`Switch to ${choice.name}?`} onClose={() => !busy && setChoice(null)}>
      <div className="rd-form">
        {choice.id === 'growth' && <p>{choice.period === 'annual'
          ? `${formatMoney(choice.price_annual_monthly * 12, choice.currency)} per year`
          : `${formatMoney(choice.price_monthly, choice.currency)} per month`}</p>}
        <p>{choice.max_bots} Telegram bots and {choice.max_members} team seats. Bots above your new limit may be paused.</p>
        {error && <p className="rd-form-error" role="alert">{error}</p>}
        <button className="rd-primary" disabled={busy} onClick={confirm}>{busy ? 'Changing plan…' : 'Confirm plan change'}</button>
      </div>
    </WorkspaceDialog>}
  </>;
}
