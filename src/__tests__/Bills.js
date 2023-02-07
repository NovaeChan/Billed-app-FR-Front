/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom";
import '@testing-library/jest-dom';
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js";
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";

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