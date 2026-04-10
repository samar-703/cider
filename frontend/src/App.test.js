import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./Particles", () => () => <div data-testid="particles" />);
jest.mock("./auth", () => ({
  clerkEnabled: false,
  SignedIn: ({ children }) => null,
  SignedOut: ({ children }) => children,
  SignInAction: ({ fallback }) => fallback || null,
  useAuthState: () => ({ isSignedIn: false, isLoaded: true, user: null }),
  UserMenu: () => null,
}));

test("renders the rebuilt landing page locally", () => {
  render(<App />);
  expect(
    screen.getByText(/cider is a random video chat app for spontaneous one-on-one conversations/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/get matched with someone new from around the world/i)
  ).toBeInTheDocument();
});
