import React from 'react';

type Props = {
    title: string;
    collapsed: boolean;
    onToggle: () => void;
    children: React.ReactNode;
};

const CollapsibleSection = ({title, collapsed, onToggle, children}: Props) => (
    <div className="mb-2">
        <div className="flex items-center gap-2">
            <span className="font-semibold">{title}</span>
            <button
                type="button"
                onClick={onToggle}
                className="text-blue-500 hover:underline"
            >
                {collapsed ? 'Mostrar Sección' : 'Ocultar Sección'}
            </button>
        </div>
        {!collapsed && <div className="mt-2">{children}</div>}
    </div>
)

export default CollapsibleSection;