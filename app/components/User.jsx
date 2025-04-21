import { LogIn } from "lucide-react"
import LogInButton from "./LogInButton"
import { signOut, useSession } from "next-auth/react";

export default function () {

    const { data: session } = useSession();

    return (
        <div className="absolute top-8 right-16 z-50 bg-gray-900 backdrop-blur-sm p-2 px-6 rounded-lg shadow-lg flex items-center gap-4">


            {session ? (
                <>
                    <img className="w-10 h-10 rounded-full" src={session.user?.image} alt="Profile" />
                    <p className="text-white">{session.user?.name}</p>
                    <div className="text-sm text-blue-500 cursor-pointer" onClick={() => signOut()}>Cerrar Sesion</div>
                </>
            ) :
                (
                    <>
                        <img className="w-10 h-10 rounded-full" src="/user.png" alt="Profile" />
                        <div className="flex items-center gap-2 text-white">
                            <LogIn size={20} />
                            <LogInButton />
                        </div>
                    </>
                )}
        </div>
    )
}


{/*<div>Jese Leos</div>
                <div className="text-sm text-gray-400">Joined in August 2014</div>*/}