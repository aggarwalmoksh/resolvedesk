import { driver } from 'driver.js';

export const startProductTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    overlayOpacity: 0.5,
    popoverClass: 'driverjs-theme',
    steps: [
      {
        element: '#tour-brand-header',
        popover: {
          title: 'Welcome to ResolveDesk',
          description: "Transforming unorganized Telegram chats into an automated, multi-agent complaint command center for growing businesses.",
          side: 'bottom',
          align: 'start'
        }
      },
      {
        element: '#tour-profile-btn',
        popover: {
          title: 'Business Profile Dashboard',
          description: 'Click anytime to view your business overview, shared organization details, bot allocations, and your granted permissions.',
          side: 'bottom',
          align: 'end'
        }
      },
      {
        element: '#tour-stats-grid',
        popover: {
          title: 'Real-Time Complaint Metrics',
          description: 'Live counts of total incoming Telegram tickets, closed resolutions, and in-progress complaints with real-time resolution rate.',
          side: 'bottom',
          align: 'center'
        }
      },
      {
        element: '#tour-nav-complaints',
        popover: {
          title: 'Complaints Stack & Inbox',
          description: 'View all stacked Telegram complaints, inspect message threads, audit who worked on it, update status, and reply directly back to Telegram.',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#tour-nav-team',
        popover: {
          title: 'Roles & Granular Permissions',
          description: 'Invite business partners and staff via email (GitHub-style). Control exactly who can reply to customers, update ticket status, and assign tickets.',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#tour-nav-bots',
        popover: {
          title: 'Multi-Bot Integrations',
          description: 'Connect and manage Telegram bots via Bot Token. Automatically generate secure webhook endpoints for instant message ingestion.',
          side: 'right',
          align: 'center'
        }
      },
      {
        element: '#tour-nav-subscription',
        popover: {
          title: 'Subscription Tiers (in Rupees)',
          description: 'Easily scale across Starter (₹399), Growth (₹599), and Pro Enterprise (₹999) tiers as your bot and team requirements expand.',
          side: 'right',
          align: 'center'
        }
      }
    ]
  });

  driverObj.drive();
};
