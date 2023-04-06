import { postGenerateToken } from "@/backend";
import { Product } from "@/config/products";
import { PlusIcon, TrashIcon } from "@/fragments/icons";
import { TextField } from "@/fragments/input";
import type { NextPage } from "next";
import { useState } from "react";
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form";

const LinkBuilder: NextPage = () => {
  const [link, setLink] = useState<string>();
  const [error, setError] = useState<string>();

  // const { name, label, description } = props;
  const methods = useForm();

  const { fields, remove, insert } = useFieldArray({
    control: methods.control,
    name: "products",
  });

  const onSubmit = async (data: any) => {
    setError("");

    // Very basic error handling - This needs to be improved
    if (!data.pid) {
      setError("Unique Id is required");
      return;
    }
    if (!data.jwt) {
      setError("JWT Signing Secret is required");
      return;
    }
    if (!data.url) {
      setError("URL is required");
      return;
    }
    if (!data.currency) {
      setError("Reference price Currency is required");
      return;
    }

    const products: Product[] = data.products.map((f: any) => ({
      name: f.name,
      description: "",
      price: { amount: Number(f.value), currency: data.currency },
    }));

    if (!products.length) {
      setError("Add at least one Product");
      return;
    }

    if (!products.filter((p) => p.name && p.price.amount).length) {
      setError("Add at least one valid Product");
      return;
    }

    try {
      // Generates the token from the form data
      const response = await postGenerateToken(data.pid, products, data.jwt);

      const token = response.data?.token;

      const link = `${data.url}/pay?token=${token}`;

      // Updates the state with the generated link
      setLink(link);
    } catch (error: any) {
      setError(error.message?.info || "An Error ocurred while generating the link.");
    }
  };

  return (
    <div className="wrapper-wide flex flex-col p-16">
      <h2 className="title-xl">Payment Link builder</h2>
      <p className="text-gray-400 mt-2 title-lg">Generate a new Payment Link for sharing with your customers.</p>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="mt-8">
          <div className="box-border">
            <TextField
              name="pid"
              register={methods.register(`pid`)}
              label="Unique Id"
              placeholder="uid"
              description="A unique id to be added as part of the transaction metadata"
            />
            <TextField
              name="jwt"
              register={methods.register(`jwt`)}
              label="JWT Signing secret"
              description="This value should be the same JWT Secret you set at the moment of setting up your Container"
            />
            <TextField
              name="url"
              register={methods.register(`url`)}
              label="Your URL"
              placeholder="https://adalicious.io"
              description="This should be the public URL where your Adalicious instance is deployed. If deploying in Demeter Containers this value should be the URL generated from exposing your Container Port."
            />

            <TextField
              name="currency"
              register={methods.register(`currency`)}
              label="Reference Price Currency"
              placeholder="usd"
              description="Applies to all the products included in the Payment Link"
            />

            <p className="mt-4">Products</p>
            <p className="text-base text-gray-400">Add as many products as you need to the Payment Link</p>

            <div className="flex flex-col mt-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-center">
                  <input
                    {...methods.register(`products.${index}.name`)}
                    name={`products.${index}.name`}
                    placeholder="Product Name"
                    className="mb-4 px-6 h-12 w-full rounded-md text-base border-2 border-slate-200 placeholder-slate-400 text-slate-800 focus-visible:outline-0 border-0"
                  />

                  <input
                    {...methods.register(`products.${index}.value`)}
                    name={`products.${index}.value`}
                    placeholder="Product Price in cents"
                    className="mb-4 px-6 h-12 w-full rounded-md text-base border-2 border-slate-200 placeholder-slate-400 text-slate-800 focus-visible:outline-0 border-0"
                  />

                  <button className="btn-alert mb-4" type="button" onClick={() => remove(index)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button
                className="btn-secondary border-2 border-txpink"
                type="button"
                onClick={() => insert(fields.length, 0)}
              >
                Add <PlusIcon className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          {!!error && error !== "" && (
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
      </FormProvider>
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
