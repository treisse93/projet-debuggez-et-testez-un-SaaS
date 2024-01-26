import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    if (formNewBill) {
      formNewBill.addEventListener("submit", this.handleSubmit);
    }

    const file = this.document.querySelector(`input[data-testid="file"]`);
    if (file) {
      file.addEventListener("change", this.handleChangeFile);
    }
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = async (e) => {
    e.preventDefault();
    const fileInput = this.document.querySelector(`input[data-testid="file"]`);
    const file = fileInput.files[0];
    const fileName = file.name;

    // Vérifier si le fichier est une image avec une extension valide
    const validExtensions = ["jpg", "jpeg", "png"];
    const extension = fileName.split(".").pop().toLowerCase();
    if (!validExtensions.includes(extension)) {
      // Afficher un message d'erreur
      const errorMessage = document.createElement("div");
      errorMessage.textContent =
        "Le fichier doit être au format JPG, JPEG ou PNG.";
      errorMessage.style.color = "red";
      errorMessage.setAttribute("data-testid", "error-message");
      fileInput.parentNode.appendChild(errorMessage);
      return;
    }

    // Supprimer le message d'erreur s'il existe
    const errorMessage = fileInput.parentNode.querySelector(
      '[data-testid="error-message"]'
    );
    if (errorMessage) {
      errorMessage.remove();
    }

    // Utiliser FormData pour envoyer le fichier au serveur
    const formData = new FormData();
    const email = JSON.parse(localStorage.getItem("user")).email;
    formData.append("file", file);
    formData.append("email", email);

    // Appeler la méthode create du store pour téléverser le fichier
    try {
      // Call the create method of the store to upload the file
      const { fileUrl, key } = await this.store.bills().create({
        data: formData,
        headers: {
          noContentType: true,
        },
      });
  
      // Update fileUrl and fileName
      this.billId = key;
      this.fileUrl = fileUrl;
      this.fileName = fileName;
    } catch (error) {
      console.error(error);
    }
  };
  handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };

    try {
      // Check if this.store is defined before calling updateBill
      if (this.store && this.store.bills) {
        await this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
      } else {
        console.error("Store is not defined or does not have bills property.");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    }
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store && this.store.bills) {
      return this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => {
          console.error("Error updating bill:", error);
          throw new Error("Failed to update bill"); // Rejeter la promesse avec un message d'erreur
        });
    } else {
      console.error("Store is not defined or does not have bills property.");
      throw new Error("Failed to update bill");
      return Promise.reject(
        "Store is not defined or does not have bills property."
      );
    }
  };
}
