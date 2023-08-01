import React from 'react';
import { useAppStateStore } from '@/store';
import { Input } from './ui/input';

export function LogoSelector() {
  const { state, setState } = useAppStateStore();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleImageUpload = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file) {
        // We don't want to unset the current file when no file is selected
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setState('logo', reader.result as string);
      };

      reader.readAsDataURL(file);
    },
    [setState],
  );

  const clearImage = React.useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setState('logo', '');
  }, [setState]);

  return (
    <div className="grid gap-2">
      <Input
        ref={inputRef}
        type="file"
        id="logo"
        accept="image/*"
        className="cursor-pointer"
        onChange={handleImageUpload}
      />
      {state.logo && (
        <div className="relative w-full h-full p-2 rounded-md overflow-hidden">
          <img
            src={state.logo}
            alt="logo"
            className="w-full h-full object-contain"
          />
          <div
            className="absolute left-0 top-0 w-full h-full opacity-0 hover:opacity-100 bg-gray-700 bg-opacity-70 cursor-pointer"
            onClick={clearImage}
          >
            <div className="flex justify-center items-center h-full">
              <div className="text-white text-lg select-none">Remove</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
