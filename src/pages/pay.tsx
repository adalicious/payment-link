/* eslint-disable @next/next/no-img-element */
import { useCallback, useMemo, useState } from "react";
import { ColorRing } from "react-loader-spinner";
import type { NextPage } from "next";
import { useLovelace, useWallet, useWalletList } from "@meshsdk/react";
import { Transaction } from "@meshsdk/core";
import { Product } from "@/config/products";
import { paymentCoin } from "@/config/coin";
import { NotFound } from "@/fragments/not-found";
import { TxSubmitted } from "@/fragments/tx-submitted";
import { coinGeckoADARate } from "@/helpers/ada-rate";
import { postPublishTxSubmittedEvent } from "@/backend";
import { verify } from "njwt";
import { Tenant } from "@/config/tenant";

// Random number to identify the tx metadata content
export const METADATA_LABEL = 1894;

export async function getServerSideProps(context: { query: { token: string } }) {
  const { token } = context.query;

  try {
    const tenant: Tenant = {
      name: process.env.TENANT_NAME || "",
      logo: process.env.TENANT_LOGO || "https://demeter.run/assets/logos/txpipe.svg",
    };

    // Verifies token signature for getting the encoded claims
    const jwt = verify(token, process.env.JWT_SECRET);

    console.log(token);

    const body = jwt?.body.toJSON();

    if (!body) {
      return {
        props: {
          tenant,
          recipient: "",
          pid: "",
          products: [],
          adaRate: 0,
        },
      };
    }

    const currency = body["currency"]?.toString() || "usd";

    const adaRate = await coinGeckoADARate.fetch(currency);

    const products = (body["products"]?.valueOf() as JSON[]) || [];

    return {
      props: {
        tenant,
        pid: body["pid"]?.toString(),
        recipient: process.env.RECIPIENT!,
        products: products.map((p: any) => ({ name: p.name, price: p.price })),
        adaRate,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      props: {
        tenant: null,
        pid: "",
        recipient: "",
        products: [],
        adaRate: 0,
      },
    };
  }
}

const Home: NextPage<{
  tenant: Tenant | null;
  pid: string;
  products: Product[];
  adaRate: number;
  recipient: string;
}> = ({ tenant, pid, products, adaRate, recipient }) => {
  const { connected, wallet, connect, name, disconnect } = useWallet();
  const lovelace = useLovelace();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [txHash, setTxHash] = useState<string>();

  // Gets a list of wallets installed on user's device.
  const wallets = useWalletList();

  let totalPriceADA = 0;
  const buildAndSubmitTx = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const tx = new Transaction({ initiator: wallet }).sendLovelace(
        recipient,
        Math.floor(totalPriceADA * 1000000).toString()
      );

      tx.setMetadata(METADATA_LABEL, { pid });

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      await postPublishTxSubmittedEvent(pid, txHash);

      setTxHash(txHash);
      setLoading(false);
    } catch (error: any) {
      console.log(error);
      setLoading(false);
      setError(error.message?.info || "An Error ocurred while submitting the payment.");
    }
  }, [totalPriceADA, pid, wallet, recipient]);

  const balance: number | undefined = useMemo(() => {
    return lovelace ? parseInt((parseInt(lovelace, 10) / 1_000_000).toString(), 10) : undefined;
  }, [lovelace]);

  const formatPriceInCurrency = useCallback((value: number, currency: string) => {
    return (value / 100).toLocaleString("en-US", {
      style: "currency",
      currency: currency,
    });
  }, []);

  const formatPriceInADA = useCallback((value: number) => {
    return `${paymentCoin.symbol} ${value.toFixed(6)}`;
  }, []);

  const currency = useMemo(() => {
    return products[0].price.currency;
  }, [products]);

  const totalInCurrency = products.reduce((acc, s) => acc + s.price.amount, 0);
  const totalInADA = products.reduce((acc, s) => acc + s.price.amount, 0) / 100 / adaRate;

  if (!products.length || !tenant) return <NotFound />;

  // Transaction has been submitted
  if (txHash) {
    return <TxSubmitted tenant={tenant} txHash={txHash} />;
  }

  return (
    <div className="wrapper-wide">
      <div className="h-screen grid grid-cols-2 divide-x divide-slate-100">
        {/* Payment information overview */}
        <div className="flex flex-col p-16 bg-slate-100">
          <img src={tenant.logo} alt="" className="w-12 object-contain" />
          <p className="title-lg text-gray-600 mt-4">{`Pay ${tenant.name}`}</p>

          <p className="amount-xl mt-4">
            {/* Since all products have the same currency we pick it up from the first registry */}
            {formatPriceInCurrency(totalInCurrency, currency)}
            <span className="text-gray-400 font-light">{`/ ${formatPriceInADA(totalInADA)}`}</span>
          </p>

          <p className="title-lg mt-12">Products</p>
          <div className="box-border mt-2">
            {products.map((p) => (
              <>
                <div className="flex w-full justify-between pt-4 pb-4 border-b">
                  <p className="font-light">{p.name}</p>
                  <p>{formatPriceInCurrency(p.price.amount, p.price.currency)}</p>
                </div>
              </>
            ))}

            <div className="flex w-full justify-between pb-6 pt-6 text-gray-400 mt-12">
              <p>{`Total in ${currency}`}</p>
              <p>{formatPriceInCurrency(totalInCurrency, currency)}</p>
            </div>

            <div className="flex w-full justify-between pt-6 border-t font-semibold">
              <p>{`Total in ${paymentCoin.coin}`}</p>
              <p>{formatPriceInADA(totalInADA)}</p>
            </div>
          </div>
          <div className="flex text-center mt-4">
            <p className="text-gray-400 ">
              Powered by
              <span className="hover:text-txpink ml-1">
                <a href="https://github.com/txpipe/adalicious-starter-kit">Adalicious</a>
              </span>
            </p>
          </div>
        </div>

        {/* Wallet Connector / Payment side */}
        <div className="flex flex-col p-16">
          {/* Allows the user to connect a wallet */}
          {!connected && (
            <>
              <h2 className="title-lg text-gray-600 mb-8">Select a Wallet to Connect</h2>
              {wallets.length ? (
                wallets.map((wallet, i) => {
                  return (
                    <div
                      key={i}
                      className={`p-6 rounded-md hover:shadow-xs-black hover:bg-slate-100 transition-all cursor-pointer box-border mb-4`}
                      onClick={() => connect(wallet.name)}
                    >
                      <div className="flex">
                        <img src={wallet.icon} alt="wallet-logo" width={28} height={28} />
                        <h3 className="text-xl font-medium tracking-wide ml-2">{wallet.name}</h3>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="box-red ">
                  <p className="text-red-500">No Wallets were found in your Browser.</p>
                </div>
              )}
            </>
          )}
          {/* Displays the connected wallet information */}
          {connected && wallet && (
            <>
              <h2 className="title-lg text-gray-600 mb-8">Wallet Connected</h2>

              <div className={`p-6 rounded-md transition-all bg-slate-100`}>
                <div className="flex">
                  <img
                    src={wallets.find((wallet) => wallet.name === name)?.icon}
                    alt="wallet-logo"
                    width={28}
                    height={28}
                  />
                  <h3 className="text-xl font-medium tracking-wide ml-2">{name}</h3>
                </div>
              </div>
            </>
          )}
          {/* Loading wallet balance */}
          {connected && !lovelace && (
            <div className="mt-2 flex justify-between items-center box-border">
              <p className="text-accent2">Loading balance ...</p>
              <ColorRing
                height="40"
                width="40"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={["#DD62FD", "#E4A0F6", "#DD62FD", "#E4A0F6", "#DD62FD"]}
              />
            </div>
          )}
          {connected && !!lovelace && !balance && (
            <>
              <div className="box-border mt-4">
                <div className="flex w-full justify-between">
                  <p>Balance in Wallet</p>
                  <p>
                    ₳ {balance}.<span className="text-xs">{lovelace.substr(lovelace.length - 6)}</span>
                  </p>
                </div>
                {/* Error message is displayed if the connected wallet does not have enough balance */}

                <p className="text-red-500 mt-2 text-xs">Balance in Wallet is not enough to process the payment.</p>
              </div>
            </>
          )}
          {/* Displays the available balance in wallet and pay button */}
          {connected && !!balance && !!lovelace && (
            <>
              <div className="box-border mt-4">
                <div className="flex w-full justify-between">
                  <p>Balance in Wallet</p>
                  <p>
                    ₳ {balance}.<span className="text-xs">{lovelace.substr(lovelace.length - 6)}</span>
                  </p>
                </div>
                {/* Error message is displayed if the connected wallet does not have enough balance */}
                {balance < totalInADA && (
                  <p className="text-red-500 mt-2 text-xs">Balance in Wallet is not enough to process the payment.</p>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                {/* Pay button is disabled if the connected wallet does not have enough balance */}
                <button
                  className="btn-primary mt-4 w-full flex items-center"
                  disabled={balance < totalInADA || loading}
                  onClick={() => buildAndSubmitTx()}
                >
                  <p className="w-full text-center">{`Pay ₳ ${totalInADA.toFixed(6)}`}</p>
                </button>
                <button
                  className="btn-secondary mt-2"
                  disabled={loading}
                  onClick={() => {
                    setError("");
                    disconnect();
                  }}
                >
                  Disconnect Wallet
                </button>
              </div>
            </>
          )}
          {loading && (
            <div className="mt-2 flex justify-between items-center box-border">
              <p className="text-accent2">Processing</p>
              <ColorRing
                height="40"
                width="40"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={["#DD62FD", "#E4A0F6", "#DD62FD", "#E4A0F6", "#DD62FD"]}
              />
            </div>
          )}
          {/* Displays any error message */}
          {!!error && (
            <>
              <div className="box-red mt-4">
                <p className="text-red-500">{error}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
