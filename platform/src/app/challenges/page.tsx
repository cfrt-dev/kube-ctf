import DialogDemo from "./challenge";
import { challengeMock } from "./data";

export default async function ChallengesPage() {
    return (
        <div className="flex-1 flex justify-center items-center">
            <DialogDemo
                id={challengeMock.id}
                name={challengeMock.name}
                author={challengeMock.author}
                description={challengeMock.description}
                hints={challengeMock.hints}
                currentValue={challengeMock.value.currentValue}
                type={challengeMock.deploy.type}
                files={challengeMock.files}
                links={[]}
            />
        </div>
    );
}
