import pkg from "@/../package.json" with { type: "json" };
import { getUserInfo } from "@/lib/bilibili";
import { Configure } from "../components/configure";
import { LoginButton } from "../components/login-button";

export const ConfigureTemplate = async () => {
  const userInfo = await getUserInfo().catch(() => null);

  return (
    <div className="page-container py-12 md:py-20">
      <div className="mx-auto max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-balance font-extrabold text-3xl md:text-4xl tracking-tight">
            {pkg.displayName}
          </h1>
          <p className="text-muted-foreground">{pkg.description}</p>
        </div>

        {/* Content */}
        {userInfo ? <Configure userInfo={userInfo} /> : <LoginButton />}
      </div>
    </div>
  );
};
