/* eslint-disable react/no-unescaped-entities */
export function NotFound() {
    return (
        <div className="pt-20 h-fill w-full flex flex-col justify-center items-center">
            <h1 className="text-7xl font-semibold mt-12">Not found</h1>
            <p className="text-2xl text-gray-400 mt-4 max-w-xl text-center font-light">
                We're sorry, the page you were searching for seems to have gone on an adventure.
            </p>
        </div>
    );
}