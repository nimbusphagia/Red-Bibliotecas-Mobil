import { useState } from "react";
import LoanList from "./loans/LoanList";
import VisitorList from "./visitors/VisitorList";

export default function Loans() {
  const [mode, setMode] = useState<"loans" | "visitors">("loans");
  const toggle = () => setMode((m) => (m === "loans" ? "visitors" : "loans"));

  return mode === "loans" ? (
    <LoanList onToggle={toggle} />
  ) : (
    <VisitorList onToggle={toggle} />
  );
}
