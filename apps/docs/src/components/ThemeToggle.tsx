import { Button } from "@quickadui/core";
import type { ThemeMode } from "@quickadui/theme";
import { useTheme } from "@quickadui/theme";

const MODES: ThemeMode[] = ["light", "dark", "system"];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-1 rounded-md bg-neutral-3 p-1">
      {MODES.map((mode) => (
        <Button
          key={mode}
          type="button"
          variant={theme === mode ? "solid" : "ghost"}
          size="sm"
          onClick={() => setTheme(mode)}
        >
          {mode}
        </Button>
      ))}
    </div>
  );
}
