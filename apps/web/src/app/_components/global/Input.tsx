import { Input as InputComponent } from "@/components/ui/input";
import * as React from "react";

export default function Input(props: React.ComponentProps<"input">) {
    return (
        <InputComponent {...props} />
    )
}