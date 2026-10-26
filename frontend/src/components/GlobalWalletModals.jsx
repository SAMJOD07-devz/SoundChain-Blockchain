import React from "react";
import { useWallet } from "../context/WalletContext";
import { ConnectWalletModal } from "./ConnectWalletModal";
import { AddFundsModal } from "./AddFundsModal";

export function GlobalWalletModals() {
  const {
    isConnectModalOpen,
    closeConnectModal,
    isAddFundsModalOpen,
    closeAddFundsModal,
  } = useWallet();

  return (
    <>
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={closeConnectModal}
      />
      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={closeAddFundsModal}
      />
    </>
  );
}
