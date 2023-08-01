"use client";
import { CurrencySelector } from "./CurrencySelector";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Cross1Icon } from "@radix-ui/react-icons";
import { cx } from "./InvoiceBuilder";
import { useAppStateStore } from "@/store";
import { TaxOption } from "./TaxOption";
import { LogoSelector } from "./LogoSelector";

export function Sidebar() {
  const { setState, state } = useAppStateStore();

  return (
    <div
      className={cx(
        // todo: transition
        "h-full min-w-[300px] bg-white text-black overflow-auto",
        !state.sidebarOpen ? "hidden" : ""
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
        <span className="font-semibold text-md">Invoice Kitchen</span>
        <button onClick={() => setState("sidebarOpen", false)}>
          <Cross1Icon className="w-5 h-5" />
        </button>
      </div>
      <div className="px-4 py-2">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-0">
            <AccordionTrigger>Tax</AccordionTrigger>
            <AccordionContent>
              <TaxOption />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger>Currency</AccordionTrigger>
            <AccordionContent>
              <CurrencySelector />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Logo</AccordionTrigger>
            <AccordionContent>
              <LogoSelector />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}