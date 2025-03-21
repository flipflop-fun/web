// ==========================================
// ============ Device Type Hook ============

import { useEffect, useState } from "react";

// ==========================================
export enum DeviceType {
  Mobile = 'mobile',
  Desktop = 'desktop'
}

// Define breakpoint
const MOBILE_BREAKPOINT = 768; // Define breakpoint

export const useDeviceType = () => {
  // Initialize device type state
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    return window.innerWidth < MOBILE_BREAKPOINT
      ? DeviceType.Mobile
      : DeviceType.Desktop;
  });

  useEffect(() => {
    // Create function to handle window resize
    const handleResize = () => {
      const width = window.innerWidth;
      const newDeviceType = width < MOBILE_BREAKPOINT
        ? DeviceType.Mobile
        : DeviceType.Desktop;

      setDeviceType(newDeviceType);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Return current device type and some helper functions
  return {
    deviceType,
    isMobile: deviceType === DeviceType.Mobile,
    isDesktop: deviceType === DeviceType.Desktop
  };
};
