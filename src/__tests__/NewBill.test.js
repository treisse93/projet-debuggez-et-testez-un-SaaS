/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, render, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES_PATH } from "../constants/routes.js";

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

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then NewBill page should render without error", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = jest.fn();
      const newBill = new NewBill({
        document,
        onNavigate,
        store: {},
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
    describe("handleChangeFile", () => {
      test("Should update fileUrl and fileName after uploading a file", async () => {
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

        const file = new File(["file content"], "testfile.txt", {
          type: "text/plain",
        });
        const fileInput = screen.getByTestId("file");
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
          expect(newBill.fileUrl).toBe("testfileurl");
          expect(newBill.fileName).toBe("testfile.txt");
        });
      });
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

        // Vérifier que la méthode update du magasin a été appelée avec les bonnes données
        expect(mockStore.bills().update).toHaveBeenCalledWith({
          data: JSON.stringify(mockBill),
          selector: "testBillId",
        });

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
          "Update failed"
        );

        // Vérifier qu'aucune navigation n'a été déclenchée en cas d'échec de la mise à jour de la facture
        expect(onNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
