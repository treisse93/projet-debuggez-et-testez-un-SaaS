import { ROUTES_PATH } from "../constants/routes.js";

export let PREVIOUS_LOCATION = "";

export default class Login {
  constructor({ document, localStorage, onNavigate, store }) {
    this.document = document;
    this.localStorage = localStorage;
    this.onNavigate = onNavigate;
    this.store = store;

    const formEmployee = this.document.querySelector(
      `form[data-testid="form-employee"]`
    );
    if (formEmployee) {
      formEmployee.addEventListener("submit", this.handleSubmitEmployee);
    }

    const formAdmin = this.document.querySelector(
      `form[data-testid="form-admin"]`
    );
    if (formAdmin) {
      formAdmin.addEventListener("submit", this.handleSubmitAdmin);
    }
  }

  handleSubmitEmployee = async (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector(
      `input[data-testid="employee-email-input"]`
    );
    const passwordInput = e.target.querySelector(
      `input[data-testid="employee-password-input"]`
    );

    if (emailInput && passwordInput) {
      const user = {
        type: "Employee",
        email: emailInput.value,
        password: passwordInput.value,
        status: "connected",
      };
      this.localStorage.setItem("user", JSON.stringify(user));
      this.handleLoginAndNavigation(user, ROUTES_PATH.Bills);
    }
    try {
      // Tentative de connexion
      await this.login(user);

      // Si la connexion réussit, effectuez d'autres actions nécessaires
      this.onNavigate(route);
      this.PREVIOUS_LOCATION = route;
      this.document.body.style.backgroundColor = "#fff";
    } catch (error) {
      // En cas d'erreur lors de la connexion
      this.error = error; // Assurez-vous que la propriété error est définie ici
      console.error("Login error:", error);
    }
  };

  handleSubmitAdmin = (e) => {
    e.preventDefault();
    const emailInput = e.target.querySelector(
      `input[data-testid="admin-email-input"]`
    );
    const passwordInput = e.target.querySelector(
      `input[data-testid="admin-password-input"]`
    );

    if (emailInput && passwordInput) {
      const user = {
        type: "Admin",
        email: emailInput.value,
        password: passwordInput.value,
        status: "connected",
      };
      this.localStorage.setItem("user", JSON.stringify(user));
      this.handleLoginAndNavigation(user, ROUTES_PATH.Dashboard);
    }
  };

  handleLoginAndNavigation = (user, route) => {
    this.login(user)
      .catch((err) => this.createUser(user))
      .then(() => {
        this.onNavigate(route);
        this.PREVIOUS_LOCATION = route;
        PREVIOUS_LOCATION = this.PREVIOUS_LOCATION;
        this.document.body.style.backgroundColor = "#fff";
      });
  };

  login = (user) => {
    if (this.store) {
      return this.store
        .login(
          JSON.stringify({
            email: user.email,
            password: user.password,
          })
        )
        .then(({ jwt }) => {
          localStorage.setItem("jwt", jwt);
        })
        .catch((error) => {
          if (error.status === 404) {
            // Handle 404 error here
            console.error("User not found");
            throw new Error("User not found");
          } else {
            // Handle other errors
            console.error("Error during login:", error);
            throw error;
          }
        });
    } else {
      return Promise.resolve(); // Return a resolved promise if this.store is not available
    }
  };

  createUser = (user) => {
    if (this.store && typeof this.store.users === "function") {
      return this.store
        .users()
        .create({
          data: JSON.stringify({
            type: user.type,
            name: user.email.split("@")[0],
            email: user.email,
            password: user.password,
          }),
        })
        .then(() => {
          console.log(`User with ${user.email} is created`);
          return this.login(user);
        });
    } else {
      return Promise.resolve(); // Return a resolved promise if this.store is not available
    }
  };
}
