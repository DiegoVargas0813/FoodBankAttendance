import React from 'react';

type Props = {
    title: string;
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

const CollapsibleSection = ({title, collapsed, onToggle, children}: Props) => (
    <div className="mb-2">
        <div className="flex items-center gap-2 bg-gray-300 px-2 rounded-md">
            <span className="font-semibold">{title}</span>
            <button
                type="button"
                onClick={onToggle}
                className="text-blue-500 hover:underline px-2 py-1 md:px-0 font-bold"
                aria-expanded={!collapsed}
            >
                {collapsed ? 'Mostrar' : 'Ocultar'}
            </button>
        </div>
        {!collapsed && <div className="mt-2">{children}</div>}
    </div>
)

export default CollapsibleSection;