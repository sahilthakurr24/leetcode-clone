"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "~/lib/utils"

/**
 * Wrappers over react-resizable-panels v4 (Group / Panel / Separator API).
 * v4 doesn't expose a direction data-attribute, so the group's orientation is
 * shared via context for the handle's cross-axis styling.
 */
const OrientationContext = React.createContext<"horizontal" | "vertical">("horizontal")

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group>) {
  return (
    <OrientationContext.Provider value={orientation ?? "horizontal"}>
      <ResizablePrimitive.Group
        data-slot="resizable-panel-group"
        orientation={orientation}
        className={cn(
          "flex h-full w-full",
          orientation === "vertical" && "flex-col",
          className
        )}
        {...props}
      />
    </OrientationContext.Provider>
  )
}

function ResizablePanel({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("overflow-hidden", className)}
      {...props}
    />
  )
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & {
  withHandle?: boolean
}) {
  const orientation = React.useContext(OrientationContext)

  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex shrink-0 items-center justify-center transition-colors hover:bg-primary/40 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden",
        orientation === "horizontal"
          ? "w-px cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-1.5 after:-translate-x-1/2"
          : "h-px w-full cursor-row-resize after:absolute after:inset-x-0 after:top-1/2 after:h-1.5 after:-translate-y-1/2 [&>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
