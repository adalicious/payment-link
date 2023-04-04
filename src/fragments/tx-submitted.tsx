/* eslint-disable @next/next/no-img-element */
import { Tenant } from "@/config/tenant";

export function TxSubmitted(props: { tenant: Tenant; txHash: string }) {
  const { tenant, txHash } = props;
  return (
    <div className="wrapper-wide flex items-center content-center">
      <div className="flex flex-col p-16">
        <img src={tenant.logo} alt="" className="w-12 object-contain" />
        <p className="title-secondary-lg mt-4">{`Pay ${tenant.name}`}</p>
        <h1 className="title-xxl text-accent2 font-semibold mt-8">
          Thank you!
        </h1>

        <h1 className="title-xl mt-2">Your transaction has been submitted</h1>
        <div className="mt-8 box-light">
          <p className="text-xs text-accent2">Transaction Hash</p>
          <p className="title-lg text-gray-600">{txHash}</p>
        </div>
      </div>
    </div>
  );
}
