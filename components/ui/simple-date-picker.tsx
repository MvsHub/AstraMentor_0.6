"use client"

import { useState } from "react"
import { Button } from "./button"
import { Input } from "./input"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Calendar } from "lucide-react"

interface SimpleDatePickerProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SimpleDatePicker({ value, onChange, placeholder = "Selecione uma data" }: SimpleDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-2">
          <Input
            type="date"
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              setIsOpen(false)
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

