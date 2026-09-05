"use client";
import React from "react";
import { X } from "lucide-react";

export default function Chips({ value: chips, onChange, disabled }: {
    value: string[],
    onChange: (value: string[]) => void,
    disabled?: boolean
}) {
    return <div className={`border rounded-md px-3 py-1.5 flex ${disabled ? "opacity-60" : ""}`}>
        <ul className="list-none w-full flex flex-wrap items-center gap-1.5">
            {chips.map(v => <li key={v} className="">
                <span className="inline-flex items-center justify-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium w-fit whitespace-nowrap shrink-0 border-transparent bg-secondary text-secondary-foreground">
                    {v}
                    <X className={`size-4 ${disabled ? "" : "cursor-pointer"}`} onClick={disabled ? undefined : () => onChange(chips.filter(x => x != v))} />
                </span>
            </li>)}
            <li className="flex-[1_1_4rem]">
                <input type="text" disabled={disabled}
                    className="w-full border-none bg-transparent outline-none text-sm" placeholder="Add new"
                    onKeyDown={disabled ? undefined : e => {
                        if (e.key === "Enter") {
                            const enteredValue = e.currentTarget.value.trim();
                            if (enteredValue === "") return;
                            const newChip = enteredValue
                                .split(' ')
                                .map(word =>
                                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                )
                                .join(' ');

                            e.preventDefault();
                            if (binaryInsert(chips, newChip))
                                onChange(chips);

                            e.currentTarget.value = "";
                        }
                    }}
                />
            </li>
        </ul>
    </div>;
};

function binaryInsert(arr: string[], value: string) {
    if (arr.length === 0) {
        arr.push(value);
        return true;
    }

    let low = 0, high = arr.length;
    const firstCmp = arr[0].localeCompare(value);
    if (firstCmp === 0)
        return false;
    else if (firstCmp > 0)
        high = 0;
    else
        low++;

    const lastCmp = arr[arr.length - 1].localeCompare(value);
    if (lastCmp === 0)
        return false;
    else if (lastCmp < 0)
        low = high;
    else
        high--;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const cmp = arr[mid].localeCompare(value);
        if (cmp === 0) return false;
        if (cmp < 0) low = mid + 1;
        else high = mid;
    }

    arr.splice(low, 0, value);
    return true;
}