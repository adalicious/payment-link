import { postGenerateToken } from "@/backend";
import { TextField } from "@/fragments/input";
import type { NextPage } from "next";
import { useState } from "react";

const LinkBuilder: NextPage = () => {
  const [link, setLink] = useState<string>();
  const [error, setError] = useState<string>();

  // Handles the form submission
  const handleSubmit = async (event: any) => {
    event.preventDefault();

    setError("");

    const data = {
      pid: event.target.name.value,
      name: event.target.name.value,
      price: event.target.price.value,
      currency: event.target.currency.value,
      url: event.target.url.value,
      jwt: event.target.jwt.value,
    };

    // @TODO: Handle errors properly

    try {
      // Generates the token from the form data
      const response = await postGenerateToken(data.pid, data.name, data.price, data.currency, data.jwt);

      const token = response.data?.token;

      const link = `${data.url}?token=${token}`;

      // Updates the state with the generated link
      setLink(link);
    } catch (error: any) {
      setError(error.message?.info || "An Error ocurred while generating the link.");
    }
  };

  return (
    <div className="wrapper-wide flex flex-col p-16">
      <h2 className="title-xl mb-8">Payment Link builder</h2>

      <form onSubmit={handleSubmit}>
        <div className="box-border">
          <TextField name="pid" label="Unique Id" placeholder="uid" />
          <TextField name="name" label="Product Name" placeholder="Cortadito" />
          <TextField name="price" label="Product reference price in cents" placeholder="1000" />
          <TextField name="currency" label="Reference Price Currency" placeholder="usd" />
          <TextField name="url" label="service URL" placeholder="https://ada-payments.io" />
          <TextField name="jwt" label="JWT Signing secret" />
        </div>
        {!!error && (
          <>
            <div className="box-red mt-4">
              <p className="text-red-500">{error}</p>
            </div>
          </>
        )}
        <button className="btn-primary mt-4 flex items-center" type="submit">
          Generate Link
        </button>
      </form>

      {!!link && (
        <>
          <h2 className="title-lg mt-8">Link Generated</h2>

          <div className="box-border mt-4">
            <p className="text-gray-600 break-all">{link}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default LinkBuilder;
