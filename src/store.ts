"use client";
import React from "react";

import { makeAutoObservable } from "mobx";

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<U[keyof U]>;
type PartialPaths<T> = {
  [K in keyof T]: T[K] extends object ? T[K] | PartialPaths<T[K]> : T[K];
};

export type HeaderField = {
  label: string;
  value: string;
  placeholder: string;
};

export type AppState = {
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

class AppStateStore {
  rootStore: RootStore;
  state: AppState;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.state = {
      sidebarOpen: false,
      previewMode: false,
      currency: {
        name: "United States Dollar",
        value: "USD",
      },
      taxRate: null,
      logo: null,

      businessName: "",
      businessHeaderFreeText: "",
      headerFields: [
        {
          label: "INVOICE #",
          value: "",
          placeholder: "INV-0001",
        },
        {
          label: "DATE",
          value: "",
          placeholder: "01/01/2021",
        },
      ],
      invoiceSubheader: "TAX INVOICE",
      invoiceSubheaderFreeText: "",
      notesLabel: "NOTES",
      notesFreeText: "",

      lineItems: [],
    };

    makeAutoObservable(this);
  }

  formatAsCurrency = (value: number) => {
    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.state.currency.value,
    }).format(value);
  };

  setState = <K extends keyof AppState>(key: K, value: AppState[K]): void => {
    this.state[key] = value;
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
