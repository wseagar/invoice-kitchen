'use client';
import React from 'react';
import { createId } from '@paralleldrive/cuid2';

import { makeAutoObservable } from 'mobx';
import { AppState } from './types';

const CURRENT_STATE_VERSION = '1';

function defaultInvoice(): AppState {
  return {
    identifier: createId(),
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
  state: AppState;

  constructor(serverState?: AppState) {
    this.state = serverState || defaultInvoice();
    // overrides this.state if it exists
    if (serverState === undefined) {
      this.loadFromLocalStorage();
    }

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

  sendInvoice = async (email: string, token: string) => {
    const invoice = this.state;

    const response = await fetch('/api/invoice', {
      method: 'POST',
      body: JSON.stringify({ email, invoice, token }),
    });

    if (response.status === 200) {
      return true;
    }

    return false;
  };
}

export let store: AppStateStore | undefined = undefined;
export let StoreContext: React.Context<AppStateStore> =
  undefined as unknown as React.Context<AppStateStore>;

export const initStore = (serverState?: AppState) => {
  if (!store) {
    const _store = new AppStateStore(serverState);
    store = _store;
    StoreContext = React.createContext(_store);
  }
  return store;
};

export const useAppStateStore = () => React.useContext(StoreContext!);
