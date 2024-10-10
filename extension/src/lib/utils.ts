import { ValidateResponse } from "@/types/validate.type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Open the popup as a new window and close the current popup
 * @returns void
 */
export const openAsWindow = () => {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL("index.html"), // Load the popup HTML in the new window
      type: "popup",
      width: 800, // Set desired width
      height: 600, // Set desired height
    },
    () => {
      // Close the popup after opening the new window
      window.close();
    }
  );
};

/**
 * Clear the local storage of the Chrome extension
 * @returns void
 */
export const clearChromeLocalStorage = () => {
  chrome.storage.local.clear();
};

// Helper function to normalize AJV error messages with property names
export const formatAjvErrors = (errors?: ValidateResponse.Error[]) => {
  if (!errors) return [];
  return errors.map((error) => {
    // Extract property name from instancePath or params (for "required" keyword)
    const property = error.instancePath
      ? error.instancePath.substring(1) // Remove leading slash from instancePath
      : error.params?.missingProperty; // For "required" errors

    return {
      property,
      message: error.message,
    };
  });
};
