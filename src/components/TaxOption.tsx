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
                checked={state.taxEnabled}
                onCheckedChange={(checkedState) => {
                  const taxEnabled = !!checkedState;
                  setState('taxEnabled', taxEnabled);
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
    </div>
  );
}
