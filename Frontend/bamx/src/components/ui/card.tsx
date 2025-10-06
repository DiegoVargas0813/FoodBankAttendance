import * as React from "react";
import { cn } from "../../utils/cn";

//React.forwardRef -> Allows the parent component to get a ref to the child component
//className -> Additional classes can be passed to the component
//...props -> Any other props will be passed to the div element
//Card.displayName -> Sets the display name for the component

//This is a card component that can be used to create card organized content in the UI.
//It has several subcomponents for different parts of the card, such as header, title, description, content, and footer.
//Essentially, it provides a structured way to create cards with consistent styling.
//Using Tailwind CSS for styling + utility classes, it allows for easy customization through the className prop.

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
));

Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({className, ...props}, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))

CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
  >(({className, ...props}, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight ", 
        className
      )}
      {...props}
    />
  ))

CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
  >(({className, ...props}, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  ))

CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
  >(({className, ...props}, ref) => (
    <div
      ref={ref}
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  ))

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
  >(({className, ...props},ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-6 pt-0", className)}
      {...props}
    />
  ))

CardFooter.displayName = "CardFooter";


export { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent };