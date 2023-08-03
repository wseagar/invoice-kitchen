import { useAppStateStore } from '@/store';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Label } from './ui/label';
import {
  CakeSlice,
  FilePlus,
  PrinterIcon,
  SaveIcon,
  XOctagon,
} from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { DialogHeader, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { Turnstile } from '@marsidev/react-turnstile';

const NewButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <button
            className="p-4 flex items-center gap-2 hover:text-purple-700 "
            onClick={() => setOpen(true)}
          >
            <FilePlus /> New
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Starts a new invoice, keeps the header and notes section intact. Also
          increments the invoice number. Clears the item table and customer
          details.
        </HoverCardContent>
      </HoverCard>
      <AreYouSureDialog mode="new" open={open} setOpen={setOpen} />
    </>
  );
};

const PrintButton = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        className="p-4 flex items-center gap-2 hover:text-purple-700 "
        onClick={() => {
          window.print();
          setOpen(true);
        }}
      >
        <PrinterIcon /> Print
      </button>
      <AfterPrintPdfDialog open={open} setOpen={setOpen} />
    </>
  );
};

const PDFButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button
        className="p-4 flex items-center gap-2 hover:text-purple-700 "
        onClick={() => setOpen(true)}
      >
        <SaveIcon /> PDF
      </button>
      <EmailMePdfDialog open={open} setOpen={setOpen} />
    </>
  );
};

const ClearButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <button
            className="p-4 flex items-center gap-2 hover:text-purple-700 "
            onClick={() => setOpen(true)}
          >
            <XOctagon /> Clear
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Resets the invoice to a blank state.
        </HoverCardContent>
      </HoverCard>
      <AreYouSureDialog mode="clear" open={open} setOpen={setOpen} />
    </>
  );
};

const AreYouSureDialog = ({
  mode,
  open,
  setOpen,
}: {
  mode: 'clear' | 'preset' | 'new';
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { clearInvoice, fillWithPresetInvoice, newInvoice } =
    useAppStateStore();
  const clearText =
    'This will clear the invoice and reset it to a blank state.';
  const presetText =
    'This will fill in the invoice with some example data to get you started.';
  const newText =
    'This will start a new invoice, keeps the header and notes section intact. Also increments the invoice number. Clears the item table and customer details.';

  const options = {
    clear: {
      text: clearText,
      action: clearInvoice,
      buttonText: 'Clear',
    },
    preset: {
      text: presetText,
      action: fillWithPresetInvoice,
      buttonText: 'Fill',
    },
    new: {
      text: newText,
      action: newInvoice,
      buttonText: 'New',
    },
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>{options[mode].text}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              options[mode].action();
              setOpen(false);
            }}
          >
            {options[mode].buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const PresetButton = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <button
            className="p-4 flex items-center gap-2 hover:text-purple-700 "
            onClick={() => setOpen(true)}
          >
            <CakeSlice /> Example
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Fills in the invoice with some example data to get you started.
        </HoverCardContent>
      </HoverCard>
      <AreYouSureDialog mode="preset" open={open} setOpen={setOpen} />
    </>
  );
};

const AfterPrintPdfDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { sendInvoice } = useAppStateStore();
  const [token, setToken] = React.useState('');
  const [email, setEmail] = React.useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thanks for using Invoice Kitchen!</DialogTitle>
          <DialogDescription>
            Enter your email below and we&apos;ll send you a PDF copy of your
            invoice for your records.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              className="col-span-3"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <Turnstile
            siteKey="0x4AAAAAAAIMHH3XH4HezMXA"
            onSuccess={setToken}
            options={{
              theme: 'light',
              appearance: 'interaction-only',
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={!email || !token}
            onClick={() => {
              sendInvoice(email, token);
            }}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const EmailMePdfDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { sendInvoice } = useAppStateStore();
  const [token, setToken] = React.useState('');
  const [email, setEmail] = React.useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>PDF</DialogTitle>
          <DialogDescription>
            The Invoice Chef needs a moment to finish cooking.
          </DialogDescription>
          <DialogDescription>
            Enter your email below and we&apos;ll email you a copy of your
            invoice momentarily.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              className="col-span-3"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <Turnstile
            siteKey="0x4AAAAAAAIMHH3XH4HezMXA"
            onSuccess={setToken}
            options={{
              theme: 'light',
              appearance: 'interaction-only',
            }}
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!email}
            onClick={() => {
              sendInvoice(email, token);
            }}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const TopRightButtons: React.FC = () => {
  return (
    <div className="absolute top-2 right-2 print:hidden">
      <NewButton />
      <PrintButton />
      <PDFButton />
      <ClearButton />
      <PresetButton />
    </div>
  );
};
