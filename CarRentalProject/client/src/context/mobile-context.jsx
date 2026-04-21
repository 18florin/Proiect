import { createContext, useContext } from "react";

export const MobileContext = createContext();

export const useMobile = () => useContext(MobileContext);
