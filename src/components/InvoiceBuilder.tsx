'use client';

import React, { ChangeEvent } from 'react';
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Sidebar } from './Sidebar';
import { StoreContext, store, useAppStateStore } from '@/store';
import { observer } from 'mobx-react-lite';

export function cx(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface InputProps {
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  label?: string;
  isTextArea?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLabelChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  [key: string]: any;
}

const Input: React.FC<InputProps> = ({
  className,
  labelClassName,
  placeholder,
  label,
  onLabelChange,
  isTextArea,
  value,
  onChange,
  ...rest
}) => {
  return (
    <div className={className}>
      {label && (
        <input
          value={label}
          onChange={onLabelChange}
          className={labelClassName}
        ></input>
      )}
      {isTextArea ? (
        <textarea
          className="w-full"
          rows={3}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...rest}
        />
      ) : (
        <input
          className="w-full"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...rest}
        />
      )}
    </div>
  );
};

export default function InvoiceBuilderWrapper() {
  return (
    <StoreContext.Provider value={store}>
      <InvoiceBuilder />
    </StoreContext.Provider>
  );
}

const InvoiceBuilder = observer(() => {
  const { state } = useAppStateStore();
  console.log('state', state);

  return (
    <div className="h-[100vh] flex">
      <pre className="hidden">{JSON.stringify(state, null, 2)}</pre>
      <Sidebar />
      <MainContent />
    </div>
  );
});

const MainContent: React.FC = () => {
  return (
    <div className="h-full w-full overflow-auto flex justify-center items-center bg-gray-100 pt-8 pb-8">
      <SidebarButton />
      <div className="a4 m-8 text-black flex flex-col gap-8">
        <Header />
        <div className="border-b border-gray-300" />
        <SubHeader />
        <InvoiceItemsTable />
        <AdditionalNotes />
      </div>
    </div>
  );
};

const SidebarButton: React.FC = () => {
  const { state, setState } = useAppStateStore();
  return !state.sidebarOpen ? (
    <button
      className="absolute top-0 left-0 transform translate-x-full w-8 h-8 flex items-center justify-center"
      onClick={() => setState('sidebarOpen', true)}
    >
      <HamburgerMenuIcon />
    </button>
  ) : null;
};

const Header: React.FC = () => {
  const { state, setState } = useAppStateStore();
  return (
    <div className="grid grid-cols-5">
      {state.logo && (
        <div className="col-span-1">
          <img
            src={state.logo}
            alt="logo"
            className="w-20 h-20 object-contain"
          />
        </div>
      )}
      <div className={state.logo ? 'col-span-3' : 'col-span-4'}>
        <Input
          className="font-semibold text-sm"
          placeholder="Business Name"
          value={state.businessName}
          onChange={(e) => {
            setState('businessName', e.target.value);
          }}
        />
        <Input
          className="font-normal text-sm"
          placeholder={`(Your Address)
(Your Phone)
(Your Email)`}
          isTextArea
          value={state.businessHeaderFreeText}
          onChange={(e) => {
            setState('businessHeaderFreeText', e.target.value);
          }}
        />
      </div>
      <div>
        {state.headerFields.map((headerField, index) => (
          <Input
            key={index}
            className="font-normal text-sm"
            labelClassName="font-semibold text-sm uppercase tracking-wider"
            label={headerField.label}
            value={headerField.value}
            placeholder={headerField.placeholder}
            onChange={(e) => {
              const newHeaderFields = [...state.headerFields];
              newHeaderFields[index].value = e.target.value;
              setState('headerFields', newHeaderFields);
            }}
            onLabelChange={(e) => {
              const newHeaderFields = [...state.headerFields];
              newHeaderFields[index].label = e.target.value;
              setState('headerFields', newHeaderFields);
            }}
          />
        ))}
      </div>
    </div>
  );
};

const SubHeader: React.FC = () => {
  const { state, setState } = useAppStateStore();
  return (
    <div className="grid grid-cols-4">
      <div className="col-span-3">
        <Input
          className="font-semibold text-2xl"
          placeholder="Tax Invoice"
          value={state.invoiceSubheader}
          onChange={(e) => {
            setState('invoiceSubheader', e.target.value);
          }}
        />
        <Input
          className="font-normal text-sm"
          placeholder={`(Customer Name)
(Customer Address)`}
          isTextArea
          value={state.invoiceSubheaderFreeText}
          onChange={(e) => {
            setState('invoiceSubheaderFreeText', e.target.value);
          }}
        />
      </div>
    </div>
  );
};

const InvoiceItemsTable: React.FC = () => {
  const { state, setState, formatAsCurrency } = useAppStateStore();
  const lineItems = state.lineItems;
  const setLineItems = (lineItems: typeof state.lineItems) =>
    setState('lineItems', lineItems);

  const subtotal = lineItems.reduce(
    (acc, lineItem) => acc + (lineItem.price || 0) * (lineItem.quantity || 0),
    0,
  );
  const taxPercent = state.taxRate;
  const tax = subtotal * (taxPercent || 0);
  const total = subtotal + tax;
  return (
    <div>
      <div className="border-y border-gray-300 grid grid-cols-8 py-2">
        <span className="col-span-5 uppercase tracking-wider font-semibold text-sm">
          Item
        </span>
        <span className="col-span-1 uppercase tracking-wider font-semibold text-sm">
          Qty
        </span>
        <span className="col-span-1 uppercase tracking-wider font-semibold text-sm">
          Price
        </span>
        <span className="col-span-1 uppercase tracking-wider font-semibold text-sm">
          Amount
        </span>
      </div>
      {lineItems.map((lineItem, index) => (
        <div
          key={index}
          className="relative border-b border-gray-300 grid grid-cols-8 py-2 group"
        >
          <button
            className="absolute left-0 transform -translate-x-full opacity-0 group-hover:opacity-100 flex w-8 h-8 items-center justify-center"
            onClick={() => {
              const nextLineItems = lineItems.filter((_, idx) => idx !== index);
              setLineItems(nextLineItems);
            }}
          >
            <Cross1Icon />
          </button>
          <div className="col-span-5">
            <Input
              className="font-normal text-sm"
              placeholder="Item name"
              value={lineItem.name}
              onChange={(e) => {
                const newLineItems = [...lineItems];
                newLineItems[index].name = e.target.value;
                setLineItems(newLineItems);
              }}
            />
            <Input
              className="font-light text-sm"
              placeholder="Describe your item (optional)"
              value={lineItem.description}
              onChange={(e) => {
                const newLineItems = [...lineItems];
                newLineItems[index].description = e.target.value;
                setLineItems(newLineItems);
              }}
            />
          </div>
          <div className="col-span-1 flex items-center">
            <Input
              className="font-normal text-sm"
              placeholder="0"
              type="number"
              value={lineItem.quantity as any}
              onChange={(e) => {
                const newLineItems = [...lineItems];
                if (e.target.value === '') {
                  newLineItems[index].quantity = undefined;
                  setLineItems(newLineItems);
                  return;
                }
                newLineItems[index].quantity = Number(e.target.value);
                setLineItems(newLineItems);
              }}
            />
          </div>
          <div className="col-span-1 flex items-center">
            <Input
              className="font-normal text-sm"
              placeholder="0.00"
              type="number"
              value={lineItem.price as any}
              onChange={(e) => {
                const newLineItems = [...lineItems];
                if (e.target.value === '') {
                  newLineItems[index].price = undefined;
                  setLineItems(newLineItems);
                  return;
                }
                newLineItems[index].price = Number(e.target.value);
                setLineItems(newLineItems);
              }}
            />
          </div>
          <div className="col-span-1 flex items-center">
            <span className="font-normal text-sm">
              {formatAsCurrency(
                (lineItem.price || 0) * (lineItem.quantity || 0),
              )}
            </span>
          </div>
        </div>
      ))}
      <div className="grid grid-cols-8 mt-4">
        <div className="col-span-5">
          <button
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            onClick={() => {
              setLineItems([
                ...lineItems,
                {
                  name: '',
                  description: '',
                  quantity: 0,
                  price: 0,
                },
              ]);
            }}
          >
            <span>Add Item</span>
            <span>+</span>
          </button>
        </div>
        <div className="col-span-1">
          <span className="font-semibold text-sm uppercase tracking-wider">
            Subtotal
          </span>
        </div>
        <div className="col-span-1" />
        <div className="col-span-1">
          <span className="font-semibold text-sm">
            {formatAsCurrency(subtotal)}
          </span>
        </div>
      </div>
      {taxPercent !== null && (
        <div className="grid grid-cols-8 mt-4">
          <div className="col-span-5"></div>
          <div className="col-span-1">
            <span className="font-semibold text-sm uppercase tracking-wider">
              Tax
            </span>
          </div>
          <div className="col-span-1" />
          <div className="col-span-1">
            <span className="font-semibold text-sm">
              {formatAsCurrency(tax)}
            </span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-8 mt-4">
        <div className="col-span-5"></div>
        <div className="col-span-1">
          <span className="font-semibold text-sm uppercase tracking-wider">
            Total
          </span>
        </div>
        <div className="col-span-1" />
        <div className="col-span-1">
          <span className="font-semibold text-sm">
            {formatAsCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

const AdditionalNotes: React.FC = () => {
  const { state, setState } = useAppStateStore();
  return (
    <div className="border-t border-gray-300">
      <Input
        label={state.notesLabel}
        onLabelChange={(e) => {
          setState('notesLabel', e.target.value);
        }}
        value={state.notesFreeText}
        onChange={(e) => {
          setState('notesFreeText', e.target.value);
        }}
        className="font-normal text-sm mt-2"
        labelClassName="font-semibold text-sm uppercase tracking-wider"
        placeholder="Additional notes"
        isTextArea
      />
    </div>
  );
};
