/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import '@testing-library/jest-dom';
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I select the image file", () => {
    test("Then the file must be accepted", async () => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillF = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((f) => newBillF.handleChangeFile(f));
      const formNewBill = screen.getByTestId("form-new-bill");
      const billF = screen.getByTestId('file');

      billF.addEventListener("change", handleChangeFile);
      userEvent.upload(billF, file);

      expect(billF.files[0].name).toBeDefined();
      expect(handleChangeFile).toBeCalled();
     
      const handleSubmit = jest.fn((e) => newBillF.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);   
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})

describe("Given I am conected as an employee", () => {
  describe("When I submit a new bill", () => {
    test("Then the bill is send to the API", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", 
        JSON.stringify({
        type: "Employee"
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;
      
      const newBills = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      const newBillForm = screen.getByTestId('form-new-bill');
      expect(newBillForm).toBeTruthy();

      const handleSubmit = jest.fn((b) => newBills.handleSubmit(b));
      newBillForm.addEventListener('submit', handleSubmit);
      fireEvent.submit(newBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})