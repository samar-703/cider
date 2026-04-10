import React from "react";
import LandingPage from "./LandingPage";
import ChatApp from "./ChatApp";
import { SignedIn, SignedOut } from "./auth";

function App() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <ChatApp />
      </SignedIn>
    </>
  );
}

export default App;
