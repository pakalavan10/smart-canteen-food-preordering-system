export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: 'badge-warning', icon: '⏳' },
  accepted: { label: 'Accepted', color: 'badge-info', icon: '✅' },
  preparing: { label: 'Preparing', color: 'badge-primary', icon: '🍳' },
  ready: { label: 'Ready', color: 'badge-success', icon: '🎉' },
  completed: { label: 'Completed', color: 'badge-success', icon: '✨' },
  cancelled: { label: 'Cancelled', color: 'badge-danger', icon: '❌' },
};

export const CATEGORIES_ICONS = {
  Breakfast: '🌅',
  Lunch: '🍛',
  Snacks: '🍟',
  Drinks: '🥤',
};

export const PICKUP_TIMES = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM',
];
