import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

export default function () {    
    return <Button className="cursor-pointer bg-blue-500" onClick={() => signIn("google")}>Iniciar Sesion</Button>
}