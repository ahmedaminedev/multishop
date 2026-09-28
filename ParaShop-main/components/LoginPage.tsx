import React from 'react';
import { MultiShopClientAuth } from '../../src/components/MultiShopClientAuth';

interface LoginPageProps {
  onNavigateHome: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateHome, onLoginSuccess }) => {
  return (
    <MultiShopClientAuth
      isOpen={true}
      onClose={onNavigateHome}
      onNavigateHome={onNavigateHome}
      onLoginSuccess={(_user, _token) => {
        onLoginSuccess();
        onNavigateHome();
      }}
      currentShop="para"
      onSwitchShop={(shopId) => {
        document.cookie = `shop=${shopId}; path=/; max-age=31536000; SameSite=Lax`;
        localStorage.setItem('multishop_active_shop', shopId);
        window.location.search = `?mode=frontoffice&shop=${shopId}`;
      }}
    />
  );
};

export default LoginPage;
