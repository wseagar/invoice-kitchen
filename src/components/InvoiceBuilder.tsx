"use client";
import { ChangeEvent, FunctionComponent, useState } from "react";

function cx(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface InputProps {
  className?: string;
  labelClassName?: string;
  placeholder?: string;
  label?: string;
  isTextArea?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  [key: string]: any;
}

const Input: FunctionComponent<InputProps> = ({
  className,
  labelClassName,
  placeholder,
  label,
  isTextArea,
  value,
  onChange,
  ...rest
}) => {
  return (
    <div className={className}>
      {label && <label className={labelClassName}>{label}</label>}
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

type InvoiceLineItem = {
  name: string;
  description: string;
  quantity?: number;
  price?: number;
};

function formatAsCurrency(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="h-full w-1/5 bg-white text-black overflow-auto">
      {/* Add your sidebar content here */}
      <div>Your Content Here</div>
    </div>
  );
}

export default function InvoiceBuilder() {
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      name: "",
      description: "",
      quantity: 0,
      price: 0,
    },
  ]);

  const subtotal = lineItems.reduce(
    (acc, lineItem) => acc + (lineItem.price || 0) * (lineItem.quantity || 0),
    0
  );
  const taxPercent = 0.0;
  const tax = subtotal * taxPercent;
  const total = subtotal + tax;

  return (
    <div className="h-[100vh] flex">
      <Sidebar />
      <div className="h-full w-full overflow-auto flex justify-center items-center bg-gray-100 pt-8 pb-8">
        <div className="a4 m-8  text-black flex flex-col gap-8">
          {/* Header */}
          <div className="grid grid-cols-4">
            <div className="col-span-3">
              <Input
                className="font-semibold text-sm"
                placeholder="Business Name"
              />
              <Input
                className="font-normal text-sm"
                placeholder="Street Address, City, County, Postcode"
              />
              <Input
                className="font-normal text-sm"
                placeholder="Phone Number (Optional)"
              />
            </div>
            <div>
              <Input
                className="font-normal text-sm"
                labelClassName="font-semibold text-sm uppercase tracking-wider"
                placeholder="#12345"
                label="Invoice #"
              />
              <Input
                className="font-normal text-sm"
                labelClassName="font-semibold text-sm uppercase tracking-wider"
                placeholder="Current Date"
                label="Date"
              />
            </div>
          </div>
          {/* Divider */}
          <div className="border-b border-gray-400" />
          {/* SubHeader */}
          <div className="grid grid-cols-4">
            <div className="col-span-3">
              <Input
                className="font-semibold text-xl"
                placeholder="Tax Invoice"
              />
              <Input
                className="font-normal text-sm"
                placeholder={`(Customer Name)
(Customer Address)`}
                isTextArea
              />
            </div>
          </div>
          {/* Info */}
          {/* <div className="grid grid-cols-3 gap-2">
          <div className="border-t border-gray-400">
            <Input
              label="To"
              className="font-normal text-sm mt-2"
              labelClassName="font-semibold text-sm uppercase tracking-wider"
              placeholder="Customer name, address"
              isTextArea
            />
          </div>
          <div className="border-t border-gray-400">
            <Input
              label="Details"
              className="font-normal text-sm mt-2"
              labelClassName="font-semibold text-sm uppercase tracking-wider"
              placeholder="Description about project"
              isTextArea
            />
          </div>
          <div className="border-t border-gray-400">
            <Input
              label="Payment"
              className="font-normal text-sm mt-2"
              labelClassName="font-semibold text-sm uppercase tracking-wider"
              placeholder="Due Date: dd/mm/yyyy"
              isTextArea
            />
          </div>
        </div> */}
          {/* Invoice Items Table */}
          <div>
            <div className="border-y border-gray-400 grid grid-cols-8 py-2">
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
                className="relative border-b border-gray-400 grid grid-cols-8 py-2 group"
              >
                <button
                  className="absolute left-0 transform -translate-x-full group-hover:flex hidden w-8 h-8 items-center justify-center text-lg"
                  onClick={() => {
                    const newLineItems = [...lineItems];
                    newLineItems.splice(index, 1);
                    setLineItems(newLineItems);
                  }}
                >
                  X
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
                      if (e.target.value === "") {
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
                      if (e.target.value === "") {
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
                      (lineItem.price || 0) * (lineItem.quantity || 0)
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
                        name: "",
                        description: "",
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
          {/* Additional Notes */}
          <div className="border-t border-gray-400">
            <Input
              label="Notes"
              className="font-normal text-sm mt-2"
              labelClassName="font-semibold text-sm uppercase tracking-wider"
              placeholder="Additional notes"
              isTextArea
            />
          </div>
        </div>
      </div>
    </div>
  );
}
