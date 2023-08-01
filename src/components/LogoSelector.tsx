import { useAppStateStore } from "@/store";
import { Input } from "./ui/input";

export function LogoSelector() {
  const { state, setState } = useAppStateStore();
  const handleImageUpload = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setState("logo", reader.result as string);
    };

    if (!file) {
      // We don't want to unset the current file when no file is selected
      return;
    }

    reader.readAsDataURL(file);
  };

  return (
    <div className="grid gap-2">
      <Input
        type="file"
        id="logo"
        accept="image/*"
        className="cursor-pointer"
        onChange={handleImageUpload}
      />
      {state.logo && (
        <img src={state.logo} alt="logo" className="w-20 h-20 object-contain" />
      )}
    </div>
  );
}
