'use client';
import React from 'react';

import { makeAutoObservable } from 'mobx';

const CURRENT_STATE_VERSION = '1';

export type HeaderField = {
  label: string;
  value: string;
  placeholder: string;
};

export type AppState = {
  version: string;

  sidebarOpen: boolean;
  previewMode: boolean;

  currency: {
    name: string;
    value: string;
  };
  taxRate: number | null;
  logo: string | null;

  businessName: string;
  businessHeaderFreeText: string;
  headerFields: HeaderField[];
  invoiceSubheader: string;
  invoiceSubheaderFreeText: string;
  notesLabel: string;
  notesFreeText: string;

  lineItems: InvoiceLineItem[];
};

export type InvoiceLineItem = {
  name: string;
  description: string;
  quantity?: number;
  price?: number;
};

function defaultInvoice(): AppState {
  return {
    version: CURRENT_STATE_VERSION,
    sidebarOpen: false,
    previewMode: false,
    currency: {
      name: 'United States Dollar',
      value: 'USD',
    },
    taxRate: null,
    logo: null,

    businessName: '',
    businessHeaderFreeText: '',
    headerFields: [
      {
        label: 'INVOICE #',
        value: '',
        placeholder: 'INV-0001',
      },
      {
        label: 'DATE',
        value: new Date().toLocaleDateString(),
        placeholder: '01/01/2021',
      },
    ],
    invoiceSubheader: 'TAX INVOICE',
    invoiceSubheaderFreeText: '',
    notesLabel: 'NOTES',
    notesFreeText: '',

    lineItems: [],
  };
}

class AppStateStore {
  rootStore: RootStore;
  state: AppState;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.state = defaultInvoice();
    // overrides this.state if it exists
    this.loadFromLocalStorage();

    makeAutoObservable(this);
  }

  formatAsCurrency = (value: number) => {
    return Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.state.currency.value,
    }).format(value);
  };

  saveToLocalStorage = () => {
    window.localStorage.setItem('invoice-chef', JSON.stringify(this.state));
  };

  loadFromLocalStorage = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const savedState = window.localStorage.getItem('invoice-chef');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      if (parsedState.version === CURRENT_STATE_VERSION) {
        this.state = parsedState;
      }
    }
  };

  setState = <K extends keyof AppState>(key: K, value: AppState[K]): void => {
    this.state[key] = value;
    this.saveToLocalStorage();
  };

  newInvoice = () => {
    const previousInvoiceNumber = this.state.headerFields?.[0].value || '';
    // this may be a string but contains a number inside.
    // use a regex to extract the number part and increment it.

    const numberPart = previousInvoiceNumber.match(/\d+/)?.[0] || '';
    const numberLength = numberPart.length;

    const incrementedNumber = Number(numberPart) + 1;

    // Pad the incremented number with zeros to maintain the same number of digits.
    const paddedNumber = String(incrementedNumber).padStart(numberLength, '0');

    const newInvoiceNumber = previousInvoiceNumber.replace(
      numberPart,
      paddedNumber,
    );

    this.setState('lineItems', []);
    this.setState('headerFields', [
      {
        label: 'INVOICE #',
        value: newInvoiceNumber,
        placeholder: 'INV-0001',
      },
      {
        label: 'DATE',
        value: new Date().toLocaleDateString(),
        placeholder: '01/01/2021',
      },
    ]);
    this.setState('invoiceSubheaderFreeText', '');
  };

  clearInvoice = () => {
    this.state = defaultInvoice();
    this.saveToLocalStorage();
  };
}

export class RootStore {
  appStateStore: AppStateStore;

  constructor() {
    this.appStateStore = new AppStateStore(this);
  }
}

export const store = new RootStore();
export const StoreContext = React.createContext(store);

export const useRootStore = () => React.useContext(StoreContext);
export const useAppStateStore = () =>
  React.useContext(StoreContext).appStateStore;
