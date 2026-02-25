import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ButtonGroup({ className, children, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={cn("inline-flex rounded-md border border-border", className)}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as { className?: string };
          return React.cloneElement(child, {
            className: cn(
              "rounded-none border-0",
              index === 0 && "rounded-l-md",
              index === React.Children.count(children) - 1 && "rounded-r-md",
              index > 0 && "border-l",
              childProps.className
            ),
          } as any);
        }
        return child;
      })}
    </div>
  );
}

