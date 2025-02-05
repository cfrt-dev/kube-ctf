import Header from "~/components/header";
import UserHeader from "~/components/user-header";

export default async function HomePage() {
    return (
        <>
            <Header isLoggedIn={true}>
                <UserHeader />
            </Header>
        </>
    );
}
