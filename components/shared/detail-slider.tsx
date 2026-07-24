"use client";

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DetailField {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
}

interface DetailSliderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  fields: DetailField[];
  badges?: { label: string; variant?: "default" | "secondary" | "success" | "warning" | "destructive" }[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

export function DetailSlider({
  open,
  onOpenChange,
  title,
  subtitle,
  fields,
  badges,
  footer,
  children,
}: DetailSliderProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="text-xl">{title}</SheetTitle>
          {subtitle && (
            <SheetDescription>{subtitle}</SheetDescription>
          )}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {badges.map((badge, i) => (
                <Badge key={i} variant={badge.variant || "default"}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </SheetHeader>
        <Separator />
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-6 space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="flex items-start justify-between py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {field.icon}
                  <span>{field.label}</span>
                </div>
                <div className="text-sm font-medium text-right max-w-[60%]">
                  {field.value}
                </div>
              </div>
            ))}
            {children && (
              <>
                <Separator className="my-4" />
                {children}
              </>
            )}
          </div>
          {footer && (
            <>
              <Separator />
              <div className="p-6">{footer}</div>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
