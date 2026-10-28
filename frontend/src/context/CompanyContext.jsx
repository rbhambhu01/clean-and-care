import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api.js";

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getCompany()
      .then(setCompany)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <CompanyContext.Provider value={{ company, error }}>{children}</CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
