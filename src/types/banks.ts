export interface Bank {
  id: string;
  name: string;
  icon: string; // Image URL
}

export const BANKS: Bank[] = [
  {
    id: 'capitalone',
    name: 'CapitalOne',
    icon: '/banks/capitalone.png',
  },
  {
    id: 'triangle',
    name: 'Triangle (Canadian Tire)',
    icon: '/banks/triangle.png',
  },
  {
    id: 'amex',
    name: 'AMEX',
    icon: '/banks/amex.png',
  },
  {
    id: 'pcfinancial',
    name: 'PC Financial',
    icon: '/banks/pcfinancial.png',
  },
  {
    id: 'rbc',
    name: 'RBC',
    icon: '/banks/rbc.png',
  },
  {
    id: 'bmo',
    name: 'BMO',
    icon: '/banks/bmo.png',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    icon: '/banks/amazon.png',
  },
];

export function getBankById(id: string): Bank | undefined {
  return BANKS.find((bank) => bank.id === id);
}
