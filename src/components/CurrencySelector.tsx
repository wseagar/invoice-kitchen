'use client';

import * as React from 'react';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';

import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { HoverCard, HoverCardContent } from './ui/hover-card';
import { useAppStateStore } from '@/store';

const CURRENCIES = [
  { name: 'United States Dollar', value: 'USD' },
  { name: 'Euro', value: 'EUR' },
  { name: 'British Pound', value: 'GBP' },
  { name: 'Canadian Dollar', value: 'CAD' },
  { name: 'Australian Dollar', value: 'AUD' },
  { name: 'Japanese Yen', value: 'JPY' },
  { name: 'Swiss Franc', value: 'CHF' },
  { name: 'Chinese Yuan', value: 'CNY' },
  { name: 'Swedish Krona', value: 'SEK' },
  { name: 'New Zealand Dollar', value: 'NZD' },
  { name: 'Mexican Peso', value: 'MXN' },
  { name: 'Singapore Dollar', value: 'SGD' },
  { name: 'Hong Kong Dollar', value: 'HKD' },
  { name: 'Norwegian Krone', value: 'NOK' },
  { name: 'South Korean Won', value: 'KRW' },
  { name: 'Turkish Lira', value: 'TRY' },
  { name: 'Russian Ruble', value: 'RUB' },
  { name: 'Indian Rupee', value: 'INR' },
  { name: 'Brazilian Real', value: 'BRL' },
  { name: 'South African Rand', value: 'ZAR' },
];

export function CurrencySelector() {
  const [open, setOpen] = React.useState(false);
  const { state, setState } = useAppStateStore();

  return (
    <div className="grid gxap-2">
      <HoverCard openDelay={200}>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Controls the currency used in the invoice.
        </HoverCardContent>
      </HoverCard>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-label="Currency"
            aria-expanded={open}
            className="flex-1 justify-between w-full"
          >
            {state.currency ? state.currency.name : 'Choose a currency'}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search currencies..." />
            <CommandEmpty>No currency found.</CommandEmpty>
            <CommandGroup heading="Currencies">
              {CURRENCIES.map((currencyListItem, i) => (
                <CommandItem
                  key={i}
                  onSelect={() => {
                    setState('currency', currencyListItem);
                    setOpen(false);
                  }}
                >
                  {currencyListItem.name}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      currencyListItem?.value === state.currency?.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
