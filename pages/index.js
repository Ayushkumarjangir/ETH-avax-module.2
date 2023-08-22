import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [amount, setAmount] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("Please connect to the METAMASK");
      return;
    }

    try {
      const accounts = await ethWallet.send("eth_requestAccounts", []);
      handleAccount(accounts[0]);
      getATMContract();
    } catch (error) {
      console.error("Error while connecting account:", error);
    }
  };

  const getATMContract = async () => {
    const signer = ethWallet.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
    getBalance();
  };

  const getBalance = async () => {
    try {
      if (atm) {
        const balance = await atm.getBalance();
        setBalance(balance.toString());
      }
    } catch (error) {
      if (error.reason) {
        console.error("Revert reason:", error.reason);
      } else {
        console.error("Error while getting balance:", error);
      }
    }
  };

  const deposit = async () => {
    if (atm && amount > 0) {
      try {
        const options = { value: ethers.utils.parseEther(amount.toString()) };
        let tx = await atm.deposit(options);
        await tx.wait();
        getBalance();
      } catch (error) {
        console.error("Error depositing:", error);
      }
    }
  };

  const withdraw = async () => {
    if (atm && amount > 0) {
      try {
        let tx = await atm.withdraw(amount);
        await tx.wait();
        getBalance();
        setAmount(0);
      } catch (error) {
        console.error("Error withdrawing:", error);
      }
    }
  };

  const disconnectAccount = () => {
    setAccount(undefined);
    setBalance(undefined);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>PInstall METAMASK from browser for transaction</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Try to connect With METAMASK</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        {account && (
          <button className="disconnect-button" onClick={disconnectAccount}>
            Disconnect Account
          </button>
        )}
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
        />
        <button className="action-button" onClick={deposit}>
          Deposit Funds
        </button>
        <button className="action-button" onClick={withdraw}>
          Withdraw Funds
        </button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to Ayush Kumar's Wallet</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #f0f0f0;
        }

        .action-button {
          background-color: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          margin: 5px;
          border-radius: 5px;
        }

        .disconnect-button {
          background-color: #dc3545;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          margin: 5px;
          border-radius: 5px;
        }
      `}</style>
    </main>
  );
}
