import IncomeIcon from '../assets/images/Income-icon.svg';
import ExpenseIcon from '../assets/images/Expenses-icon.svg';
import PurchaseIcon from '../assets/images/Purchase-icon.svg';
import CreditIcon from '../assets/images/credit-icon.svg';
import ArrowDropUp from '../assets/images/Arrow_drop_up.svg';
import ArrowDropDown from '../assets/images/Arrow_drop_down.svg';
import StachFrameFill from '../assets/images/Stackframe_fill.svg';

export const Cards = [
  {
    label: 'SALES',
    cost: '3,423',
    currency: 'LBL_SAR',
    imgSrc: IncomeIcon,
  },
  {
    label: 'EXPENSES',
    cost: '1,033',
    currency: 'LBL_SAR',
    imgSrc: ExpenseIcon,
  },
  {
    label: 'PURCHASE',
    cost: '423',
    currency: 'LBL_SAR',
    imgSrc: PurchaseIcon,
  },
  {
    label: 'CREDIT',
    cost: '932',
    currency: 'LBL_SAR',
    imgSrc: CreditIcon,
  },
];

export const SalesOverviewLabels = [
  { label: 'NEW', className: 'info-1', iconClassName: 'info-color-1' },
  { label: 'CURRENT', className: 'info-2', iconClassName: 'info-color-2' },
  { label: 'POTENTIAL', className: 'info-3', iconClassName: 'info-color-3' },
  { label: 'TERMINATED', className: 'info-4', iconClassName: 'info-color-3' },
];

export const SalesOverviewMonths = ['MONTHS.OCT', 'MONTHS.NOV', 'MONTHS.DEC', 'MONTHS.JAN', 'MONTHS.DEC', 'MONTHS.JAN'];

export const SalesOverviewSVG = [
  {
    path: 'M736.991 13.4181 H854.452C862.501 13.4181 869.034 19.9422 869.034 27.9796C869.034 36.017 862.501 42.5411 854.452 42.5411 H736.991V13.4181 Z',
    fill: '#5055C3',
  },
  {
    path: 'M283.036 13.4181H93.0032V42.5075H283.036V13.4181Z',
    fill: '#656CEE',
  },
  { path: 'M737 13H283V43H737V13Z', fill: '#B7B6F6' },
  { path: 'M671 105H181V134H671V105Z', fill: '#999BF6' },
  {
    path: 'M93.0033 13.4181H0.866394V42.5075H93.0033V13.4181Z',
    fill: '#999BF6',
  },
  {
    path: 'M501.597 59.1877H603.904C611.953 59.1877 618.486 65.7117 618.486 73.7492C618.486 81.7866 611.953 88.277 603.904 88.277H501.597V59.1877Z',
    fill: '#B7B6F6',
  },
  { path: 'M502 59H69V88H502V59Z', fill: '#656CEE' },
  {
    path: 'M68.9925 59.1877H0.866394V88.277H68.9925V59.1877Z',
    fill: '#999BF6',
  },
  {
    path: 'M584.372 150.693H675.87C683.918 150.693 690.451 157.217 690.451 165.255C690.451 173.292 683.918 179.783 675.87 179.783H584.372V150.693Z',
    fill: '#B7B6F6',
  },
  {
    path: 'M224.339 150.693H68.9924V179.783H224.339V150.693Z',
    fill: '#5055C3',
  },
  { path: 'M613 151H224V180H613V151Z', fill: '#656CEE' },
  {
    path: 'M68.9925 150.693H0.866394V179.783H68.9925V150.693Z',
    fill: '#656CEE',
  },
  {
    path: 'M721.669 104.924H768.613C776.661 104.924 783.194 111.448 783.194 119.485C783.194 127.522 776.661 134.047 768.613 134.047H721.669V104.957V104.924Z',
    fill: '#656CEE',
  },
  {
    path: 'M721.669 104.924H671.256V134.013H721.669V104.924Z',
    fill: '#B7B6F6',
  },
  {
    path: 'M180.594 104.924H0.866394V134.013H180.594V104.924Z',
    fill: '#5055C3',
  },
  { path: 'M1.33784 0H0.428589V193.201H1.33784V0Z', fill: '#B7B6F6' },
];

export const TopCustomers = [
  {
    name: 'Customer 1',
    imgSrc: ArrowDropUp,
    cost: '5,013.00',
    currency: 'LBL_SAR',
    className: 'up',
  },
  {
    name: 'Customer 2',
    imgSrc: ArrowDropDown,
    cost: '8,888.00',
    currency: 'LBL_SAR',
    className: 'down',
  },
  {
    name: 'Customer 3',
    imgSrc: ArrowDropUp,
    cost: '3,777.00',
    currency: 'LBL_SAR',
    className: 'up',
  },
  {
    name: 'Customer 4',
    imgSrc: ArrowDropUp,
    cost: '5,223.00',
    currency: 'LBL_SAR',
    className: 'up',
  },
  {
    name: 'Customer 5',
    imgSrc: ArrowDropDown,
    cost: '9,423.00',
    currency: 'LBL_SAR',
    className: 'down',
  },
];

export const Liquidity = [
  {
    label: 'TOTAL_BANK_BALANCE',
    balance: '2,033.00',
    currency: 'LBL_SAR',
    chartPercentage: '75',
    circles: [
      {
        className: 'circle-chart__background',
        cx: '16.9',
        cy: '16.9',
        r: '17',
      },
      {
        className: 'circle-chart__circle stroke-1',
        strokeDasharray: '75,100',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
    ],
  },
  {
    label: 'TOTAL_BANK_BALANCE',
    balance: '7,033.00',
    currency: 'LBL_SAR',
    chartPercentage: '75',
    circles: [
      {
        className: 'circle-chart__background',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
      {
        className: 'circle-chart__circle stroke-1',
        strokeDasharray: '75,100',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
    ],
  },
];

export const DateOptions = [
  { name: 'Today', value: '' },
  { name: 'One', value: '1' },
  { name: 'Two', value: '2' },
  { name: 'Three', value: '3' },
];

export const InvoicingOverview = [
  {
    dataPercentage: '75',
    circles: [
      {
        className: 'circle-chart__background',
        cx: '16.9',
        cy: '16.9',
        r: '17',
      },
      {
        className: 'circle-chart__circle stroke-1',
        strokeDasharray: '75,100',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
    ],
  },
  {
    dataPercentage: '75',
    circles: [
      {
        className: 'circle-chart__background',
        cx: '16.9',
        cy: '16.9',
        r: '17',
      },
      {
        className: 'circle-chart__circle stroke-2',
        strokeDasharray: '75,100',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
    ],
  },
  {
    dataPercentage: '75',
    circles: [
      {
        className: 'circle-chart__background',
        cx: '16.9',
        cy: '16.9',
        r: '17',
      },
      {
        className: 'circle-chart__circle stroke-3',
        strokeDasharray: '75,100',
        cx: '16.9',
        cy: '16.9',
        r: '15.9',
      },
    ],
  },
];

export const InvoicingOverviewLabels = [
  { label: 'CASH', className: 'info-1', iconClassName: 'info-color-1' },
  { label: 'CASH', className: 'info-2', iconClassName: 'info-color-2' },
  { label: 'CASH', className: 'info-3', iconClassName: 'info-color-3' },
];

export const InvoicesBarColors = [{ className: 'i-color-1' }, { className: 'i-color-2' }, { className: 'i-color-3' }];

export const IncomeOverview = [
  {
    className: 'cel-di-next-1',
    label: 'TOTAL_INCOME',
    amount: '2,033.00',
    currency: 'LBL_SAR',
  },
  {
    className: 'cel-di-next-2 float-start',
    label: 'TOTAL_EXPANSES',
    amount: '5,013.00',
    currency: 'LBL_SAR',
  },
  {
    className: 'cel-di-next-3 float-end',
    label: 'TOTAL_PURCHASING',
    amount: '2,020.00',
    currency: 'LBL_SAR',
  },
];

export const TopItems = [
  { label: 'ITEM_NAME', amount: '322', imgSrc: StachFrameFill },
  { label: 'ITEM_NAME', amount: '322', imgSrc: StachFrameFill },
  { label: 'ITEM_NAME', amount: '322', imgSrc: StachFrameFill },
  { label: 'ITEM_NAME', amount: '322', imgSrc: StachFrameFill },
  { label: 'ITEM_NAME', amount: '322', imgSrc: StachFrameFill },
];

export const OpenInvoices = [
  {
    label: 'CUSTOMERS',
    amount: '7,033.00',
    currency: 'LBL_SAR',
    unpaid: '2,020.00',
    ref: '/banking',
  },
  {
    label: 'SUPPLIERS',
    amount: '9,033.00',
    currency: 'LBL_SAR',
    unpaid: '5,020.00',
    ref: '/banking',
  },
];
