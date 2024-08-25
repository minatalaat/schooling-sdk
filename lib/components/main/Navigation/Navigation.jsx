import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Navbar from './Navbar/Navbar';
import SideMenu from './SideMenu/SideMenu';
import TourGuide from './TourGuide/TourGuide';

export default function Navigation() {
  const isTourStore = useSelector(state => state.tourSteps.isTour);
  const { firstLogin } = useSelector(state => state.auth);

  const [isTour, setIsTour] = useState(isTourStore ? isTourStore : 'false');
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [show, setShow] = useState(false);
  const [toggle, setToggle] = useState(true);
  const [active, setActive] = useState('Home');
  const [currentActive, setCurrentActive] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setIsTour(isTourStore);
  }, [isTourStore]);
  return (
    <>
      <Navbar
        setShowSideMenu={setShowSideMenu}
        setActive={setActive}
        showSideMenu={showSideMenu}
        toggle={toggle}
        setToggle={setToggle}
        firstLogin={firstLogin}
        show={show}
        setShow={setShow}
        isTour={isTour}
      />
      <SideMenu
        showSideMenu={showSideMenu}
        active={active}
        setActive={setActive}
        setShowSideMenu={setShowSideMenu}
        toggle={toggle}
        setToggle={setToggle}
        setShow={setShow}
        isTour={isTour}
        currentActive={currentActive}
        setCurrentActive={setCurrentActive}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
      />
      {isTour === 'true' && (
        <TourGuide
          showSideMenu={showSideMenu}
          setShowSideMenu={setShowSideMenu}
          setToggle={setToggle}
          setActive={setActive}
          setShowMenu={setShowMenu}
          setShow={setShow}
          isTour={isTour}
          setCurrentActive={setCurrentActive}
        />
      )}
    </>
  );
}
