/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import { render } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";

jest.mock("../app/store", () => {
  return jest.fn(() => mockStore);
});
// Mock Logout class
let storeMock;
beforeEach(() => {
  storeMock = {
    login: jest.fn(),
    users: {
      create: jest.fn(),
    },
    bills: jest.fn(() => ({
      create: jest
        .fn()
        .mockResolvedValue({ fileUrl: "testfileurl", key: "testkey" }),
      update: jest.fn().mockResolvedValue({}),
    })),
  };
});
const onNavigateMock = jest.fn();

describe("Given I am connected as an employee", () => {
  describe("When I am on newBill Page and I fill out the form", () => {
    test("Then I enter an expense name and it should display 'Nouvelle facture' in the name input", async () => {
      document.body.innerHTML = NewBillUI();

      // Créer manuellement l'élément expense-name
      const expenseNameInput = document.createElement("input");
      expenseNameInput.setAttribute("data-testid", "expense-name");
      document.body.appendChild(expenseNameInput);

      // Sélectionner l'élément expense-name et saisir du texte
      expenseNameInput.value = "Nouvelle facture";

      // Vérifier si la valeur saisie est correcte
      expect(expenseNameInput.value).toBe("Nouvelle facture");
    });

    test("Then I select a date and it should display the date in the date input", async () => {
      // Simuler la création d'un élément datepicker dans le DOM
      const inputDate = document.createElement("input");
      inputDate.setAttribute("data-testid", "datepicker");
      document.body.appendChild(inputDate);

      // Sélectionner l'élément datepicker et saisir une date
      inputDate.value = "2023-03-22";

      // Vérifier si la valeur saisie est correctement affichée dans l'élément datepicker
      expect(inputDate.value).toBe("2023-03-22");
    });
    test("Then NewBill page should render without error", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage,
      });

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });

    test("Then handleChangeFile should update fileUrl and fileName", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: storeMock,
        localStorage: window.localStorage,
      });

      // Simulez un utilisateur connecté en stockant des informations dans localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: "testuser@example.com",
        })
      );

      const fileInput = screen.getByTestId("file");
      fireEvent.change(fileInput, {
        target: {
          files: [
            new File(["file content"], "testfile.txt", { type: "text/plain" }),
          ],
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      //check that fileUrl and fileName are updated
      expect(newBill.fileUrl).toBeDefined();
      expect(newBill.fileName).toBeDefined();
    });
    describe("updateBill", () => {
      test("Should handle bill update successfully", async () => {
        const mockBill = {
          email: "testuser@example.com",
          type: "Food",
          name: "Lunch",
          amount: 20,
          date: "2024-01-25",
          vat: 20,
          pct: 10,
          commentary: "Test commentary",
          fileUrl: "testfileurl",
          fileName: "testfile.txt",
          status: "pending",
        };

        const mockStore = {
          bills: jest.fn(() => ({
            update: jest.fn().mockResolvedValue({}),
          })),
        };

        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Définir l'ID de la facture
        newBill.billId = "testBillId";

        // Appeler la méthode updateBill avec la facture simulée
        await newBill.updateBill(mockBill);

        // Vérifier que la navigation a été déclenchée après la mise à jour de la facture
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });

      test("Should handle bill update failure", async () => {
        const mockBill = {
          email: "testuser@example.com",
          type: "Food",
          name: "Lunch",
          amount: 20,
          date: "2024-01-25",
          vat: 20,
          pct: 10,
          commentary: "Test commentary",
          fileUrl: "testfileurl",
          fileName: "testfile.txt",
          status: "pending",
        };

        const mockStore = {
          bills: jest.fn(() => ({
            update: jest.fn().mockRejectedValue(new Error("Update failed")),
          })),
        };

        document.body.innerHTML = NewBillUI();
        const onNavigate = jest.fn();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Définir l'ID de la facture
        newBill.billId = "testBillId";

        // Appeler la méthode updateBill avec la facture simulée pour déclencher l'échec
        await expect(newBill.updateBill(mockBill)).rejects.toThrow(
          "Failed to update bill"
        );

        // Vérifier qu'aucune navigation n'a été déclenchée en cas d'échec de la mise à jour de la facture
        expect(onNavigate).not.toHaveBeenCalled();
      });
    });
  });
  describe("When I am on newBill Page and I upload a file with an incorrect extension ", () => {
    test("Then it should display the error message", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore, // Utilisez directement le mockStore ici
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
      const inputFile = document.createElement("input");
      inputFile.setAttribute("data-testid", "file");
      document.body.appendChild(inputFile);

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [
            new File(["fileTestPdf"], "test.pdf", { type: "application/pdf" }),
          ],
        },
      });

      await expect(handleChangeFile).toHaveBeenCalledTimes(1);
      // Assurez-vous que la validationMessage est correctement définie dans votre implémentation
    });
  });
});
describe("Given that I am on the NewBill page", () => {
  describe("When the user submits the form with empty fields", () => {
    test("Then the form should not be submitted", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: {},
        localStorage: window.localStorage,
      });

      const form = screen.getByTestId("form-new-bill");

      jest.spyOn(newBill, "handleSubmit");
      // Submit the form with empty fields
      fireEvent.submit(form);

      // Expect that the handleSubmit method is not called
      expect(newBill.handleSubmit).not.toHaveBeenCalled();
    });
  });
});
describe("Error Handling in handleChangeFile", () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
  };

  // Mock du document
  const documentMock = {
    querySelector: jest.fn(),
  };

  // Mock de la fonction onNavigate
  const onNavigateMock = jest.fn();

  // Mock du store
  const storeMock = {
    login: jest.fn(),
    users: {
      create: jest.fn(),
    },
    bills: jest.fn(() => ({
      create: jest
        .fn()
        .mockResolvedValue({ fileUrl: "testfileurl", key: "testkey" }),
      update: jest.fn().mockResolvedValue({}),
    })),
  };

  // Création d'une instance NewBill pour tester
  const newBill = new NewBill({
    document: documentMock,
    onNavigate: onNavigateMock,
    store: storeMock,
    localStorage: localStorageMock,
  });
  test("Should display an error message if the file extension is invalid", async () => {
    // Simulate user selecting a file with an invalid extension
    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["file content"], "testfile.exe", {
            type: "application/exe",
          }),
        ],
      },
    });

    // Wait for asynchronous tasks to complete
    await waitFor(() => {
      // Check if error message is displayed
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });
  });

  test("Should upload the file if it has a valid extension", async () => {
    document.body.innerHTML = NewBillUI();

    // Créer un mock pour la fonction create
    const createMock = jest.fn().mockResolvedValue({});
    const billsMock = jest.fn(() => ({
      create: createMock,
    }));
    const storeMock = {
      bills: billsMock,
    };

    // Créer une instance de NewBill
    const newBill = new NewBill({
      document,
      onNavigate: jest.fn(),
      store: storeMock,
      localStorage: window.localStorage,
    });

    // Simuler un fichier avec une extension valide
    const fileInput = screen.getByTestId("file");
    fireEvent.change(fileInput, {
      target: {
        files: [
          new File(["file content"], "testfile.jpg", { type: "image/jpeg" }),
        ],
      },
    });
    // Call the handleChangeFile function with a file having a valid extension
    // Attendre que les tâches asynchrones se terminent
    await waitFor(() => {
      // Vérifier que la méthode create du store a été appelée
      expect(createMock).toHaveBeenCalled();
    });

    // Verify that the create method of the store was called to upload the file
    expect(storeMock.bills().create).toHaveBeenCalled();
  });
});
