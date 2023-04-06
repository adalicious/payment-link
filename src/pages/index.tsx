/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import { NotFound } from "@/fragments/not-found";
import { Tenant } from "@/config/tenant";
import { useRouter } from "next/router";

export async function getServerSideProps() {
  const tenant: Tenant = {
    name: process.env.TENANT_NAME || "",
    logo: process.env.TENANT_LOGO || "https://demeter.run/assets/logos/txpipe.svg",
  };

  return {
    props: {
      tenant,
    },
  };
}

const Home: NextPage<{
  tenant: Tenant | null;
}> = ({ tenant }) => {
  const router = useRouter();

  if (!tenant) return <NotFound />;

  return (
    <>
      <div className="h-fill flex flex-col items-center pt-24">
        <div className="wrapper-xs box-slate flex flex-col text-center items-center p-12">
          <div className="box-slate">
            <h1 className="title-xl">{tenant.name}</h1>
            <p className="text-gray-400 mt-2 title-lg">Effortlessly create secure links to receive payments in ADA</p>
          </div>
          <button className="btn-primary mt-12 items-center" onClick={() => router.push("/linkbuilder")}>
            Create Payment Link
          </button>
        </div>

        <div className="flex mt-4 items-center">
          <p className="text-gray-400 ">
            Powered by
            <span className="hover:text-txpink ml-1">
              <a href="https://github.com/txpipe/adalicious-starter-kit">Adalicious</a>
            </span>
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
