import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CustomButtonProps extends ButtonProps {
  variant?: "default" | "outline" | "ghost" | "link"
}

export function CustomButton({ className, variant = "default", ...props }: CustomButtonProps) {
  const baseStyles = {
    default: "bg-[#23b5b5] text-white hover:bg-[#23b5b5]/90",
    outline: "border-[#23b5b5] text-[#23b5b5] hover:bg-[#23b5b5]/10",
    ghost: "hover:bg-[#23b5b5]/10 hover:text-[#23b5b5]",
    link: "text-[#23b5b5] underline-offset-4 hover:underline",
  }

  return (
    <Button
      className={cn(baseStyles[variant], className)}
      variant={variant === "default" ? "default" : variant}
      {...props}
    />
  )
}

