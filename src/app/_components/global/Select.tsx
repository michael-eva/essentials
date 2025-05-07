import { Select as SelectComponent, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as SelectPrimitive from "@radix-ui/react-select";

interface SelectProps extends React.ComponentProps<typeof SelectPrimitive.Root> {
    options: { value: string; label: string }[];
    placeholder?: string;
    className?: string;
}

export default function Select({ options, placeholder = "Select an option", className, ...props }: SelectProps) {
    return (
        <SelectComponent {...props}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </SelectComponent>
    );
}
