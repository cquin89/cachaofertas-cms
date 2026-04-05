import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { DEBOUNCE_MS } from '@/config/constants';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
  loading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounce = DEBOUNCE_MS,
  loading,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  // Sync external value changes (e.g. clear from filters)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setLocalValue(next);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), debounce);
  }

  function handleClear() {
    setLocalValue('');
    onChange('');
  }

  // Cleanup on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className={cn('relative flex items-center', className)}>
      <span className="pointer-events-none absolute left-3 text-warm-400">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
      </span>
      <Input
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-8"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-warm-400 transition-colors hover:text-warm-700"
          aria-label="Limpiar búsqueda"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
