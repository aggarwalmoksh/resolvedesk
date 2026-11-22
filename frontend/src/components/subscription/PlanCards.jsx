import React from 'react';
import { Check } from 'lucide-react';
import { PLAN_CATALOG } from '../../../../shared/plans';
import { formatMoney } from '../../lib/format';
import { Segments } from '../../workspace/controls';

export function BillingPeriod({ annual, onChange }) {
  return <Segments label="Billing period" value={annual} onChange={onChange}
    options={[[false, 'Monthly'], [true, 'Annual']]} />;
}

export function PlanCards({ annual, currentId, renderAction }) {
  return <div className="rd-plans">{PLAN_CATALOG.map(plan => {
    const current = plan.id === currentId;
    const price = annual ? plan.price_annual_monthly : plan.price_monthly;
    const capacity = plan.custom ? ['20+ Telegram bot connections', '30+ team member seats'] : [
      `${plan.max_bots} Telegram bot ${plan.max_bots === 1 ? 'connection' : 'connections'}`,
      `${plan.max_members} team member seats`,
    ];
    return <section className="rd-panel rd-plan" key={plan.id} data-current={current}>
      <div><h3>{plan.name}</h3><p className="rd-plan-description">{plan.description}</p></div>
      <div className="rd-plan-cost"><p><strong>{plan.custom ? 'Custom' : formatMoney(price, plan.currency)}</strong>
        {!plan.custom && ' / month'}</p>
        {annual && price > 0 && <small>{formatMoney(price * 12, plan.currency)} billed annually</small>}
      </div>
      <ul>{[...capacity, ...plan.features].map(feature => <li key={feature}><Check aria-hidden />{feature}</li>)}</ul>
      <div className="rd-plan-action">{current ? <span>Current plan</span> : renderAction(plan)}</div>
    </section>;
  })}</div>;
}
