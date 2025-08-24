import { Shield } from "lucide-react";
import React from "react";

const SecurityMessage = () => {
  return (
    <div className="-mb-68 mt-68 max-w-md mx-auto">
      <div className="bg-green-50 rounded-md p-3 flex items-center gap-2 justify-center">
        <Shield className="h-5 w-5 text-green-500" />
        <p className="text-sm text-gray-700">All communication is anonymous and encrypted.</p>
      </div>
    </div>
  );
};

export default SecurityMessage;
