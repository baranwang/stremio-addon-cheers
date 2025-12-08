import pkg from "@/../package.json" with { type: "json" };
import { getUserInfo } from "@/lib/bilibili";
import { Configure } from "../components/configure";
import { LoginButton } from "../components/login-button";

export const ConfigureTemplate = async () => {
  const userInfo = await getUserInfo().catch(() => null);

  return (
    <div className="page-container pt-40 space-y-4">
      <div className="text-center">
        <h1 className="text-balance font-extrabold text-4xl tracking-tight">
          {pkg.displayName}
        </h1>
        <p className="mt-2 mb-4 leading-7">{pkg.description}</p>
      </div>
      <div className="max-w-lg mx-auto">
        {userInfo ? <Configure userInfo={userInfo} /> : <LoginButton />}
      </div>
    </div>
  );
};
