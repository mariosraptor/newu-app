export interface HealthMilestone {
  hours: number;
  title: string;
  description: string;
  addictionTypes: ('smoking' | 'vaping' | 'snus' | 'alcohol')[];
}

export const healthTimeline: HealthMilestone[] = [
  {
    hours: 0.33,
    title: '20 minutes: Heart rate normalizing',
    description: 'Your heart rate and blood pressure begin to drop to normal levels.',
    addictionTypes: ['smoking', 'vaping', 'snus'],
  },
  {
    hours: 2,
    title: '2 hours: Circulation improving',
    description: 'Nicotine levels in bloodstream drop. Peripheral circulation begins to improve.',
    addictionTypes: ['smoking', 'vaping', 'snus'],
  },
  {
    hours: 12,
    title: '12 hours: Carbon monoxide clearing',
    description: 'Carbon monoxide levels in blood drop to normal. Oxygen levels increase.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 24,
    title: '24 hours: Heart attack risk decreasing',
    description: 'Risk of heart attack begins to decrease.',
    addictionTypes: ['smoking', 'vaping', 'alcohol'],
  },
  {
    hours: 48,
    title: '48 hours: Senses returning',
    description: 'Nerve endings begin to regrow. Sense of smell and taste start to improve.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 72,
    title: '3 days: Breathing easier',
    description: 'Bronchial tubes relax, breathing becomes easier. Lung capacity increases.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 72,
    title: '3 days: Liver healing begins',
    description: 'Liver begins to heal and regenerate. Fat deposits start to decrease.',
    addictionTypes: ['alcohol'],
  },
  {
    hours: 168,
    title: '1 week: Skin clearing',
    description: 'Skin hydration improves. Complexion becomes clearer and more radiant.',
    addictionTypes: ['smoking', 'vaping', 'alcohol'],
  },
  {
    hours: 336,
    title: '2 weeks: Circulation improving',
    description: 'Circulation continues to improve. Walking and exercise become easier.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 504,
    title: '3 weeks: Neural pathways rewiring',
    description: 'New neural pathways become the default. Brain chemistry stabilizing.',
    addictionTypes: ['smoking', 'vaping', 'snus', 'alcohol'],
  },
  {
    hours: 720,
    title: '1 month: Lung function increasing',
    description: 'Lung function increases by up to 30%. Coughing and shortness of breath decrease.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 720,
    title: '1 month: Immune system strengthening',
    description: 'Immune system strengthens. Energy levels increase significantly.',
    addictionTypes: ['alcohol'],
  },
  {
    hours: 2160,
    title: '3 months: Fertility improving',
    description: 'Blood circulation improves throughout the body. Fertility increases.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 4380,
    title: '6 months: Airways healing',
    description: 'Cilia regrow in lungs. Airways clear more effectively.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 8760,
    title: '1 year: Heart disease risk halved',
    description: 'Risk of coronary heart disease is cut in half compared to a smoker.',
    addictionTypes: ['smoking', 'vaping'],
  },
  {
    hours: 8760,
    title: '1 year: Liver fully regenerated',
    description: 'Liver has fully regenerated to normal health (if no permanent damage).',
    addictionTypes: ['alcohol'],
  },
];

export function getRelevantMilestones(
  hoursSince: number,
  addictionTypes: string[]
): { current: HealthMilestone | null; next: HealthMilestone | null } {
  const relevant = healthTimeline.filter((m) =>
    m.addictionTypes.some((type) => addictionTypes.includes(type))
  );

  const current = relevant
    .filter((m) => m.hours <= hoursSince)
    .sort((a, b) => b.hours - a.hours)[0] || null;

  const next = relevant
    .filter((m) => m.hours > hoursSince)
    .sort((a, b) => a.hours - b.hours)[0] || null;

  return { current, next };
}
