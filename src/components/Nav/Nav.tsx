import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import useFetch from "hooks/useFeth";
import StyledNav, {
  StyledNavBillOutButton,
  StyledNavContent,
  StyledNavLogo,
  StyledNavSectionButton,
  StyledNavWaiterButton,
} from "./Nav.styles";
import { logoSources } from "db/constants";
import { CategoryProps } from "types";
import Waiter from "components/Waiter/Waiter";
import BillOut from "components/BillOut/BillOut";
import { LanguageCode, NavLocales } from "db/constants";
import Toast from "components/@share/Toast/Toast";
import WaiterPagePin from "Admin/Waiter/WaiterPagePin";

interface NavProps {
  onCategorySelect: (categoryId: number | null) => void;
  selectedCategory: number | null;
  setIsOverlayActive: (value: boolean) => void;
  selectedLanguage: LanguageCode;
}

const Nav: React.FC<NavProps> = ({
  onCategorySelect,
  selectedCategory,
  setIsOverlayActive,
  selectedLanguage,
}) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const company = queryParams.get("company");

  const [data] = useFetch(
    `https://tab-order-server.vercel.app/api/categories?company=${company}&language=${selectedLanguage}`
  );
  const [showWaiter, setShowWaiter] = useState(false);
  const [showWaiterPage, setShowWaiterPage] = useState(false);
  const [showBill, setShowBill] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isToastActive, setIsToastActive] = useState(false);
  const [toastPersistent, setToastPersistent] = useState(true);
  const [isToggleCounterOn, setIsToggleCounterOn] = useState(false);

  useEffect(() => {
    if (company) {
      axios
        .get(`https://tab-order-server.vercel.app/api/toggles?company=${company}`)
        .then((response) => {
          setIsToggleCounterOn(response.data.isToggleCounterOn);
        })
        .catch((error) => {
          console.error("Error fetching toggles:", error);
        });
    }
  }, [company]);

  if (showWaiterPage) {
    return <WaiterPagePin onClose={() => {
      setShowWaiterPage(false);
      setIsOverlayActive(false);
    }}
    selectedLanguage={selectedLanguage}
    />;
  }
  

  const navLocale = NavLocales[selectedLanguage];
  const showToast = (message: string, persistent: boolean = true) => {
    setToastMessage(message);
    setToastPersistent(persistent);
    setIsToastActive(true);
  };

  const handleWaiterOpen = () => {
    setShowWaiter(true);
    setIsOverlayActive(true);
  };

  const handleWaiterClose = () => {
    setShowWaiter(false);
    setIsOverlayActive(false);
  };

  const handleBillOpen = () => {
    setShowBill(true);
    setIsOverlayActive(true);
  };

  const handleBillClose = () => {
    setShowBill(false);
    setIsOverlayActive(false);
  };

  const handleLogoClick = () => {
    setShowWaiterPage(true);
    setIsOverlayActive(true);
  };

  return (
    <>
      <StyledNav>
        <StyledNavContent>
          <StyledNavLogo onClick={handleLogoClick}>
            <img
              src={logoSources.defaultLight}
              alt="TabOrders Logo"
              style={{
                width: "100%",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            />
          </StyledNavLogo>
          <StyledNavSectionButton
            onClick={() => onCategorySelect(null)}
            style={{
              backgroundColor: selectedCategory === null ? "#ff0000" : "#dfdfdf",
              color: selectedCategory === null ? "#ffffff" : "#000",
            }}
          >
            {navLocale.allMenu}
          </StyledNavSectionButton>
          {data &&
            data.map((item: CategoryProps) => (
              <StyledNavSectionButton
                key={item.categoryId}
                onClick={() => onCategorySelect(item.categoryId)}
                style={{
                  backgroundColor:
                    selectedCategory === item.categoryId ? "#ff0000" : "#dfdfdf",
                  color: selectedCategory === item.categoryId ? "#ffffff" : "#000",
                }}
              >
                {item.categoryName}
              </StyledNavSectionButton>
            ))}
        </StyledNavContent>
        <div style={{ marginTop: "auto" }}>
          <StyledNavWaiterButton onClick={handleWaiterOpen}>
            {navLocale.callWaiter}
          </StyledNavWaiterButton>
          {showWaiter && <Waiter setShowWaiter={handleWaiterClose} />}
          <StyledNavBillOutButton onClick={handleBillOpen}>
            {navLocale.billOut}
          </StyledNavBillOutButton>
          <BillOut
            isOpen={showBill}
            onClose={handleBillClose}
            isToggleCounterOn={isToggleCounterOn}
            showToast={showToast}
          />
        </div>
      </StyledNav>
      <Toast
        message={toastMessage}
        isActive={isToastActive}
        setIsActive={setIsToastActive}
        persistent={toastPersistent}
      />
    </>
  );
};

export default Nav;
