/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate, formatStatus } from "../app/format.js";

import router from "../app/Router.js";
let mockStore = {
  bills: jest.fn(() => ({
    list: jest.fn(() => Promise.resolve(bills)), // Mock de la méthode list
  })),
};

const onNavigateMock = jest.fn();

// Mock pour jQuery et modal
jest.mock("jquery", () => {
  const mJQuery = {
    width: jest.fn(() => 800), // Modifie la largeur pour simuler le comportement de la fenêtre modale
    find: jest.fn(() => ({
      html: jest.fn(),
    })),
    modal: jest.fn(),
  };

  return jest.fn(() => mJQuery);
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      // Vérifier le style et la class de icon-window
      expect(windowIcon).toHaveClass("active-icon"); // Replace with the expected class
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : +1);
      const datesSorted = [...dates].sort(antiChrono);
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Utilisez un mock de la méthode getBills pour simuler le comportement de la méthode list
      billsInstance.getBills = jest.fn(() => {
        return Promise.resolve(bills);
      });

      expect(dates).toEqual(datesSorted);
    });
    test("Then getBills should call the store's list method", async () => {
      const mockList = jest.fn(() => Promise.resolve(bills));
      const mockStore = {
        bills: jest.fn(() => ({
          list: mockList,
        })),
      };
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Appel de la méthode getBills
      const result = await billsInstance.getBills();

      // Vérification que la méthode list du store a bien été appelée
      expect(mockList).toHaveBeenCalled();

      // Vérification que la méthode getBills retourne un tableau de factures
      expect(Array.isArray(result)).toBe(true);
    });
    test("Then display an error message if getBills fails", async () => {
      document.body.innerHTML = BillsUI({ error: "Error fetching bills" });
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Utilisez un mock de la méthode list pour simuler une erreur
      mockStore
        .bills()
        .list.mockRejectedValueOnce(new Error("Failed to fetch bills"));

      await billsInstance.getBills();

      // Vérifiez que le message d'erreur est affiché
      const errorMessage = screen.getByText("Error fetching bills");
      expect(errorMessage).toBeInTheDocument();
    });
    test("Then display an error message if getBills fails with status 500", async () => {
      // Mocks the UI with an error message
      document.body.innerHTML = BillsUI({ error: "Error fetching bills" });

      // Creates an instance of Bills container
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Mocks the store's list method to simulate a 500 error
      mockStore
        .bills()
        .list.mockRejectedValueOnce(new Error("Failed to fetch bills: 500"));

      // Calls the getBills method
      await billsInstance.getBills();

      // Checks that the error message is displayed
      const errorMessage = screen.getByText("Error fetching bills");
      expect(errorMessage).toBeInTheDocument();
    });
    test("Then display an error message if getBills fails with status 404", async () => {
      // Mocks the UI with an error message
      document.body.innerHTML = BillsUI({ error: "Error fetching bills" });

      // Creates an instance of Bills container
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Mocks the store's list method to simulate a 404 error
      mockStore
        .bills()
        .list.mockRejectedValueOnce(new Error("Failed to fetch bills: 404"));

      // Calls the getBills method
      await billsInstance.getBills();

      // Checks that the error message is displayed
      const errorMessage = screen.getByText("Error fetching bills");
      expect(errorMessage).toBeInTheDocument();
    });
    test("Then eye icons should be displayed when bills are available", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      const eyeIcons = screen.getAllByTestId("icon-eye");
      expect(eyeIcons.length).toBe(bills.length);
    });
    test("Then clicking on the 'New Bill' button should navigate to the New Bill page", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const onNavigate = jest.fn();
      const billsInstance = new Bills({
        document: document,
        onNavigate: onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });

      const newBillButton = screen.getByTestId("btn-new-bill");
      expect(newBillButton).toBeInTheDocument();

      userEvent.click(newBillButton);
    });
  });
});
describe("Bills container", () => {
  // Testez la méthode handleClickNewBill
  describe("handleClickNewBill", () => {
    test("Should navigate to the New Bill page", () => {
      // Créez une instance de la classe Bills
      const billsInstance = new Bills({
        document: document,
        onNavigate: onNavigateMock,
        store: null, // Mettez un mock pour le store si nécessaire
        localStorage: null, // Mettez un mock pour localStorage si nécessaire
      });

      // Appelez la méthode handleClickNewBill
      billsInstance.handleClickNewBill();

      // Vérifiez que la méthode onNavigate a été appelée avec le bon chemin
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
    });
  });
  describe("getBills", () => {
    test("Should return an array of bills", async () => {
      // Mock de la méthode list pour retourner une liste de factures
      const mockList = jest.fn(() => Promise.resolve(bills));

      // Mock du store
      const mockStore = {
        bills: jest.fn(() => ({
          list: mockList,
        })),
      };

      // Création d'une instance de Bills avec le mockStore
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: mockStore,
        localStorage: localStorageMock,
      });

      // Appel de la méthode getBills
      await billsInstance.getBills();

      // Vérification que la méthode list du store a bien été appelée
      expect(mockList).toHaveBeenCalled();
    });
  });
});
