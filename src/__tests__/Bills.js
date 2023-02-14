/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toHaveClass('active-icon');
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    describe("When I click on the new bill button", () => {
      test("Then the new bill form modal should appear", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem(
          'user', 
          JSON.stringify({
            type: 'Employee'
          })
        )
        const billsDb = new Bills({
          document, onNavigate, 
          store: null, 
          bills: bills,
          localStorage: window.localStorage
        })

        const newBillsButton = screen.getByTestId("btn-new-bill");
        const handleClickNewBill = jest.fn(billsDb.handleClickNewBill);

        newBillsButton.addEventListener('click', handleClickNewBill);
        userEvent.click(newBillsButton);

        expect(handleClickNewBill).toHaveBeenCalled();
        expect(screen.getByText('Envoyer une note de frais')).toBeTruthy();
      })
    })
    describe("When I click on the eye icon", () => {
      test("Then the modal should appear", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", 
          JSON.stringify({
          type: "Employee"
          })
        )
        const billsDashboard = new Bills({
          document, onNavigate, store: null, localStorage: window.localStorage
        })
        document.body.innerHTML = BillsUI({ data: bills })
        const handleClickIconEye = jest.fn((icon) => billsDashboard.handleClickIconEye(icon));
        const iconEyes = screen.getAllByTestId("icon-eye");
        const modale = document.getElementById('modaleFile');
        $.fn.modal = jest.fn(() => modale.classList.add("show"));
        iconEyes.forEach((iconEye) => {
          iconEye.addEventListener('click', handleClickIconEye(iconEye));
          userEvent.click(iconEye);
          expect(handleClickIconEye).toHaveBeenCalled();
        })
        expect(document.querySelector('.modal')).toBeTruthy();
      })
    })
  })

})
// Tests d'intégration
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("fetches bills from the mock API", async () => {
      localStorage.setItem("user", JSON.stringify({
        type: "Employee", 
        email: "a@a" 
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });
  });

  describe("When an error occurs on the API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
         type: "Employee", 
         email: "a@a" 
      }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    test("Fails with a 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { list: () => { return Promise.reject(new Error("Erreur 404")); }};
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/);
      expect(message).toBeTruthy();
    });
    
    test("Fails with a 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return { list: () => { return Promise.reject(new Error("Erreur 500")); }};
      });

      window.onNavigate(ROUTES_PATH.Bills);
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();
    });
  });
});