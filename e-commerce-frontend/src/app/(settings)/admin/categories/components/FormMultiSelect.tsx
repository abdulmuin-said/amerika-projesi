import React from "react";
import { Button } from "@/components/ui/button";
import { MultiSelect, MultiSelectContent, MultiSelectFooter, MultiSelectMenu, MultiSelectMenuItem, MultiSelectSearchInput, MultiSelectTrigger } from "@/components/ui/multiselect";
import { ChevronsUpDown, Settings } from "lucide-react";

interface Item {
    id: number;
    name: string;
}

type valueType = Record<number, "present" | "absent" | "present_in_parent">;

const FormMultiSelect: React.FC<{
    onChange: (event: valueType) => void;
    value: valueType;
    disabled?: boolean;
    name: string;
    items: Item[];
    onFooterClick?: () => void;
}> = ({ name, onChange, value, items, disabled, onFooterClick }) => {
    const selectedItems = items
        .filter(item => {
            const optionState = value[item.id];
            return optionState !== undefined && optionState !== "absent";
        })
        .map(item => item.name);

    return (
        <MultiSelect>
            <MultiSelectTrigger asChild>
                <Button disabled={disabled}
                    variant="outline"
                    className={`min-w-0 w-full justify-between ${selectedItems.length ? "text-gray-900": "text-gray-600"}`}
                >
                    <span className="font-normal overflow-hidden whitespace-nowrap overflow-ellipsis">{selectedItems.length ?
                        selectedItems.join(", "):
                        `Select ${name.toLowerCase()}`
                    }</span>
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </MultiSelectTrigger>
            <MultiSelectContent>
                <MultiSelectSearchInput placeholder={`Search ${name.toLowerCase()}`} />
                <MultiSelectMenu>
                    {items.map(v => {
                        const optionState = value[v.id] ?? "absent";
                        const presentInParent = optionState === "present_in_parent";

                        return <MultiSelectMenuItem key={v.id}
                            checked={optionState === "present" || presentInParent}
                            disabled={presentInParent}
                            tooltip={presentInParent ? "Present in parent category": undefined}
                            label={v.name} toggle={() => onChange({
                                ...value,
                                [v.id]: optionState === "absent"? "present": "absent"
                            })}
                        />;
                    })}
                </MultiSelectMenu>
                <MultiSelectFooter onClick={onFooterClick}>
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Manage {name.toLowerCase()}</span>
                </MultiSelectFooter>
            </MultiSelectContent>
        </MultiSelect>
    );
};

export default FormMultiSelect;