type TextInputProps = {
    name?: string;
    label?: string;
    url?: string;
    value?: string;
    placeholder?: string;
    className?: string;
    containerClasses?: string;
};

export function TextField(props: TextInputProps) {
    return (
        <div className={props.containerClasses}>
            <div className="w-full relative mb-8">
                {!!props.label && (
                    <div className="flex items-center mb-1 text-gray-600">
                        <div className="label-form">{props.label}</div>
                    </div>
                )}
                <input
                    name={props.name}
                    placeholder={props.placeholder}
                    defaultValue={props.value}
                    key={props.value}
                    className="px-6 h-12 w-full rounded-md text-base border-2 border-slate-200 placeholder-slate-400 text-slate-800 focus-visible:outline-0 border-0"
                />
            </div>
        </div>
    );
}