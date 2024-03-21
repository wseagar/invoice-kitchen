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
import { set } from 'mobx';
import { ReloadIcon } from '@radix-ui/react-icons';

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
const EmailDialog = ({
  open,
  setOpen,
  title,
  description,
  additionalDescription,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  title: string;
  description: string;
  additionalDescription?: string;
}) => {
  const { sendInvoice } = useAppStateStore();
  const [token, setToken] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);

  const send = async () => {
    setLoading(true);
    const result = await sendInvoice(email, token);
    if (result) {
      setLoading(false);
      setSent(true);
    } else {
      setLoading(false);
      setError(
        `Something went wrong and the chef could not send your email. The chef is looking into it.`,
      );
    }
  };

  const content = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {additionalDescription && (
            <DialogDescription>{additionalDescription}</DialogDescription>
          )}
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
          {/* <Turnstile
            siteKey="0x4AAAAAAAIMHH3XH4HezMXA"
            onSuccess={setToken}
            options={{
              theme: 'light',
              appearance: 'interaction-only',
            }}
          /> */}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={!email || loading}
            onClick={() => send()}
          >
            {loading && (
              <>
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            )}
            {!loading && 'Send'}
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {sent && (
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              The chef just delivered a hot PDF invoice direct to your inbox.
            </DialogDescription>
          </DialogHeader>
        )}
        {!sent && content()}
      </DialogContent>
    </Dialog>
  );
};

const AfterPrintPdfDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => (
  <EmailDialog
    open={open}
    setOpen={setOpen}
    title="Thanks for using Invoice Kitchen!"
    description="Enter your email below and we'll send you a PDF copy of your invoice for your records."
  />
);

const EmailMePdfDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => (
  <EmailDialog
    open={open}
    setOpen={setOpen}
    title="PDF"
    description="The Invoice Chef needs a moment to finish cooking."
    additionalDescription="Enter your email below and we'll email you a copy of your invoice momentarily."
  />
);

export const TopRightButtons: React.FC = () => {
  return (
    <div id="top-right-buttons" className="absolute top-2 right-2 print:hidden">
      <NewButton />
      <PrintButton />
      <PDFButton />
      <ClearButton />
      <PresetButton />
    </div>
  );
};
