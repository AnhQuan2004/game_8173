import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Identity,
  Name,
  EthBalance,
} from '@coinbase/onchainkit';
import { Button } from '@/components/ui/button';

const WalletMenu = () => (
  <Wallet>
    <ConnectWallet>
      <Button variant="secondary">
        <Avatar className="h-6 w-6" />
        <Name />
      </Button>
    </ConnectWallet>
    <WalletDropdown>
      <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
        <Avatar />
        <Name />
        <Address />
        <EthBalance />
      </Identity>
      <WalletDropdownDisconnect />
    </WalletDropdown>
  </Wallet>
);

export default WalletMenu;
