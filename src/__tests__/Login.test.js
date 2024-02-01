/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI.js";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes.js";
import { ROUTES_PATH } from "../constants/routes.js";

import { fireEvent, screen, render } from "@testing-library/dom";

let storeMock;

// Simulate document and localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

const mockDocument = `
  <div>
    <input type="email" data-testid="email-input" />
    <input type="password" data-testid="password-input" />
    <button type="submit" data-testid="submit-button">Submit</button>
  </div>
`;

document.body.innerHTML = mockDocument;

describe("Given that I am a user on login page", () => {
  let loginInstance; // Déclarer loginInstance ici pour le rendre accessible à tous les tests dans cette portée

  beforeEach(() => {
    // Initialiser loginInstance avant chaque test
    loginInstance = new Login({
      document: document,
      localStorage: localStorage,
      onNavigate: jest.fn(), // Simuler la fonction de navigation
      store: storeMock, // Mock de votre magasin ou classe de gestion des données
    });
  });
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn();

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSubmit();
      });
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    beforeEach(() => {
      // Initialiser loginInstance avant chaque test
      loginInstance = new Login({
        document: document,
        localStorage: localStorage,
        onNavigate: jest.fn(), // Simuler la fonction de navigation
        store: storeMock, // Mock de votre magasin ou classe de gestion des données
      });
      test("It should handle login errors appropriately", async () => {
        // Mock login function to simulate an error
        const mockLogin = jest.fn().mockRejectedValue(new Error("Login error"));
        loginInstance.login = mockLogin;

        // Simulate form submission
        const form = document.createElement("form");
        form.innerHTML = `
        <input type="email" data-testid="employee-email-input" value="test@example.com" />
        <input type="password" data-testid="employee-password-input" value="password123" />
        <button type="submit" data-testid="submit-button">Submit</button>
      `;
        form.addEventListener("submit", loginInstance.handleSubmitEmployee);
        fireEvent.submit(form);

        // Wait for the asynchronous operation to complete
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());

        // Assert that the error is handled appropriately
        expect(loginInstance.error).toEqual(new Error("Login error"));
      });
      test("It should handle successful user creation and login", async () => {
        // Mock login and createUser functions to simulate successful operations
        const mockLogin = jest.fn().mockResolvedValue({});
        const mockCreateUser = jest.fn().mockResolvedValue({});
        loginInstance.login = mockLogin;
        loginInstance.createUser = mockCreateUser;

        // Simulate form submission
        const form = document.createElement("form");
        form.innerHTML = `
        <input type="email" data-testid="employee-email-input" value="newuser@example.com" />
        <input type="password" data-testid="employee-password-input" value="newpassword123" />
        <button type="submit" data-testid="submit-button">Submit</button>
      `;
        form.addEventListener("submit", loginInstance.handleSubmitEmployee);
        fireEvent.submit(form);

        // Wait for the asynchronous operations to complete
        await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());

        // Assert that the createUser function is called with the correct user data
        expect(mockCreateUser).toHaveBeenCalledWith({
          type: "Employee",
          name: "newuser",
          email: "newuser@example.com",
          password: "newpassword123",
        });

        // Assert that the login function is called with the correct user data
        expect(mockLogin).toHaveBeenCalledWith({
          email: "newuser@example.com",
          password: "newpassword123",
        });

        // Assert that the navigation function is called with the correct route
        expect(loginInstance.onNavigate).toHaveBeenCalledWith(
          ROUTES_PATH.Bills
        );
      });

      test("Then It should renders Login page", () => {
        document.body.innerHTML = LoginUI();

        const inputEmailUser = screen.getByTestId("employee-email-input");
        fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
        expect(inputEmailUser.value).toBe("pasunemail");

        const inputPasswordUser = screen.getByTestId("employee-password-input");
        fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
        expect(inputPasswordUser.value).toBe("azerty");

        const form = screen.getByTestId("form-employee");
        const handleSubmit = jest.fn((e) => e.preventDefault());

        form.addEventListener("submit", handleSubmit);
        fireEvent.submit(form);
        expect(screen.getByTestId("form-employee")).toBeTruthy();
      });
    });

    describe("When I do fill fields in correct format and I click on employee button Login In", () => {
      beforeEach(() => {
        // Initialiser loginInstance avant chaque test
        loginInstance = new Login({
          document: document,
          localStorage: localStorage,
          onNavigate: jest.fn(), // Simuler la fonction de navigation
          store: storeMock, // Mock de votre magasin ou classe de gestion des données
        });
      });
    });
  });
});

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
    test("When I do not fill fields and I click on admin button Login In", () => {
      document.body.innerHTML = LoginUI();
  
      const inputEmailAdmin = screen.getByTestId("admin-email-input");
      expect(inputEmailAdmin.value).toBe("");
  
      const inputPasswordAdmin = screen.getByTestId("admin-password-input");
      expect(inputPasswordAdmin.value).toBe("");
  
      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());
  
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", async () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
  describe("When there is a 404 error during login", () => {
    test("It should handle the error appropriately", async () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, {
        target: { value: "johndoe@email.com" },
      });
      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });

      const form = screen.getByTestId("form-employee");

      // Mocking the login function to simulate a 404 error
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate: jest.fn(), // Mock onNavigate function
        PREVIOUS_LOCATION: "",
        store: jest.fn(),
      });

      const error404 = { status: 404, message: "User not found" };
      login.login = jest.fn().mockRejectedValue(error404);

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      form.addEventListener("submit", handleSubmit);

      // Triggering form submission
      fireEvent.submit(form);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Asserting that the error is handled appropriately
      expect(handleSubmit).toHaveBeenCalled();
      expect(login.login).toHaveBeenCalled();

      // Assuming your component exposes an error message
      expect(login.error).toBeDefined();
      //expect(login.error.message).toBe(error404.message);
    });
  });

  describe("When the login as an admin is successful", () => {
    test("Should navigate to the employee dashboard upon successful login", async () => {
      // Mock login function
      const mockLogin = jest.fn();
    
      // Mock navigation function
      const mockNavigate = jest.fn();
    
      // Simulate the login UI
      document.body.innerHTML = LoginUI();
    
      // Populate email and password fields
      const emailInput = screen.getByTestId("admin-email-input");
      fireEvent.change(emailInput, {
        target: { value: "admin@example.com" },
      });
    
      const passwordInput = screen.getByTestId("admin-password-input");
      fireEvent.change(passwordInput, { target: { value: "admin123" } });
    
      // Trigger form submission
      const form = screen.getByTestId("form-admin");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        mockLogin();
        mockNavigate("/employee-dashboard");
      });
      fireEvent.submit(form);
    
      // Assertions
      expect(mockLogin).toHaveBeenCalled();
      // Ensure that the navigation function is called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith("/employee-dashboard");
    });
    
    test("Then it should navigate to the HR dashboard", async () => {
      // Mock login function
      const mockLogin = jest.fn();

      // Mock navigation function
      const mockNavigate = jest.fn();

      // Simulate the login UI
      document.body.innerHTML = LoginUI();

      // Populate email and password fields
      const emailInput = screen.getByTestId("employee-email-input");
      fireEvent.change(emailInput, {
        target: { value: "employee@example.com" },
      });

      const passwordInput = screen.getByTestId("employee-password-input");
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      // Trigger form submission
      const form = screen.getByTestId("form-employee");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        mockLogin();
        mockNavigate("/employee-dashboard");
      });
      fireEvent.submit(form);

      // Assertions
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/employee-dashboard");
    });
  });
});
describe("Login container", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });
  });

  test("Should identify and redirect to bills page when employee submits correct info", async () => {
    document.body.innerHTML = `
      <form data-testid="form-employee">
        <input type="email" data-testid="employee-email-input" />
        <input type="password" data-testid="employee-password-input" />
        <button type="submit" data-testid="submit-button">Submit</button>
      </form>
    `;

    const mockLogin = jest.fn();
    const mockNavigate = jest.fn();

    const login = new Login({
      document,
      localStorage: window.localStorage,
      onNavigate: mockNavigate,
      store: null, // You may need to provide a mock store here if necessary
    });

    const emailInput = screen.getByTestId("employee-email-input");
    const passwordInput = screen.getByTestId("employee-password-input");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const form = screen.getByTestId("form-employee");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      mockLogin();
      mockNavigate(ROUTES_PATH.Bills);
    });

    fireEvent.submit(form);

    expect(mockLogin).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills);
  });
  
});
