import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyAccessCode } from "@/lib/actions/access-code";

interface AccessCodeScreenProps {
  error?: string;
}

export default function AccessCodeScreen({ error }: AccessCodeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="mb-20">
        {/* <Image 
          src="/WhistleBase logo.png" 
          alt="WhistleBase logo" 
          width={180} 
          height={40} 
          className="mx-auto"
        /> */}
      </div>

      <div className="w-full max-w-[40rem] -mt-20">
        <h1 className="text-3xl font-semibold mb-6 text-center">Thank you for speaking up</h1>

        <div className="mt-4 mb-6 w-full">
          <p className="text-gray-500 font-semibold text-[12px]">Access code</p>
          <div className="flex flex-col items-center justify-center">
            <form
              action={verifyAccessCode}
              className="space-y-6 mt-2 w-full flex flex-col items-center justify-center"
            >
              <div className="w-full">
                <Input
                  name="accessCode"
                  placeholder="Enter access code"
                  className="w-full placeholder:text-gray-400 placeholder:text-sm"
                  required
                  autoComplete="off"
                />
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>

              <Button type="submit" className="cursor-pointer">
                Continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
