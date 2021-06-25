import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, NavbarBrand } from 'reactstrap';

export const NavigationBar: React.FC = () => {
  return (
    <Navbar color="light" light expand="md" fixed="top">
      <NavbarBrand tag={Link} to={'/'}>
        AtCoder Marathon Rating History
      </NavbarBrand>
    </Navbar>
  );
};
