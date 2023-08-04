import { useAppStateStore } from '@/store';
import { Checkbox } from './ui/checkbox';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Label } from './ui/label';
import { Input } from './ui/input';

export function TaxOption() {
  const { state, setState, enableTaxNumber, disableTaxNumber } =
    useAppStateStore();
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableTaxNumber"
                checked={state.headerFields.length === 3}
                onCheckedChange={(checkedState) => {
                  if (checkedState) {
                    enableTaxNumber();
                  } else {
                    disableTaxNumber();
                  }
                }}
              />{' '}
              <Label htmlFor="enableTaxNumber">Enable Tax Number</Label>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            align="start"
            className="w-[260px] text-sm"
            side="left"
          >
            Shows a tax number field in the header, for example a VAT or GST
            number.
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="grid gap-2">
        <HoverCard openDelay={200}>
          <HoverCardTrigger asChild>
            <div className="flex items-center gap-2">
              <Checkbox
                id="enableTax"
                checked={state.taxRate !== null}
                onCheckedChange={(checkedState) => {
                  setState('taxRate', checkedState ? 0.1 : null);
                }}
              />{' '}
              <Label htmlFor="enableTax">Enable Tax</Label>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            align="start"
            className="w-[260px] text-sm"
            side="left"
          >
            Enables tax calculation on the invoice.
          </HoverCardContent>
        </HoverCard>
      </div>
      {state.taxRate !== null && (
        <div className="grid gap-2">
          <HoverCard openDelay={200}>
            <HoverCardTrigger asChild>
              <Label htmlFor="taxRate">Tax Rate</Label>
            </HoverCardTrigger>
            <HoverCardContent
              align="start"
              className="w-[260px] text-sm"
              side="left"
            >
              The tax rate to use for the invoice.
            </HoverCardContent>
          </HoverCard>
          <Input
            type="number"
            placeholder="0.1"
            id="taxRate"
            value={state.taxRate}
            onChange={(e) => setState('taxRate', e.target.valueAsNumber)}
          />
        </div>
      )}
    </div>
  );
}
