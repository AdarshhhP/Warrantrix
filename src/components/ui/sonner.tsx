import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "system" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-white text-black border border-gray-300 shadow-lg dark:bg-gray-800 dark:text-white dark:border-gray-600",
          description: "text-gray-600 dark:text-gray-300",
          actionButton:
            "bg-blue-500 text-white hover:bg-blue-600",
          cancelButton:
            "bg-gray-200 text-black hover:bg-gray-300 dark:bg-gray-700 dark:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
