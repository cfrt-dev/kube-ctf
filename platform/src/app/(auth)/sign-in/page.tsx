import SignInForm from "./form";

export default function SignIn() {
    return (
        <>
            <div className="flex flex-col">
                <h1 className="flex-1 font-bold text-5xl text-center mt-40">
                    Login
                </h1>
                <SignInForm />
            </div>
        </>
    );
}
