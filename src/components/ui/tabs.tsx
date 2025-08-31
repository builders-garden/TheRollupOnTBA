"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useQueryState } from "nuqs";
import * as React from "react";
import { cn } from "@/lib/utils";

export type TabsElement = React.ElementRef<typeof TabsPrimitive.Root>;
export type TabsProps = React.ComponentProps<typeof TabsPrimitive.Root>;
const Tabs = TabsPrimitive.Root;

export type TabsListElement = React.ElementRef<typeof TabsPrimitive.List>;
export type TabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
>;
const TabsList = React.forwardRef<TabsListElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
TabsList.displayName = TabsPrimitive.List.displayName;

export type TabsTriggerElement = React.ElementRef<typeof TabsPrimitive.Trigger>;
export type TabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
>;
const TabsTrigger = React.forwardRef<TabsTriggerElement, TabsTriggerProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        className
      )}
      {...props}
    />
  )
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export type TabsContentElement = React.ElementRef<typeof TabsPrimitive.Content>;
export type TabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;
const TabsContent = React.forwardRef<TabsContentElement, TabsContentProps>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export type UnderlinedTabsElement = React.ElementRef<typeof TabsPrimitive.Root>;
export type UnderlinedTabsProps = React.ComponentProps<
  typeof TabsPrimitive.Root
>;
const UnderlinedTabs = TabsPrimitive.Root;
UnderlinedTabs.displayName = "UnderlinedTabs";

export type UnderlinedTabsListElement = React.ElementRef<
  typeof TabsPrimitive.List
>;
export type UnderlinedTabsListProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
>;
const UnderlinedTabsList = React.forwardRef<
  UnderlinedTabsListElement,
  UnderlinedTabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-12 items-center justify-start text-muted-foreground",
      className
    )}
    {...props}
  />
));
UnderlinedTabsList.displayName = "UnderlinedTabsList";

export type UnderlinedTabsTriggerElement = React.ElementRef<
  typeof TabsPrimitive.Trigger
>;
export type UnderlinedTabsTriggerProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Trigger
> & {
  badge?: React.ReactNode;
};
const UnderlinedTabsTrigger = React.forwardRef<
  UnderlinedTabsTriggerElement,
  UnderlinedTabsTriggerProps
>(({ className, badge, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "px-2 group relative mx-2 inline-flex h-12 items-center justify-center whitespace-nowrap rounded-none border-b border-b-transparent bg-transparent pb-3 pt-3 text-sm text-muted-foreground shadow-none ring-offset-background transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-b-primary data-[state=active]:border-b-2 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:shadow-none",
      className
    )}
    {...props}
  >
    <span className="relative">
      {props.children}
      {badge && <div className="absolute -right-3 -top-1">{badge}</div>}
    </span>
  </TabsPrimitive.Trigger>
));
UnderlinedTabsTrigger.displayName = "UnderlinedTabsTrigger";

export type UnderlinedTabsContentElement = React.ElementRef<
  typeof TabsPrimitive.Content
>;
export type UnderlinedTabsContentProps = React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.Content
>;
const UnderlinedTabsContent = React.forwardRef<
  UnderlinedTabsContentElement,
  UnderlinedTabsContentProps
>((props, ref) => <TabsPrimitive.Content ref={ref} {...props} />);
UnderlinedTabsContent.displayName = "UnderlinedTabsContent";

// Add new types for query state tabs
export type TabsWithQueryStateProps = Omit<
  TabsProps,
  "value" | "onValueChange"
> & {
  queryKey: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
};

// Create a new component that wraps Tabs with query state
const TabsWithQueryState = React.forwardRef<
  TabsElement,
  TabsWithQueryStateProps
>(({ queryKey, defaultValue, ...props }, ref) => {
  const [value, setValue] = useQueryState(queryKey, {
    defaultValue,
    parse: (value: string | null) => value ?? defaultValue,
  });

  return (
    <TabsPrimitive.Root
      ref={ref}
      value={value}
      onValueChange={setValue}
      {...props}
    />
  );
});
TabsWithQueryState.displayName = "TabsWithQueryState";

// Create an underlined version with query state
const UnderlinedTabsWithQueryState = React.forwardRef<
  UnderlinedTabsElement,
  TabsWithQueryStateProps
>(({ queryKey, defaultValue, onValueChange, ...props }, ref) => {
  const [value, setValue] = useQueryState(queryKey, {
    defaultValue,
    parse: (value: string | null) => value ?? defaultValue,
  });
  const handleValueChange = (value: string) => {
    setValue(value);
    onValueChange?.(value);
  };

  return (
    <TabsPrimitive.Root
      ref={ref}
      value={value}
      onValueChange={handleValueChange}
      {...props}
    />
  );
});
UnderlinedTabsWithQueryState.displayName = "UnderlinedTabsWithQueryState";

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsWithQueryState,
  UnderlinedTabs,
  UnderlinedTabsContent,
  UnderlinedTabsList,
  UnderlinedTabsTrigger,
  UnderlinedTabsWithQueryState,
};
