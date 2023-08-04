'use client';

import React, { ChangeEvent, useEffect, useRef } from 'react';
import { Cross1Icon, HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Sidebar } from './Sidebar';
import { StoreContext, initStore, store, useAppStateStore } from '@/store';
import { observer } from 'mobx-react-lite';
import { HoverCard, HoverCardContent } from './ui/hover-card';
import { HoverCardTrigger } from '@radix-ui/react-hover-card';
import { TopRightButtons } from './TopRightButtons';
import { AppState } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
// @ts-ignore
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: '#business-name-input',
      popover: {
        title: 'Invoice Kitchen',
        description:
          'Click on the page to start typing. You can edit the text just like in any other text editor.',
        position: 'bottom',
      },
    },
    {
      popover: {
        title: 'Auto Save',
        description:
          'As you type, your browser automatically saves all your changes. No need to worry about losing your work!',
        position: 'top',
      },
    },
    {
      element: '#sidebar-button',
      popover: {
        title: 'Invoice Menu',
        description:
          'Here you can set tax percentage, select currency for your invoice, and update your company logo.',
        position: 'right',
      },
    },
    {
      element: '#top-right-buttons',
      popover: {
        title: 'Sidebar',
        description:
          'Here are several options. We start everyone out with a example invoice but you can click clear if you want to start from scratch.',
        position: 'left',
      },
    },
    {
      element: '#chef',
      popover: {
        title: 'Chef Tips',
        description:
          'Hover your mouse over the invoice chef and he will give you some friendly tips on how to cook up a great invoice.',
      },
    },
    {
      element: '#end-tour',
      popover: {
        title: 'End of Tutorial',
        description:
          "You're all set to create professional invoices using our online editor. Happy invoicing!",
        position: 'center',
      },
    },
  ],
});

export function cx(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Updates the height of a <textarea> when the value changes.
const useAutosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
) => {
  useEffect(() => {
    if (textAreaRef) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.style.height = '0px';
      const scrollHeight = textAreaRef.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);
};

interface TextAreaProps {
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  label?: string;
  onLabelChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rest?: any;
}

const TextArea: React.FC<TextAreaProps> = ({
  className,
  labelClassName,
  placeholder,
  label,
  onLabelChange,
  value,
  onChange,
  ...rest
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useAutosizeTextArea(textAreaRef.current, value);

  return (
    <div className={className}>
      {label && (
        <input
          value={label}
          onChange={onLabelChange}
          className={labelClassName}
        ></input>
      )}
      <textarea
        ref={textAreaRef}
        className="w-full resize-none"
        rows={4}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
};

interface InputProps {
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  label?: string;
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
      <input
        className="w-full"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...rest}
      />
    </div>
  );
};
function ClientOnly({ children }: { children: React.ReactNode }) {
  // State / Props
  const [hasMounted, setHasMounted] = React.useState(false);

  // Hooks
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  // Render
  if (!hasMounted) return null;

  return <div>{children}</div>;
}

export default function InvoiceBuilderWrapper({
  invoice,
}: {
  invoice?: AppState;
}) {
  const store = initStore(invoice);
  return (
    <ClientOnly>
      <StoreContext.Provider value={store}>
        <InvoiceBuilder />
      </StoreContext.Provider>
    </ClientOnly>
  );
}

const InvoiceBuilder = observer(() => {
  const { state, showTour } = useAppStateStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  if (searchParams.get('token')) {
    router.push('/', { scroll: false });
  }

  useEffect(() => {
    if (showTour) {
      driverObj.drive();
    }
  }, []);
  // Will: Don't remove the hidden div state here.
  // if this isn't used then state never updates in any other component.
  // I think technically every component that uses state should be wrapped in observer
  // but this works so oh well.

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
    <div className="h-full w-full overflow-auto flex justify-center items-center bg-gray-100 pt-8 pb-8 print:pt-0 print:pb-0">
      <SidebarButton />
      <TopRightButtons />
      <Chef />
      <div
        id="invoice-page"
        className="a4 shadow-lg print:shadow-none m-8 text-black flex flex-col gap-8"
      >
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
    <div id="sidebar-button" className="absolute top-2 left-2 print:hidden">
      <button
        className="p-4 flex items-center gap-2 hover:text-purple-700 "
        onClick={() => setState('sidebarOpen', true)}
      >
        <HamburgerMenuIcon /> Menu
      </button>
    </div>
  ) : null;
};

const CHEFS_TIPS = [
  'An invoice without itemised details is like spaghetti without tomato sauce - it lacks substance! Make sure to specify your charges.',
  'Payment terms should be as clear as a bellini cocktail. It keeps any disputes at bay.',
  'Your invoice should reflect your business, just like a perfect tiramisu reflects the skill of the chef.',
  'Keep your invoicing as consistent as a well-made risotto. It helps your clients know what to expect.',
  "No invoice should leave the kitchen without double checking the details - it's like tasting the sauce before you serve it.",
  'Invoice numbers should be as unique as every shape of pasta! Keep them in sequence for easier tracking.',
  "Follow up on unpaid invoices, just like you'd follow up on a missing cannoli order! Don't let them forget.",
  "No overcharging or undercharging. It's like getting the salt right in your pasta water. Be transparent!",
  "Aging? It's good for Parmigiano-Reggiano, not invoices. Aim for them to be paid pronto!",
  'For your international clients, serve your invoices in different currencies, just like offering different types of pasta.',
  'Payment methods should be varied, like the ingredients in a caponata! The more options, the better for your clients.',
  "Put your contact details in your invoice. It's like a recipe - people need to know where to ask their questions!",
  'Late payment fees are the extra kick of chili in arrabbiata sauce - must be mentioned upfront to avoid surprises!',
  "After the invoice is paid, a 'grazie' is always welcome. It's the sweet limoncello after a satisfying meal.",
];

const Chef: React.FC = () => {
  const [tipIdx, setTipIdx] = React.useState(0);
  const tip = CHEFS_TIPS[tipIdx];

  return (
    <div id="chef" className="absolute bottom-2 right-2">
      <HoverCard>
        <HoverCardTrigger>
          <img src="./chef.svg" className="w-40 h-40" />
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="text-sm">{tip}</div>
          <div className="flex justify-end">
            <button
              className="text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setTipIdx((tipIdx + 1) % CHEFS_TIPS.length);
              }}
            >
              Next tip
            </button>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
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
          id="business-name-input"
          className="font-semibold text-sm"
          placeholder="Business Name"
          value={state.businessName}
          onChange={(e) => {
            setState('businessName', e.target.value);
          }}
        />
        <TextArea
          className="font-normal text-sm"
          placeholder={`(Your Address)
(Your Phone)
(Your Email)`}
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
        <TextArea
          className="font-normal text-sm"
          placeholder={`(Customer Name)
(Customer Address)`}
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
            id="add-item-button"
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
      <TextArea
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
      />
    </div>
  );
};
